import * as THREE from 'three';
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

        //zoom
        this.zoomTo = 1;
        this.zoomStep = null;
        this.canvas.addEventListener('wheel', (e)=> this.onWheel(e));

        //pan
        this.pan = true;
        this.spaceBarActive = false;
        this.cameraPosTo = {x: 0, y: 0};
        this.pointerLastPos = {x: 0, y: 0};
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.canvas.addEventListener('pointermove', (e) => this.onMouseMove(e));

        this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f2f5);

        new ResizeObserver(()=>this.renderResize()).observe(this.canvas.parentNode);
    }

    onContextMenu(e){
         e.preventDefault();
    }

    onKeyDown(e){
        if(e.code === 'Space') this.spaceBarActive = true;
    }

    onKeyUp(e){
        if(e.code === 'Space') this.spaceBarActive = false;
    }

    onMouseMove(e){
        const currentPosX = (e.pageX / this.canvas.width) * 2 - 1;
        const currentPosY = -(e.pageY / this.canvas.height) * 2 + 1;

        if((e.buttons === 1 && this.pan && this.spaceBarActive) || (e.buttons === 4  && this.pan)) {
            let dx = (this.pointerLastPos.x - currentPosX)/this.camera.zoom;
            let dy = (this.pointerLastPos.y - currentPosY)/this.camera.zoom;

            this.cameraPosTo.x = this.cameraPosTo.x + dx * this.camera.right;
            this.cameraPosTo.y = this.cameraPosTo.y + dy * this.camera.top;

            this.camera.position.x = this.camera.position.x + (this.cameraPosTo.x - this.camera.position.x);
            this.camera.position.y = this.camera.position.y + (this.cameraPosTo.y - this.camera.position.y);
        }
        this.pointerLastPos.x = currentPosX;
        this.pointerLastPos.y = currentPosY;
    }

    onWheel(e) {
        this.zoomTo = Math.min(Math.max((this.frustumSize + e.deltaY * C.three.zoomSpeed * this.frustumSize), C.three.maxZoom), C.three.minZoom);
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

    enablePan(){
        this.pan = true;
    }

    disablePan(){
        this.pan = false;
    }

    getRenderer(){
        return this.renderer;
    }
}