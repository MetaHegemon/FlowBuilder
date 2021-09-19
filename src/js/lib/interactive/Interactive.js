import * as THREE from 'three';
import DragControl from './DragControl';
import LineControl from './LineControl';
import C from "../Constants";
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox';
import  SelectionHelper  from './SelectHelper';

const Drag = new DragControl();
const lineControl = new LineControl();
let selectionBox = null;
let selectionHelper = null;

export default class{
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        //for paning
        this.spaceBarPressed = false;
        this.panningNow = false;
        this.cameraPosTo = {x: 0, y: 0};
        this.pointerPos = {x: 0, y: 0};
        this.pointerLastPos = {x: 0, y: 0};

        this.pointerPos = new THREE.Vector2();
        this.camera = null;
        this.scene = null;
        this.pointerPosOnScene = new THREE.Vector2();
        this.pointerDownPos = new THREE.Vector2();
        this.hovered = [];
        this.selected = {
            lines: [],
            cNodes: []
        };
        this.selectedOnPointerDown = null;
    }

    setSceneComponents(canvas, sceneControl){
        this.canvas = canvas;
        this.sceneControl = sceneControl;
        this.camera = sceneControl.getCamera();
        this.scene = sceneControl.getScene();
        this.renderer = sceneControl.getRenderer();
        lineControl.setScene(this.scene);

        selectionBox = new SelectionBox( this.camera, this.scene );
        selectionHelper = new SelectionHelper( selectionBox, this.renderer, 'selectBox' );
    }

    setEvents(){
        this.canvas.addEventListener('pointermove', (e)=>this.onPointerMove(e));
        this.canvas.addEventListener('pointerdown', (e)=>this.onPointerDown(e));
        this.canvas.addEventListener('pointerup', (e)=>this.onPointerUp(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
    }

    onKeyDown(e){
        if(e.code === 'Space') this.spaceBarPressed = true;
    }

    onKeyUp(e){
        if(e.code === 'Space') this.spaceBarPressed = false;
    }

    onContextMenu(e){
        e.preventDefault();
    }

    onPointerDown(e){
        this.pointerDownPos.x = this.pointerPosOnScene.x;
        this.pointerDownPos.y = this.pointerPosOnScene.y;

        if(this.spaceBarPressed || e.button === 1){
            this.sceneControl.setCursor('grabbing');
            this.panningNow = true;
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
                        if(cPort.type !== 'pseudo') {
                            this.selectedOnPointerDown = connectorIntersect.object;
                            this.unselectAllLines();
                            lineControl.enable(connectorIntersect.object);
                        }
                    }
                }
            } else {
                this.unselectAll();
                selectionHelper.onSelectStart(e);
                selectionBox.startPoint.set(this.pointerPos.x, this.pointerPos.y, 0.5);
            }
        }
    }

    onPointerMove(e) {
        this.pointerPos.x = (e.clientX / this.canvas.clientWidth) * 2 - 1;
        this.pointerPos.y = -(e.clientY / this.canvas.clientHeight) * 2 + 1;

        if(this.panningNow && (e.buttons === 1 || e.buttons === 4)) {
            let dx = (this.pointerLastPos.x - this.pointerPos.x)/this.camera.zoom;
            let dy = (this.pointerLastPos.y - this.pointerPos.y)/this.camera.zoom;

            this.cameraPosTo.x = this.cameraPosTo.x + dx * this.camera.right;
            this.cameraPosTo.y = this.cameraPosTo.y + dy * this.camera.top;

            this.camera.position.x = this.camera.position.x + (this.cameraPosTo.x - this.camera.position.x);
            this.camera.position.y = this.camera.position.y + (this.cameraPosTo.y - this.camera.position.y);
        } else {
            this.raycaster.setFromCamera(this.pointerPos, this.camera);

            this.pointerPosOnScene.x = this.raycaster.ray.origin.x;
            this.pointerPosOnScene.y = this.raycaster.ray.origin.y;

            if (Drag.active) {
                Drag.dragObject(this.pointerPosOnScene);
                lineControl.refreshLines(Drag.getObject());
            } else if (lineControl.active) {
                //TODO find only first intersect
                this.intersects = this.raycaster.intersectObjects(this.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.intersects[0].object.name === 'connector' &&
                    lineControl.canBeConnected(this.intersects[0].object)
                ) {
                    const cPort = this.intersects[0].object.userData.portClass;
                    const pos = cPort.getConnectorPos();
                    lineControl.drawLineFromPos(pos.x, pos.y);
                } else {
                    lineControl.drawLineFromPos(this.pointerPosOnScene.x, this.pointerPosOnScene.y);
                }
            } else {
                this.intersects = this.raycaster.intersectObjects(this.scene.children, true);
                if (e.buttons === 0) {
                    if (this.intersects.length > 0) {
                        const firstObject = this.intersects[0].object;
                        if (firstObject.name === 'portLabelText') {
                            const cPort = firstObject.userData.portClass;
                            cPort.hover();
                            this.hovered.push(firstObject);
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'footerLabel') {
                            const cNode = firstObject.userData.nodeClass;
                            cNode.hoverFooterLabel();
                            this.hovered.push(firstObject);
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'connector') {
                            const cPort = firstObject.userData.portClass;
                            if(cPort.type !== 'pseudo') {
                                this.sceneControl.setCursor('pointer');
                            }
                        } else if (firstObject.name === 'line') {
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'collapseButton') {
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'playButton') {
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'menuButton') {
                            this.sceneControl.setCursor('pointer');
                        } else {
                            this.unhoverObjects(firstObject);
                            this.sceneControl.resetCursor();
                        }
                    } else {
                        this.unhoverObjects(null);
                        this.sceneControl.resetCursor();
                    }
                } else if (e.buttons === 1) {
                    if (this.selectedOnPointerDown) {
                        if (this.selectedOnPointerDown.name === 'node') {
                            if (this.isMoved(this.pointerPosOnScene, this.pointerDownPos)) {
                                const backMountIntersect = this.checkOnIntersect(this.intersects, ['backMountHead', 'backMountBody', 'backMountFooter']);
                                if (backMountIntersect) {
                                    const cNode = backMountIntersect.object.userData.nodeClass;
                                    Drag.enable(cNode.getMNode(), this.pointerPosOnScene);
                                    this.sceneControl.setCursor('move');
                                }
                            }
                        } else if (this.selectedOnPointerDown.name === 'connector') {
                            const firstObject = this.intersects[0].object;
                            if (firstObject.name === 'connector') {
                                lineControl.enable(firstObject);
                            }
                        }
                    } else {
                        selectionHelper.onSelectMove(e);
                        this.unselectAllNodes();
                        selectionBox.endPoint.set(this.pointerPos.x, this.pointerPos.y, 0.5);
                        const allSelected = selectionBox.select();
                        for (let i = 0; i < allSelected.length; i += 1) {
                            if (allSelected[i].name !== 'backMount') continue;
                            const cNode = allSelected[i].userData.nodeClass;
                            this.addCNodeToSelected(cNode);
                        }
                        for (let i = 0; i < this.selected.cNodes.length; i += 1) {
                            this.selected.cNodes[i].select();
                        }
                    }
                } else {

                }
            }
        }

        this.pointerLastPos.x = this.pointerPos.x;
        this.pointerLastPos.y = this.pointerPos.y;
    }

    onPointerUp(e){
        if(this.panningNow){
            this.panningNow = false;
            this.sceneControl.resetCursor();
        } else {
            this.selectedOnPointerDown = null;
            if (Drag.active) {
                Drag.disable();
                this.sceneControl.resetCursor();
            } else if (lineControl.active) {
                this.intersects = this.raycaster.intersectObjects(this.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.intersects[0].object.name === 'connector' &&
                    lineControl.canBeConnected(this.intersects[0].object)
                ) {
                    lineControl.connect(this.intersects[0].object);
                } else {
                    lineControl.disable();
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
                            const cPort = this.intersects[0].object.userData.portClass;
                            if(cPort.type === 'pseudo'){
                                const cNode = cPort.getCNode();
                                cNode.shortCollapsePorts(cPort);
                                this.switchLinesOnPseudoPorts(cPort);
                            }
                        } else {
                            const backMountIntersect = this.checkOnIntersect(this.intersects, ['backMountHead', 'backMountBody', 'backMountFooter']);
                            if (backMountIntersect) {
                                const cNode = backMountIntersect.object.userData.nodeClass;
                                this.onNodeClick(cNode, e.shiftKey, e.ctrlKey);
                            } else if (this.intersects[0].object.name === 'line') {
                                this.onLineClick(this.intersects[0].object);
                            }
                        }
                    }
                } else {
                    if (e.button === 0) {
                        selectionHelper.onSelectOver(e);

                        //selectionBox.endPoint.set(this.pointerPos.x, this.pointerPos.y, 0.5);
                        //const allSelected = selectionBox.select();
                    }
                }
            }
            this.pointerDownPos.x = this.pointerDownPos.y = 0;
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
        lineControl.refreshLines(mNode);
    }

    onCollapseButtonClick(mCollapse){
        clog('collapse click');
        //const cNode = mCollapse.userData.nodeClass;
        //cNode.play(mCollapse);
    }

    onPlayButtonClick(mPlay){
        const cNode = mPlay.userData.nodeClass;
        cNode.play(mPlay);
    }

    onMenuButtonClick(mMenu){
        clog('menu click');
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
                for (let i = 0; i < this.selected.cNodes.length; i += 1) {
                    if (this.selected.cNodes[i] === cNode) {
                        this.selected.cNodes.splice(i, 1);
                        break;
                    }
                }
                cNode.unselect();
            } else if(shiftKey){

            } else {
                if(this.selected.cNodes.length > 1){
                    for (let i = 0; i < this.selected.cNodes.length; i += 1) {
                        if (this.selected.cNodes[i] === cNode) continue;
                        this.selected.cNodes[i].unselect();
                        this.selected.cNodes.splice(i, 1);
                        i -= 1;
                    }
                } else {
                    this.selected.cNodes = [];
                    cNode.unselect();
                }
            }
        } else {
            if(shiftKey || ctrlKey) {
                this.addCNodeToSelected(cNode);

            } else {
                for (let i = 0; i < this.selected.cNodes.length; i += 1) {
                    if (this.selected.cNodes[i] === cNode) continue;
                    this.selected.cNodes[i].unselect();
                    this.selected.cNodes.splice(i, 1);
                    i -= 1;
                }
                this.addCNodeToSelected(cNode);
            }
            cNode.select();
        }
    }

    addCNodeToSelected(cNode){
        let isExist = false;
        for(let i = 0; i < this.selected.cNodes.length; i += 1){
            if(this.selected.cNodes[i] === cNode) {
                isExist = false;
                break;
            }
        }
        if(!isExist) {
            this.selected.cNodes.push(cNode);
        }
    }

    onLineClick(lineMesh){
        if(lineMesh.userData.selected){
            for(let i = 0; i < this.selected.lines.length; i += 1){
                if(this.selected.lines[i].uuid === lineMesh.uuid){
                    this.selected.lines.splice(i, 1);
                    break;
                }
            }
            this.unselectLine(lineMesh);
        } else {
            this.selected.lines.push(lineMesh);
            this.selectLine(lineMesh);
        }
    }

    selectLine(lineMesh){
        const cLine = lineMesh.userData.class;
        cLine.select();
        const cPort1 = cLine.getCPort1();
        cPort1.selectConnector();
        const cPort2 = cLine.getCPort2();
        cPort2.selectConnector();
    }

    unselectLine(lineMesh){
        const cLine = lineMesh.userData.class;
        cLine.unselect();
        const cPort1 = cLine.getCPort1();
        cPort1.unselectConnector();
        const cPort2 = cLine.getCPort2();
        cPort2.unselectConnector();
    }

    unselectAll(){
        this.unselectAllNodes();
        this.unselectAllLines();
    }

    unselectAllNodes(){
        for(let i = 0; i < this.selected.cNodes.length; i += 1){
            this.selected.cNodes[i].unselect();
        }
        this.selected.cNodes = [];
    }

    unselectAllLines(){
        for(let i = 0; i < this.selected.lines.length; i += 1){
            this.unselectLine(this.selected.lines[i]);
        }
        this.selected.lines = [];
    }
}