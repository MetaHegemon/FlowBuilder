import * as THREE from 'three';
import DragControl from './DragControl';
import C from "../Constants";
import { SelectionBox } from './SelectionBox';
import  SelectionHelper  from './SelectHelper';
import FBS from '../FlowBuilderStore';
import TextEditor from "../three/TextEditor";

const Drag = new DragControl();

export default class{
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        this.textEditor = new TextEditor();

        this.pan = {
            active: false,
            spacePressed: false,
            camPosTo: {x: 0, y: 0},
            screenLastPos: {x: 0, y: 0}
        }
        this.select = {
            active: false,
            box: new SelectionBox( FBS.sceneControl.getCamera(), FBS.sceneControl.getScene()),
            helper: new SelectionHelper( this.box, FBS.sceneControl.renderer, 'selectBox' ),
            cLines: [],
            cNodes: []
        }

        this.screenPos = new THREE.Vector2();
        this.pointerPos3d = new THREE.Vector2();
        this.pointerDownPos = new THREE.Vector2();
        this.hovered = [];
        this.selectedOnPointerDown = null;

        this.setEvents();
    }

    setEvents(){
        FBS.dom.canvas.addEventListener('pointermove', (e)=>this.onPointerMove(e));
        FBS.dom.canvas.addEventListener('pointerdown', (e)=>this.onPointerDown(e));
        FBS.dom.canvas.addEventListener('pointerup', (e)=>this.onPointerUp(e));
        FBS.dom.canvas?.addEventListener('dblclick', (e)=>this.onDblclick(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        FBS.dom.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
        FBS.dom.canvas.addEventListener('needFullCollapse', () => this.fullCollapseNode(true));
        FBS.dom.canvas.addEventListener('needFullUnCollapse', () => this.fullCollapseNode(false));
    }

    onKeyDown(e){
        if(this.textEditor.active) return null;
        if(e.code === 'Space' && !this.pan.spacePressed) {
            this.pan.spacePressed = true;
            FBS.dom.canvas.classList.add('grab');
        } else if(e.code === 'KeyT'){
            if(!e.repeat) {
                FBS.themesControl.switch();
            }
        } else if(e.code === 'Backspace' || e.code === 'Delete'){
            if(this.select.cLines.length > 0){
                FBS.lineControl.remove(this.select.cLines);
            }
        }
    }

    onKeyUp(e){
        if(this.textEditor.active) return null;
        if(e.code === 'Space') {
            this.pan.spacePressed = false;
            FBS.dom.canvas.classList.remove('grab');
        }
    }

    onContextMenu(e){
        e.preventDefault();
    }

    onPointerDown(e){
        if(this.textEditor.active) {
            const titleIntersect = this.checkOnIntersect(this.intersects, ['title']);
            if (!titleIntersect) {
                this.textEditor.accept();
            }
        }
        this.pointerDownPos.x = this.pointerPos3d.x;
        this.pointerDownPos.y = this.pointerPos3d.y;

        if(this.pan.spacePressed || e.button === 1){
            FBS.dom.canvas.classList.remove('grab');
            FBS.dom.canvas.classList.add('grabbing');
            this.pan.active = true;
        } else {
            if (this.intersects.length > 0) {
                if (e.buttons === 1) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, ['backMountHead', 'backMountBody', 'backMountFooter']);
                    if (backMountIntersect) {
                        this.selectedOnPointerDown = backMountIntersect.object.userData.nodeClass.getMNode();
                        return null;
                    }
                    const connectorIntersect = this.checkOnIntersect(this.intersects, ['connector']);
                    if (connectorIntersect) {
                        const cPort = connectorIntersect.object.userData.portClass;
                        if(cPort.connectorActive) {
                            if (cPort.type !== 'pseudo') {
                                this.selectedOnPointerDown = connectorIntersect.object;
                                this.unselectAllLines();
                                FBS.lineControl.enable(connectorIntersect.object);
                            }
                        }
                    }
                }
            } else {
                if(e.buttons === 1) {
                    this.unselectAll();
                    this.select.active = true;
                    this.select.helper.onSelectStart(e);
                    this.select.box.startPoint.set(this.screenPos.x, this.screenPos.y, 0.5);
                }
            }
        }

        this.pan.camPosTo.x = FBS.sceneControl.camera.position.x;
        this.pan.camPosTo.y = FBS.sceneControl.camera.position.y;
    }

    onPointerMove(e) {
        this.screenPos.x = (e.clientX / FBS.dom.canvas.clientWidth) * 2 - 1;
        this.screenPos.y = -(e.clientY / FBS.dom.canvas.clientHeight) * 2 + 1;

        if (this.pan.active && (e.buttons === 1 || e.buttons === 4)) //PANNING
        {
            let dx = (this.pan.screenLastPos.x - this.screenPos.x) / FBS.sceneControl.camera.zoom;
            let dy = (this.pan.screenLastPos.y - this.screenPos.y) / FBS.sceneControl.camera.zoom;

            this.pan.camPosTo.x = this.pan.camPosTo.x + dx * FBS.sceneControl.camera.right;
            this.pan.camPosTo.y = this.pan.camPosTo.y + dy * FBS.sceneControl.camera.top;

            FBS.sceneControl.camera.position.x = FBS.sceneControl.camera.position.x + (this.pan.camPosTo.x - FBS.sceneControl.camera.position.x);
            FBS.sceneControl.camera.position.y = FBS.sceneControl.camera.position.y + (this.pan.camPosTo.y - FBS.sceneControl.camera.position.y);
        }
        else if(this.select.active) //SELECTING
        {
            this.select.helper.onSelectMove(e);
            this.unselectAllNodes();
            this.select.box.endPoint.set(this.screenPos.x, this.screenPos.y, 0.5);
            let allSelected;
            if(e.ctrlKey){
                allSelected = this.select.box.selectOnCapture();
            } else {
                allSelected = this.select.box.selectOnTouch();
            }
            for (let i = 0; i < allSelected.length; i += 1) {//'backMountHead', 'backMountBody', 'backMountFooter'
                if (allSelected[i].name !== 'backMountBody') continue;
                const cNode = allSelected[i].userData.nodeClass;
                this.addCNodeToSelected(cNode);
            }
            for (let i = 0; i < this.select.cNodes.length; i += 1) {
                this.select.cNodes[i].select();
            }
        }
        else
        {
            this.raycaster.setFromCamera(this.screenPos, FBS.sceneControl.camera);

            this.pointerPos3d.x = this.raycaster.ray.origin.x;
            this.pointerPos3d.y = this.raycaster.ray.origin.y;

            if (Drag.active) {
                Drag.dragObject(this.pointerPos3d);
                FBS.lineControl.refreshLines(Drag.getObjects());
            } else if (FBS.lineControl.active) {
                //TODO find only first intersect
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.checkOnIntersect(this.intersects, ['connectorMagnet']) &&
                    FBS.lineControl.canBeConnected(this.intersects[0].object)
                ) {
                    const cPort = this.intersects[0].object.userData.portClass;
                        const pos = cPort.getConnectorPos();
                        FBS.lineControl.drawLineFromPos(pos.x, pos.y);

                } else {
                    FBS.lineControl.drawLineFromPos(this.pointerPos3d.x, this.pointerPos3d.y);
                }
            } else {
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (e.buttons === 0) {
                    if (this.intersects.length > 0) {
                        const firstObject = this.intersects[0].object;
                        if (firstObject.name === 'portLabelText') {
                            const cPort = firstObject.userData.portClass;
                            cPort.hover();
                            this.hovered.push(firstObject);
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'footerLabel') {
                            const cNode = firstObject.userData.nodeClass;
                            cNode.hoverFooterLabel();
                            this.hovered.push(firstObject);
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'connector') {
                            const cPort = firstObject.userData.portClass;
                            if(cPort.connectorActive) {
                                if (cPort.type !== 'pseudo') {
                                    this.setCursor('pointer');
                                }
                            }
                        } else if (firstObject.name === 'line') {
                            if(FBS.lineControl.canBeSelected(firstObject)){
                                this.setCursor('pointer');
                            }
                        } else if (firstObject.name === 'collapseButton') {
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'playButton') {
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'menuButton') {
                            this.setCursor('pointer');
                        } else {
                            this.unhoverObjects(firstObject);
                            this.resetCursor();
                        }
                    } else {
                        this.unhoverObjects(null);
                        this.resetCursor();
                    }
                } else if (e.buttons === 1) {
                    if (this.selectedOnPointerDown) {
                        if (this.selectedOnPointerDown.name === 'node') {
                            if (this.isMoved(this.pointerPos3d, this.pointerDownPos)) {
                                const backMountIntersect = this.checkOnIntersect(this.intersects, ['backMountHead', 'backMountBody', 'backMountFooter']);
                                if (backMountIntersect) {

                                    const cNode = backMountIntersect.object.userData.nodeClass;
                                    let objectsForDrag;
                                    if(cNode.isSelected()){
                                        objectsForDrag = this.select.cNodes;
                                        objectsForDrag.sort((a, b) => {
                                            return a === cNode ? -1 : cNode === b;
                                        });
                                    } else {
                                        objectsForDrag = [cNode];
                                    }

                                    Drag.enable(objectsForDrag, this.pointerPos3d);
                                    this.setCursor('move');
                                }
                            }
                        } else if (this.selectedOnPointerDown.name === 'connector') {
                            const firstObject = this.intersects[0].object;
                            if (firstObject.name === 'connector') {
                                FBS.lineControl.enable(firstObject);
                            }
                        }
                    } else {

                    }
                } else {

                }
            }
        }

        this.pan.screenLastPos.x = this.screenPos.x;
        this.pan.screenLastPos.y = this.screenPos.y;
    }

    onPointerUp(e){
        if(this.pan.active){
            this.pan.active = false;
            if(this.pan.spacePressed) {
                FBS.dom.canvas.classList.add('grab');
            } else {
                FBS.dom.canvas.classList.remove('grab');
            }
            FBS.dom.canvas.classList.remove('grabbing');
        } else if(this.select.active){
            this.select.active = false;
            this.select.helper.onSelectOver(e);
        } else {
            this.selectedOnPointerDown = null;
            if (Drag.active) {
                Drag.disable();
                this.resetCursor();
            } else if (FBS.lineControl.active) {
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.intersects[0].object.name === 'connector' &&
                    FBS.lineControl.canBeConnected(this.intersects[0].object)
                ) {
                    FBS.lineControl.connect(this.intersects[0].object);
                } else {
                    FBS.lineControl.disable();
                }
            } else {
                if (this.intersects.length > 0) {
                    if (e.button === 0) {
                        if (this.intersects[0].object.name === 'collapseButton') {
                            this.onCollapseButtonClick(this.intersects[0].object);
                        } else if (this.intersects[0].object.name === 'playButton') {
                            this.onPlayButtonClick(this.intersects[0].object);
                        } else if (this.intersects[0].object.name === 'menuButton') {
                            this.onMenuButtonClick(this.intersects[0].object);
                        } else if(this.intersects[0].object.name === 'portLabelText'){
                            this.onPortLabelClick(this.intersects[0].object);
                        } else {
                            const backMountIntersect = this.checkOnIntersect(this.intersects, ['backMountHead', 'backMountBody', 'backMountFooter']);
                            if (backMountIntersect) {
                                const cNode = backMountIntersect.object.userData.nodeClass;
                                this.onNodeClick(cNode, e.shiftKey, e.ctrlKey);
                            } else if (this.intersects[0].object.name === 'line') {
                                if(FBS.lineControl.canBeSelected(this.intersects[0].object)){
                                    const cLine = this.intersects[0].object.userData.class;
                                    this.onLineClick(cLine);
                                }
                            }
                        }
                    }
                } else {

                }
            }
            this.pointerDownPos.x = this.pointerDownPos.y = 0;
        }
    }

    onDblclick(){
        if(this.intersects.length > 0) {
            const titleIntersect = this.checkOnIntersect(this.intersects, ['title']);
            if(!this.textEditor.active){
                this.textEditor.enable(titleIntersect.object);
            }
        }
    }

    onPortLabelClick(mPort){
        const cPort = mPort.userData.portClass;
        if(cPort.type === 'pseudo'){
            const cNode = cPort.getCNode();
            cNode.shortCollapsePorts(cPort);
            this.switchLinesOnPseudoPorts(cPort);
        }
    }

    switchLinesOnPseudoPorts(cPseudoPort){
        //Если порты скрыты, то псевдопорту присваиваются все линии,
        //Если порты показаны, то псевдопорту присваиваются все скрытые линии скрытых портов, т.е. пустой массив
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        const allCLines = [];
        for(let i = 0; i < hidedCPorts.length; i += 1){
            allCLines.push(...hidedCPorts[i].getCLines());
        }
        cPseudoPort.setCLines(allCLines);

        const cNode = cPseudoPort.getCNode();
        const mNode = cNode.getMNode();
        FBS.lineControl.refreshLines([mNode]);
    }

    onCollapseButtonClick(mCollapse){
        const cNode = mCollapse.userData.nodeClass;
        cNode.middleCollapsePorts();
    }

    fullCollapseNode(isNeedCollapse){
        const cNodes = FBS.nodeControl.getCNodes();
        cNodes.map((node)=>{
            node.fullCollapseNode(isNeedCollapse);
        });
    }

    onPlayButtonClick(mPlay){
        const cNode = mPlay.userData.nodeClass;
        cNode.play(mPlay);
    }

    onMenuButtonClick(){

    }

    unhoverObjects(currentObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === currentObject) continue;
            if(this.hovered[i].name === 'portLabelText'){
                const cPort = this.hovered[i].userData.portClass;
                cPort.unhover();
            } else if(this.hovered[i].name === 'footerLabel'){
                const cNode = this.hovered[i].userData.nodeClass;
                cNode.unhoverFooterLabel();
            }
            this.hovered.splice(i, 1);
            i -= 1;
        }
    }

    checkOnIntersect(intersects, names){
        let res = null;
        cycle: for(let i = 0; i < intersects.length; i += 1){
            for(let j = 0; j < names.length; j += 1) {
                if (intersects[i].object.name === names[j]) {
                    res = intersects[i];
                    break cycle;
                }
            }
        }
        return res;
    }

    isMoved(currentPos, startPos){
        return Math.abs(currentPos.x - startPos.x) > C.deltaOnPointerInteractive ||
            Math.abs(currentPos.y - startPos.y) > C.deltaOnPointerInteractive;
    }

    onNodeClick (cNode, shiftKey, ctrlKey) {
        if (cNode.isSelected()) {
            if(ctrlKey) {
                for (let i = 0; i < this.select.cNodes.length; i += 1) {
                    if (this.select.cNodes[i] === cNode) {
                        this.select.cNodes.splice(i, 1);
                        break;
                    }
                }
                cNode.unselect();
            } else if(shiftKey){

            } else {
                if(this.select.cNodes.length > 1){
                    for (let i = 0; i < this.select.cNodes.length; i += 1) {
                        if (this.select.cNodes[i] === cNode) continue;
                        this.select.cNodes[i].unselect();
                        this.select.cNodes.splice(i, 1);
                        i -= 1;
                    }
                } else {
                    this.select.cNodes = [];
                    cNode.unselect();
                }
            }
        } else {
            FBS.nodeControl.moveNodesToOriginZ([cNode]);
            cNode.moveToOverAllZ();
            if(shiftKey || ctrlKey) {
                this.addCNodeToSelected(cNode);

            } else {
                for (let i = 0; i < this.select.cNodes.length; i += 1) {
                    if (this.select.cNodes[i] === cNode) continue;
                    this.select.cNodes[i].unselect();
                    this.select.cNodes.splice(i, 1);
                    i -= 1;
                }
                this.addCNodeToSelected(cNode);
            }
            cNode.select();
        }
    }

    addCNodeToSelected(cNode){
        let isExist = false;
        for(let i = 0; i < this.select.cNodes.length; i += 1){
            if(this.select.cNodes[i] === cNode) {
                isExist = false;
                break;
            }
        }
        if(!isExist) {
            this.select.cNodes.push(cNode);
        }
    }

    onLineClick(cLine){

        let isSelected = false;
        for(let i = 0; i < this.select.cLines.length; i += 1){
            if(this.select.cLines[i] === cLine){
                isSelected = true;
                break;
            }
        }
        if(isSelected){
            this.unselectLine(cLine);
        } else {
            this.select.cLines.push(cLine);
            this.selectLine(cLine);
        }
    }

    selectLine(cLine){
        cLine.select();
    }

    unselectLine(cLine){
        cLine.unselect();
    }

    unselectAll(){
        this.unselectAllNodes();
        this.unselectAllLines();
    }

    unselectAllNodes(){
        for(let i = 0; i < this.select.cNodes.length; i += 1){
            this.select.cNodes[i].unselect();
        }
        this.select.cNodes = [];
    }

    unselectAllLines(){
        for(let i = 0; i < this.select.cLines.length; i += 1){
            this.unselectLine(this.select.cLines[i]);
        }
        this.select.cLines = [];
    }

    setCursor(style){
        if(FBS.dom.canvas.style.cursor !== style) FBS.dom.canvas.style.cursor = style;
    }

    resetCursor(){
        FBS.dom.canvas.style.cursor = 'default';
    }
}