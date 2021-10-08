/**
 * Модуль настройки и управления сценой
 */

import * as THREE from 'three';
import C from './../Constants';
import ThemeControl from './../../themes/ThemeControl';
import FBS from "../FlowBuilderStore";
import Stats from 'stats.js';

//ФПС-метр
const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

export default class {
    constructor(){
        this.renderer = null;
        this.frustumSize = C.three.zoom.default;
        this.camera= null;
        this.scene = null;
        //
        this.resizeTimer = null;                    //таймер обновления вьюпорта, при изменении размера окна

        //zoom
        this.zoom = {                               //объект для расчёта зума камеры
            raycaster: new THREE.Raycaster(),
            pointPos3d: new THREE.Vector3(),
            pointPos2d: new THREE.Vector2(),
            destPos2d: new THREE.Vector2(),
            camPos2d: new THREE.Vector2(),
            stepVector: new THREE.Vector2(),
            stepFrustum: 0,
            distXY: 0,
            destNorm: null,
            factorDist: null,
            deltaY: null
        }

        this.zoomEvent = {                          //объект для отправки события пересечения границы сворачивания нод
            inEvent: new Event('needFullUnCollapse'),
            outEvent: new Event('needFullCollapse'),
            inDispatched: this.frustumSize < C.three.zoom.fullCollapseBorder,
            outDispatched: this.frustumSize > C.three.zoom.fullCollapseBorder
        };
    }

    /**
     * Первоначальная настройка сцены
     */
    setScene(){
        this.canvas = FBS.dom.getCanvas();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = true;

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
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 100;
        this.camera.lookAt(0,0,0);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(ThemeControl.theme.scene.backgroundColor);

        //Отслеживание изменения размера окна
        new ResizeObserver(()=>{
            const _this = this;
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                _this.renderResize();
            }, 100);
        }).observe(this.canvas.parentNode);

        //zoom
        this.canvas.addEventListener('wheel', (e)=> this.onWheel(e));
    }

    /**
     * Обработчик события прокрытки колеса мыши
     * @param e
     */
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

        this.zoom.deltaY = e.deltaY;
    }

    /**
     * Запуск рендера сцены
     */
    run (){
        clog({scene: this.scene});
        this.renderResize();
        this.render();
        //this.addDebugPlane();
    }

    addDebugPlane(){
        const debugMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(100,100),
            new THREE.MeshBasicMaterial({color: 'red'})
        );
        const debugMesh1 = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(50,50),
            new THREE.MeshBasicMaterial({color: 'blue'})
        );
        debugMesh1.position.setZ(1);
        //debugMesh.scale.set(0.5,0.5);
        //debugMesh.position.set(0,0,20);
        //debugMesh.rotateX(Math.PI/2);
        this.scene.add(debugMesh);
        this.scene.add(debugMesh1);
    }

    /**
     * Перерасчёт настроек рендера и камеры, при изменении размера окна
     */
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

    /**
     * Циклическая функция рендера
     */
    render(){
        stats.begin();

        //расчёт плавного зума
        this.smoothZoom();
        //отслеживание значения зума, для отправки события сворачивания всех нод
        this.listenZoom();

        this.renderer.render( this.scene, this.camera );

        //tween проверяет есть ли для него задание для анимации
        FBS.tween.update();

        stats.end();
        requestAnimationFrame( ()=> this.render() );
    }

    /**
     * Расчёт плавного зума
     * @returns {null}
     */
    smoothZoom(){
        if(
            (this.zoom.deltaY < 0 && this.frustumSize <= C.three.zoom.max) ||
            (this.zoom.deltaY > 0 && this.frustumSize >= C.three.zoom.min)
        ) return null;

        this.zoom.stepFrustum *= C.three.zoom.damping;

        if ((this.zoom.stepFrustum > 0 && this.zoom.stepFrustum > 0.000001) || (this.zoom.stepFrustum < 0 && this.zoom.stepFrustum < -0.000001)) {
            this.zoom.stepVector.x *= C.three.zoom.damping;
            this.zoom.stepVector.y *= C.three.zoom.damping;

            this.frustumSize = this.frustumSize - this.zoom.stepFrustum;
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

    /**
     * Отслеживание значения зума, для отправки события сворачивания всех нод
     */
    listenZoom(){
        if(this.frustumSize > C.three.zoom.fullCollapseBorder && !this.zoomEvent.outDispatched){
            this.canvas.dispatchEvent(this.zoomEvent.outEvent);
            this.zoomEvent.outDispatched = true;
            this.zoomEvent.inDispatched = false;
        } else if(this.frustumSize < C.three.zoom.fullCollapseBorder && !this.zoomEvent.inDispatched){
            this.canvas.dispatchEvent(this.zoomEvent.inEvent);
            this.zoomEvent.inDispatched = true;
            this.zoomEvent.outDispatched = false;
        }
    }

    /**
     * Добавляет объекты на сцену
     * @param objects
     */
    addObjectsToScene (objects){
        objects.map(o => {this.scene.add(o)});
    }

    /**
     * Удаляет объект со сцены
     * @param object
     */
    removeFromScene(object){
        this.scene.remove(object);
        if(object.geometry) object.geometry.dispose();
        if(object.material) object.material.dispose();
    }

    /**
     * Возвращает камеру
     * @returns {null|THREE.OrthographicCamera|*}
     */
    getCamera(){
        return this.camera;
    }

    /**
     * Возвращает сцену
     * @returns {null|THREE.Scene|*}
     */
    getScene(){
        return this.scene;
    }

    /**
     * Возвращает рендерер
     * @returns {null|THREE.WebGLRenderer|*}
     */
    getRenderer(){
        return this.renderer;
    }

    /**
     * Возвращает канвас
     * @returns {*}
     */
    getCanvas(){
        return this.canvas;
    }

    /**
     * Обновление темы
     */
    updateTheme(){
        this.scene.background.setStyle(ThemeControl.theme.scene.backgroundColor);
    }
}