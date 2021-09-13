import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import C from './../Constants';

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
        this.camera.zoom = 0.0015;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;

        this.zoomTo = 1;
        this.zoomStep = null;
        this.canvas.addEventListener('wheel', (e)=> this.onWheel(e));

        this.controls.enableRotate = true;
        this.controls.screenSpacePanning = true;
        this.controls.mouseButtons = { LEFT: THREE.MOUSE.RIGHT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.LEFT };

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f2f5);

        new ResizeObserver(()=>this.renderResize()).observe(this.canvas.parentNode);
    }

    onWheel(e) {
        this.zoomTo = Math.max((this.frustumSize + e.deltaY * C.three.zoomSpeed * this.frustumSize), C.three.maxZoom);
    }

    run (){
        this.renderResize();
        this.render();
        //this.addDebugPlane();
    }

    addDebugPlane(){
        const debugMesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(10,10,10),
            new THREE.MeshBasicMaterial({color: 'black'})
        );
        this.scene.add(debugMesh);
    }

    renderResize() {
        this.canvas.width = this.canvas.parentNode.clientWidth;
        this.canvas.height = this.canvas.parentNode.clientHeight;

        const aspect = this.canvas.width / this.canvas.height;
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera.aspect = aspect;

        //this.frustumSize = this.frustumSize + (this.frustumSizeTo - this.frustumSize) * 0.2

        this.camera.left = this.frustumSize * aspect / -2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize/2;
        this.camera.bottom = this.frustumSize/-2;
        this.camera.updateProjectionMatrix();
    }

    render(){
        this.smoothZoom();
        this.renderer.render( this.scene, this.camera );
        requestAnimationFrame( ()=> this.render() );
    }

    smoothZoom() {
        this.zoomStep = (this.zoomTo - this.frustumSize) * C.three.dampingFactor;
        if ((this.zoomStep > 0 && this.zoomStep > 0.000001) || (this.zoomStep < 0 && this.zoomStep < -0.000001)) {
            this.frustumSize = this.frustumSize + this.zoomStep;

            this.camera.left = -this.frustumSize * this.camera.aspect / 2;
            this.camera.right = this.frustumSize * this.camera.aspect / 2;
            this.camera.top = this.frustumSize / 2;
            this.camera.bottom = -this.frustumSize / 2;
            this.camera.updateProjectionMatrix();
        }
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

    getControls(){
        return this.controls;
    }
}