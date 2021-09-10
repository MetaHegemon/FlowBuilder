import * as THREE from 'three';

export class Interactive{
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        this.pointerPos = new THREE.Vector2;
        this.camera = null;
        this.scene = null;
        this.controls = null;
        this.pointerPosOnScene = new THREE.Vector2();
        this.drag = {
            active: false,
            offset: new THREE.Vector2(),
            object: null,

            constDelta: 5,
            delta: new THREE.Vector2()
        }
        this.pointerDownPos = new THREE.Vector2();
        this.hovered = [];
        this.selected = [];
    }

    setSceneComponents(canvas, camera, scene, controls){
        this.canvas = canvas;
        this.camera = camera;
        this.scene = scene;
        this.controls = controls;
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


        if(this.drag.active){
            this.dragObject(this.drag.object);
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
                    firstObject.color = '#00a2d2';
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'footerLabel'){
                    firstObject.color = '#00a2d2';
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else if(firstObject.name === 'connector'){
                    firstObject.color = '#00a2d2';
                    this.hovered.push(firstObject);
                    this.changePointerStyle('pointer');
                } else {
                    this.unhoverObjects(firstObject);
                    this.changePointerStyle('default');
                }
                /*const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                if(backMountIntersect){
                    backMountIntersect.object.material.color = new THREE.Color(0x00a2d2);
                    this.hovered.push(backMountIntersect.object);
                }*/
            }
            else if (buttons === 1)
            {
                if(this.getPointerMoveDiff().x > this.drag.constDelta || this.getPointerMoveDiff().y > this.drag.constDelta) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if (backMountIntersect) {
                        this.drag.active = true;
                        this.changePointerStyle('move');
                        return null;
                    }
                    const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                    if(connectorIntersect){

                        return null;
                    }
                }
            }
        } else {
            this.unhoverObjects(null);
            this.changePointerStyle('default');
        }
    }

    getPointerMoveDiff(){
        return {
            x: Math.abs(this.pointerPosOnScene.x - this.pointerDownPos.x),
            y: Math.abs(this.pointerPosOnScene.y - this.pointerDownPos.y)
        };
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

    dragObject(object){
        object.position.set(this.pointerPosOnScene.x + this.drag.offset.x, this.pointerPosOnScene.y + this.drag.offset.y, object.position.z);
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
        if(this.intersects.length > 0) {
            if (e.buttons === 1) {
                const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                if(backMountIntersect){
                    this.controls.enablePan = false;
                    const node = backMountIntersect.object.userData.superParent;
                    this.drag.object = node;
                    this.drag.offset.x = node.position.x - this.pointerPosOnScene.x;
                    this.drag.offset.y = node.position.y - this.pointerPosOnScene.y;
                    this.pointerDownPos.x = this.pointerPosOnScene.x;
                    this.pointerDownPos.y = this.pointerPosOnScene.y;
                    return null;
                }
                const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                if(connectorIntersect){
                    this.controls.enablePan = false;

                }
            }
        }
    }

    onPointerUp(e){
        this.pointerDownPos.x = this.pointerDownPos.y = 0;
        if(this.drag.active) {
            this.drag.active = false;
            this.drag.object = null;
            this.controls.enablePan = true;
            this.changePointerStyle('default');
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
                            backMountIntersect.object.material.color = new THREE.Color(0x00ff00);
                        }
                    }
                }
            }
        }
        this.controls.enablePan = true;
    }
}

