import * as THREE from 'three';
import DragControl from './DragControl';
import LineControl from './LineControl';
import C from "../Constants";

const Drag = new DragControl();
const lineControl = new LineControl();

export default class{
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        this.pointerPos = new THREE.Vector2();
        this.camera = null;
        this.scene = null;
        this.controls = null;
        this.pointerPosOnScene = new THREE.Vector2();
        this.pointerDownPos = new THREE.Vector2();
        this.cameraDownPos = new THREE.Vector2();
        this.hovered = [];
        this.selected = {
            lines: [],
            nodes: []
        };
    }

    setSceneComponents(canvas, camera, scene, controls){
        this.canvas = canvas;
        this.camera = camera;
        this.scene = scene;
        this.controls = controls;
        lineControl.setScene(scene);
    }

    setEvents(){
        this.canvas.addEventListener('pointermove', (e)=>this.onPointerMove(e));
        this.canvas.addEventListener('pointerdown', (e)=>this.onPointerDown(e));
        this.canvas.addEventListener('pointerup', (e)=>this.onPointerUp(e));
    }

    onPointerMove(e){
        this.pointerPos.x = ( e.clientX / this.canvas.clientWidth ) * 2 - 1;
        this.pointerPos.y = -( e.clientY / this.canvas.clientHeight ) * 2 + 1;

        this.raycaster.setFromCamera( this.pointerPos, this.camera );

        this.pointerPosOnScene.x = this.raycaster.ray.origin.x;
        this.pointerPosOnScene.y = this.raycaster.ray.origin.y;

        if(Drag.active){
            Drag.dragObject(this.pointerPosOnScene);
            lineControl.refreshLines(Drag.getObject());
        } else if(lineControl.active) {
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
            this.detectIntersects(e.buttons);
        }
    }

    detectIntersects(buttons) {
        this.intersects = this.raycaster.intersectObjects( this.scene.children, true );

        if (this.intersects.length > 0)
        {
            if(buttons === 0){
                const firstObject = this.intersects[0].object;
                if(firstObject.name === 'portLabel'){
                    firstObject.userData.methods.hover();
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'footerLabel'){
                    firstObject.userData.methods.hover();
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'connector'){
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'line'){
                    this.changePointerStyle('pointer');
                } else {
                    this.unhoverObjects(firstObject);
                    this.changePointerStyle('default');
                }
            }
            else if (buttons === 1)
            {
                if(this.isMoved(this.pointerPosOnScene, this.pointerDownPos)) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if (backMountIntersect) {
                        const node = backMountIntersect.object.userData.superParent;
                        Drag.enable(node, this.pointerPosOnScene);
                        this.changePointerStyle('move');
                        return null;
                    }
                }
                const firstObject = this.intersects[0].object;
                if(firstObject.name === 'connector'){
                    lineControl.enable(firstObject);
                }
            }
        } else {
            this.unhoverObjects(null);
            this.changePointerStyle('default');
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

    changePointerStyle(style){
        if(this.canvas.style.cursor !== style) this.canvas.style.cursor = style;
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
        this.cameraDownPos.x = this.camera.position.x;
        this.cameraDownPos.y = this.camera.position.y;

        this.pointerDownPos.x = this.pointerPosOnScene.x;
        this.pointerDownPos.y = this.pointerPosOnScene.y;

        if(this.intersects.length > 0) {
            if (e.buttons === 1) {
                const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                if(backMountIntersect){
                    this.controls.enablePan = false;
                    return null;
                }
                const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                if(connectorIntersect){
                    this.controls.enablePan = false;
                    this.unselectAllLines();
                    lineControl.enable(connectorIntersect.object);
                }
            }
        }
    }

    onPointerUp(e){
        if(Drag.active) {
            Drag.disable();
            this.changePointerStyle('default');
            this.controls.enablePan = true;
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
            this.controls.enablePan = true;
        } else {
            if(this.intersects.length > 0) {
                if (e.button === 0) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if (backMountIntersect) {
                        this.onNodeClick(backMountIntersect.object.userData.superParent, e.shiftKey);
                        this.controls.enablePan = true;
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
                    if(!this.isMoved(this.camera.position, this.cameraDownPos)){
                        this.unselectAll();
                    }
                }
            }
        }
        this.pointerDownPos.x = this.pointerDownPos.y = 0;
    }

    isMoved(currentPos, startPos){
        return Math.abs(currentPos.x - startPos.x) > C.deltaOnPointerInteractive ||
            Math.abs(currentPos.y - startPos.y) > C.deltaOnPointerInteractive;
    }

    onNodeClick (node, isMultipleSelect) {
        if (node.userData.selected) {
            if(isMultipleSelect) {
                for (let i = 0; i < this.selected.nodes.length; i += 1) {
                    if (this.selected.nodes[i].uuid === node.uuid) {
                        this.selected.nodes.splice(i, 1);
                        break;
                    }
                }
                this.unselectNode(node);
            } else {
                if(this.selected.nodes.length > 1){
                    for (let i = 0; i < this.selected.nodes.length; i += 1) {
                        if (this.selected.nodes[i].uuid === node.uuid) continue;
                        this.unselectNode(this.selected.nodes[i]);
                        this.selected.nodes.splice(i, 1);
                        i -= 1;
                    }
                } else {
                    this.selected.nodes = [];
                    this.unselectNode(node);
                }
            }
        } else {
            if(isMultipleSelect) {
                this.selected.nodes.push(node);
            } else {
                for (let i = 0; i < this.selected.nodes.length; i += 1) {
                    if (this.selected.nodes[i].uuid === node.uuid) continue;
                    this.unselectNode(this.selected.nodes[i]);
                    this.selected.nodes.splice(i, 1);
                    i -= 1;
                }
                this.selected.nodes.push(node);
            }
            this.selectNode(node);
        }
    }

    selectNode(node){
        node.userData.class.selectNode();
    }

    unselectNode(node){
        node.userData.class.unselectNode();
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
        for(let i = 0; i < this.selected.nodes.length; i += 1){
            this.unselectNode(this.selected.nodes[i]);
        }
        this.selected.nodes = [];
    }

    unselectAllLines(){
        for(let i = 0; i < this.selected.lines.length; i += 1){
            this.unselectLine(this.selected.lines[i]);
        }
        this.selected.lines = [];
    }
}

