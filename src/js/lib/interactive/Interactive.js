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
    }

    onPointerMove(e) {
        this.pointerPos.x = (e.clientX / this.canvas.clientWidth) * 2 - 1;
        this.pointerPos.y = -(e.clientY / this.canvas.clientHeight) * 2 + 1;

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
                                return null;
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

    onPointerDown(e){
        this.pointerDownPos.x = this.pointerPosOnScene.x;
        this.pointerDownPos.y = this.pointerPosOnScene.y;

        if(this.intersects.length > 0) {
            if (e.buttons === 1) {
                const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                if(backMountIntersect){
                    this.selectedOnPointerDown = backMountIntersect.object.userData.class.getMNode();
                    this.sceneControl.disablePan();
                    return null;
                }
                const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                if(connectorIntersect){
                    this.selectedOnPointerDown = connectorIntersect.object;
                    this.sceneControl.disablePan();
                    this.unselectAllLines();
                    lineControl.enable(connectorIntersect.object);
                }
            }
        } else {
            this.unselectAll();
            clog('down');

            selectionHelper.onSelectStart(e);
            selectionBox.startPoint.set(this.pointerPos.x, this.pointerPos.y, 0.5 );
        }
    }

    onPointerUp(e){
        this.selectedOnPointerDown = null;
        if(Drag.active) {
            Drag.disable();
            this.sceneControl.resetCursor();
            this.sceneControl.enablePan();
        } else if(lineControl.active){
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
            this.sceneControl.enablePan();
        } else {
            if(this.intersects.length > 0) {
                if (e.button === 0) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if (backMountIntersect) {
                        const cNode = backMountIntersect.object.userData.class;
                        this.onNodeClick(cNode, e.shiftKey, e.ctrlKey);
                        this.sceneControl.enablePan();
                        return null;
                    }

                    const lineIntersect = this.checkOnIntersect(this.intersects, 'line');
                    if (lineIntersect) {
                        this.onLineClick(lineIntersect.object);
                        return null;
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

