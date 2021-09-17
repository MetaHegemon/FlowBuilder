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
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if (backMountIntersect) {
                        this.selectedOnPointerDown = backMountIntersect.object.userData.class.getMNode();
                        return null;
                    }
                    const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                    if (connectorIntersect) {
                        this.selectedOnPointerDown = connectorIntersect.object;
                        this.unselectAllLines();
                        lineControl.enable(connectorIntersect.object);
                        return null;
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
                    const cPort = this.intersects[0].object.userData.class;
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
                        if (firstObject.name === 'portLabel') {
                            firstObject.userData.methods.hover();
                            this.hovered.push(firstObject);
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'footerLabel') {
                            firstObject.userData.methods.hover();
                            this.hovered.push(firstObject);
                            this.sceneControl.setCursor('pointer');
                        } else if (firstObject.name === 'connector') {
                            this.sceneControl.setCursor('pointer');
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
                                const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                                if (backMountIntersect) {
                                    const node = backMountIntersect.object.userData.superParent;
                                    Drag.enable(node, this.pointerPosOnScene);
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
                            const cNode = allSelected[i].userData.class;
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
                        } else {
                            const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                            if (backMountIntersect) {
                                const cNode = backMountIntersect.object.userData.class;
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

    onCollapseButtonClick(mCollapse){
        clog('collapse');
    }

    onPlayButtonClick(mPlay){
        const cNode = mPlay.userData.class;
        cNode.play(mPlay);
    }

    onMenuButtonClick(mMenu){
        clog('menu click');
    }

    unhoverObjects(currentObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === currentObject) continue;
            this.hovered[i].userData.methods.unhover();
            this.hovered.splice(i, 1);
            i -= 1;
        }
    }

    checkOnIntersect(intersects, name){
        let res = null;
        for(let i = 0; i < intersects.length; i += 1){
            if(intersects[i].object.name === name){
                res = intersects[i];
                break;
            }
        }
        return res;
    }

    isMoved(currentPos, startPos){
        return Math.abs(currentPos.x - startPos.x) > C.deltaOnPointerInteractive ||
            Math.abs(currentPos.y - startPos.y) > C.deltaOnPointerInteractive;
    }

    onNodeClick (cNode, shiftKey, ctrlKey) {
        if (cNode.selected) {
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

