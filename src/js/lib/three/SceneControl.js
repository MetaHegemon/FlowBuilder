import * as THREE from 'three';
import C from './../Constants';
import FBS from "../FlowBuilderStore";

export default class {
    constructor(canvas){
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = true;

        this.renderLoops = [];

        this.frustumSize = 1;
        const aspect = this.canvas.width/this.canvas.height;
        this.camera = new THREE.OrthographicCamera(
            this.frustumSize * aspect / -2,
            this.frustumSize * aspect / 2,
            this.frustumSize/2,
            this.frustumSize/-2,
            1,
            1000
        );
        this.camera.position.z = 100;
        this.camera.lookAt(0,0,0);
        this.camera.zoom = 0.0007;
        //this.camera.zoom = 0.0016;
        //zoom
        this.zoomTo = 1;
        this.zoomStep = null;
        this.canvas.addEventListener('wheel', (e)=> this.onWheel(e));

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(C.scene.backgroundColor);

        //
        this.resizeTimer = null;
        new ResizeObserver(()=>{
            const _this = this;
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                _this.renderResize();
            }, 100);
        }).observe(this.canvas.parentNode);

        this.zoomEvent = {
            inEvent: new Event('needFullUnCollapse'),
            outEvent: new Event('needFullCollapse'),
            inDispatched: this.frustumSize < C.three.zoomLimitForFullCollapseNodes,
            outDispatched: this.frustumSize > C.three.zoomLimitForFullCollapseNodes
        }
/*
        this.moveToCursor = {
            step: null,
            factor: 700,
            pointerPos2d: new THREE.Vector3(),
            pointerPos3d: new THREE.Vector3(),
            raycaster: new THREE.Raycaster(),
            deltaY: 0,
            destPos2d: new THREE.Vector2(),
            camPos2d: new THREE.Vector2()
        }
*/
    }

    onWheel(e) {
        this.zoomTo = Math.min(Math.max((this.frustumSize + e.deltaY * C.three.zoomSpeed * this.frustumSize), C.three.maxZoom), C.three.minZoom);

    }

    run (){
        this.renderResize();
        this.render();
        clog({scene: this.scene});
        //this.addDebugPlane();
    }

    addDebugPlane(){
        const debugMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1000,1000),
            new THREE.MeshBasicMaterial({color: 'red'})
        );
        debugMesh.position.set(0,0,20);
        //debugMesh.rotateX(Math.PI/2);
        this.scene.add(debugMesh);
    }

    renderResize() {
        this.canvas.width = this.canvas.parentNode.clientWidth;
        this.canvas.height = this.canvas.parentNode.clientHeight;

        const aspect = this.canvas.width / this.canvas.height;
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera.aspect = aspect;

        this.camera.left = this.frustumSize * aspect / -2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize/2;
        this.camera.bottom = this.frustumSize/-2;
        this.camera.updateProjectionMatrix();
    }

    render(){
        this.smoothZoom();
        this.listenZoom()
        this.loopAnimations();
        this.renderer.render( this.scene, this.camera );
        requestAnimationFrame( ()=> this.render() );
    }

    calcPointer3d(e) {

        this.moveToCursor.pointerPos2d.x = (e.clientX / this.canvas.clientWidth) * 2 - 1;
        this.moveToCursor.pointerPos2d.y = -(e.clientY / this.canvas.clientHeight) * 2 + 1;

        this.moveToCursor.raycaster.setFromCamera(this.moveToCursor.pointerPos2d, this.camera);

        this.moveToCursor.pointerPos3d.x = this.moveToCursor.raycaster.ray.origin.x;
        this.moveToCursor.pointerPos3d.y = this.moveToCursor.raycaster.ray.origin.y;
        this.moveToCursor.deltaY = e.deltaY;

        const destPos2d = new THREE.Vector2(this.moveToCursor.pointerPos3d.x, this.moveToCursor.pointerPos3d.y);
        const camPos2d = new THREE.Vector2(this.camera.position.x, this.camera.position.y);

        const dist = destPos2d.distanceTo(camPos2d);
        this.moveStep = dist/e.deltaY;
        camPos2d.lerp(destPos2d, 0.1);
        this.camera.position.set( camPos2d.x, camPos2d.y, this.camera.position.z );
    }

    smoothZoom() {
        this.zoomStep = (this.zoomTo - this.frustumSize) * C.three.dampingFactor;
        if ((this.zoomStep > 0 && this.zoomStep > 0.000001) || (this.zoomStep < 0 && this.zoomStep < -0.000001)) {
            //zoom
            this.frustumSize = this.frustumSize + this.zoomStep;

            this.camera.left = -this.frustumSize * this.camera.aspect / 2;
            this.camera.right = this.frustumSize * this.camera.aspect / 2;
            this.camera.top = this.frustumSize / 2;
            this.camera.bottom = -this.frustumSize / 2;
            this.camera.updateProjectionMatrix();
        }
    }

    listenZoom(){
        if(this.frustumSize > C.three.zoomLimitForFullCollapseNodes && !this.zoomEvent.outDispatched){
            this.canvas.dispatchEvent(this.zoomEvent.outEvent);
            this.zoomEvent.outDispatched = true;
            this.zoomEvent.inDispatched = false;
        } else if(this.frustumSize < C.three.zoomLimitForFullCollapseNodes && !this.zoomEvent.inDispatched){
            this.canvas.dispatchEvent(this.zoomEvent.inEvent);
            this.zoomEvent.inDispatched = true;
            this.zoomEvent.outDispatched = false;
        }
    }

    loopAnimations(){
        this.renderLoops.map((func)=>func());
    }

    addObjectsToScene (objects){
        for(let i = 0; i < objects.length; i += 1){
            this.scene.add(objects[i]);
        }
    }

    getCamera(){
        return this.camera;
    }

    getScene(){
        return this.scene;
    }

    getRenderer(){
        return this.renderer;
    }

    getCanvas(){
        return this.canvas;
    }

    getRenderLoops(){
        return this.renderLoops;
    }


}