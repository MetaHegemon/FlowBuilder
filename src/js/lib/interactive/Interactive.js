import * as THREE from 'three';
import C from '../Constants';
import DragControl from './DragControl';
import LineControl from './LineControl';

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
        this.hovered = [];
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
            this.intersects = this.raycaster.intersectObjects(this.scene.children, true);
            if (
                this.intersects.length > 0 &&
                this.intersects[0].object.name === 'connector' &&
                lineControl.canBeConnected(this.intersects[0].object)
            ) {
                const pos = lineControl.getPositionOfConnector(this.intersects[0].object);
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
                    firstObject.color = C.nodeMesh.mount.backMountSelectedColor;
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'footerLabel'){
                    firstObject.color = C.nodeMesh.mount.backMountSelectedColor;
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'connector'){
                    firstObject.color = C.nodeMesh.mount.backMountSelectedColor;
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else {
                    this.unhoverObjects(firstObject);
                    this.changePointerStyle('default');
                }
            }
            else if (buttons === 1)
            {
                if(Drag.isMoved(this.pointerPosOnScene, this.pointerDownPos)) {
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
            if(this.hovered[i].name === 'backMount'){
                this.hovered[i].material.color = new THREE.Color(this.hovered[i].userData.backUpColor);
            } else {
                this.hovered[i].color = this.hovered[i].userData.backUpColor;
            }
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
                    lineControl.enable(connectorIntersect.object);
                }
            }
        }
    }

    onPointerUp(e){
        this.pointerDownPos.x = this.pointerDownPos.y = 0;
        if(Drag.active) {
            Drag.disable();
            this.controls.enablePan = true;
            this.changePointerStyle('default');
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
        } else {
            if(this.intersects.length > 0) {
                if (e.button === 0) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if(backMountIntersect){
                        const node = backMountIntersect.object.userData.superParent;
                        if(node.userData.selected){
                            node.userData.selected = false;
                            backMountIntersect.object.material.color = new THREE.Color(backMountIntersect.object.userData.backUpColor);
                        } else {
                            node.userData.selected = true;
                            backMountIntersect.object.material.color = new THREE.Color(C.nodeMesh.mount.backMountSelectedColor);
                        }
                    }
                }
            }
        }
        this.controls.enablePan = true;
    }
}

