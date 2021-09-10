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
            startPos: new THREE.Vector2(),
            constDelta: 5,
            delta: new THREE.Vector2()
        }
        this.hovered = [];

        this.temp = new THREE.Vector3();
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
                clog(firstObject.name);
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
                const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                if(backMountIntersect){
                    backMountIntersect.object.material.color = new THREE.Color(0x00a2d2);
                    this.hovered.push(backMountIntersect.object);
                }
            }
            else if (buttons === 1)
            {
                const diffX = Math.abs(this.pointerPosOnScene.x - this.drag.startPos.x);
                const diffY = Math.abs(this.pointerPosOnScene.y - this.drag.startPos.y);
                if(diffX > this.drag.constDelta || diffY > this.drag.constDelta) {
                    const backMountIntersect = this.checkOnIntersect(this.intersects, 'backMount');
                    if (backMountIntersect) {
                        this.drag.active = true;
                        this.changePointerStyle('move');
                        return null;
                    }
                    const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                    if(connectorIntersect){
                        if(this.curve){
                            this.curve.curve.points[1].x = this.pointerPosOnScene.x;
                            this.curve.curve.points[1].y = this.pointerPosOnScene.y;
                            const points = this.curve.curve.getPoints(50);
                            this.curve.mesh.geometry.setFromPoints(points);
                        }
                        return null;
                    }
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
                    this.drag.startPos.x = this.pointerPosOnScene.x;
                    this.drag.startPos.y = this.pointerPosOnScene.y;
                    return null;
                }
                const connectorIntersect = this.checkOnIntersect(this.intersects, 'connector');
                if(connectorIntersect){
                    this.controls.enablePan = false;
                    const pos = new THREE.Vector3();
                    connectorIntersect.object.getWorldPosition(pos);
                    this.curve = this.getNewCurve(
                        new THREE.Vector2(connectorIntersect.object.position.x, connectorIntersect.object.position.y),
                        new THREE.Vector2(this.pointerPosOnScene.x, this.pointerPosOnScene.y)
                    );
                    clog(this.curve);
                    this.scene.add(this.curve.mesh);
                }
            }
        }
    }

    getNewCurve(point1, point2){
        const spline = {};

        spline.curve = new THREE.SplineCurve( [point1, point2] );

        const points = spline.curve.getPoints( 50 );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

        spline.mesh = new THREE.Line( geometry, material );

        return spline;
    }

    onPointerUp(){
        if(this.drag.active) {
            this.drag.active = false;
            this.drag.object = null;
            this.controls.enablePan = true;
            this.changePointerStyle('default');
        }
        this.controls.enablePan = true;
    }
}

