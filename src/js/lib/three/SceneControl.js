import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

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

        const frustumSize = 1;
        const aspect = this.canvas.width/this.canvas.height;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize/2,
            frustumSize/-2,
            1,
            1000
        );
        this.camera.position.z = 100;
        this.camera.lookAt(0,0,0);
        this.camera.zoom = 0.0015;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableRotate = true;
        this.controls.screenSpacePanning = true;
        this.controls.mouseButtons = { LEFT: THREE.MOUSE.RIGHT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.LEFT };

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f2f5);
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
        const aspect = this.canvas.width / this.canvas.height;
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix()
    }

    render(){
        this.renderer.render( this.scene, this.camera );
        requestAnimationFrame( ()=> this.render() );
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