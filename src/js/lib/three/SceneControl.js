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

        this.frustumSize = C.three.zoom.default;
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

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(FBS.theme.scene.backgroundColor);

        //
        this.resizeTimer = null;
        new ResizeObserver(()=>{
            const _this = this;
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                _this.renderResize();
            }, 100);
        }).observe(this.canvas.parentNode);

        //zoom
        this.canvas.addEventListener('wheel', (e)=> this.onWheel(e));
        this.zoom = {
            raycaster: new THREE.Raycaster(),
            pointPos3d: new THREE.Vector3(),
            pointPos2d: new THREE.Vector2(),
            destPos2d: new THREE.Vector2(),
            camPos2d: new THREE.Vector2(),
            stepVector: new THREE.Vector2(),
            stepFrustum: 0,
            distXY: 0,
            destNorm: null,
            factorDist: null
        }

        this.zoomEvent = {
            inEvent: new Event('needFullUnCollapse'),
            outEvent: new Event('needFullCollapse'),
            inDispatched: this.frustumSize < C.three.zoom.limitForFullCollapseNodes,
            outDispatched: this.frustumSize > C.three.zoom.limitForFullCollapseNodes
        };
    }

    onWheel(e) {
        this.zoom.pointPos2d.x = (e.clientX / this.canvas.clientWidth) * 2 - 1;
        this.zoom.pointPos2d.y = -(e.clientY / this.canvas.clientHeight) * 2 + 1;

        this.zoom.raycaster.setFromCamera(this.zoom.pointPos2d, this.camera);

        this.zoom.pointPos3d.x = this.zoom.raycaster.ray.origin.x;
        this.zoom.pointPos3d.y = this.zoom.raycaster.ray.origin.y;

        this.zoom.destPos2d = new THREE.Vector2(this.zoom.pointPos3d.x, this.zoom.pointPos3d.y);
        this.zoom.camPos2d = new THREE.Vector2(this.camera.position.x, this.camera.position.y);

        //вычисляем расстояние от камеры до положения поинтера по х и у
        this.zoom.distXY = this.zoom.camPos2d.distanceTo(this.zoom.destPos2d);

        //находим нормализованный вектор в направлении точки назначения
        this.zoom.destNorm = this.zoom.destPos2d.clone().sub(this.zoom.camPos2d).normalize();

        //вычисляем 10% от расстояния
        this.zoom.factorDist = this.zoom.distXY / 100 * C.three.zoom.speed;

        //устанавливаем длину для нормализованного вектора
        this.zoom.stepVector = this.zoom.destNorm.clone().setLength(this.zoom.factorDist);

        //теперь пропорционально зумим на те же 10% уменьшая фрустум
        this.zoom.stepFrustum = this.frustumSize/100 * C.three.zoom.speed;

        if(e.deltaY > 0){
            this.zoom.stepFrustum *= -1;
            this.zoom.stepVector.x *= -1;
            this.zoom.stepVector.y *= -1;
        }
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

    smoothZoom(){
        this.zoom.stepFrustum *= C.three.zoom.damping;

        if ((this.zoom.stepFrustum > 0 && this.zoom.stepFrustum > 0.000001) || (this.zoom.stepFrustum < 0 && this.zoom.stepFrustum < -0.000001)) {
            this.zoom.stepVector.x *= C.three.zoom.damping;
            this.zoom.stepVector.y *= C.three.zoom.damping;

            this.frustumSize = Math.min(C.three.zoom.min, Math.max(this.frustumSize - this.zoom.stepFrustum, C.three.zoom.max));
            this.camera.position.set(
                this.camera.position.x + this.zoom.stepVector.x,
                this.camera.position.y + this.zoom.stepVector.y,
                this.camera.position.z
            );

            this.camera.left = -this.frustumSize * this.camera.aspect / 2;
            this.camera.right = this.frustumSize * this.camera.aspect / 2;
            this.camera.top = this.frustumSize / 2;
            this.camera.bottom = -this.frustumSize / 2;
            this.camera.updateProjectionMatrix();
        }
    }

    listenZoom(){
        if(this.frustumSize > C.three.zoom.limitForFullCollapseNodes && !this.zoomEvent.outDispatched){
            this.canvas.dispatchEvent(this.zoomEvent.outEvent);
            this.zoomEvent.outDispatched = true;
            this.zoomEvent.inDispatched = false;
        } else if(this.frustumSize < C.three.zoom.limitForFullCollapseNodes && !this.zoomEvent.inDispatched){
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

    updateTheme(){
        this.scene.background.setStyle(FBS.theme.scene.backgroundColor);
    }
}