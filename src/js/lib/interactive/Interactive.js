/*
Логика интерактивности на сцене. Взаимодействие с объектами сцены курсором и клавишами
 */

import * as THREE from 'three';
import Drag from './DragControl';
import { SelectionBox } from './SelectionBox';
import  SelectionHelper  from './SelectHelper';
import ThemeControl from "../../themes/ThemeControl";
import NodeControl from "../three/node/NodeControl";
import LineControl from '../three/line/LineControl';
import FBS from './../FlowBuilderStore';
import TextEditor from "./../three/TextEditor";
import NodeWidthResizer from './NodeWidthResizer';
import WatchPointControl from "../three/line/WatchPoint/WatchPointControl";
import WatchPointResizer from "./WatchPointResizer";
import NodeMenu from './../three/node/Menu/Menu';

//for jsDoc
import Line from "../three/line/Line";

//Класс контроля изменения ширины нод
const NodeResizer = new NodeWidthResizer();

//Контроль изменения размера вотчпоинта
const WPResizer = new WatchPointResizer();

class Interactive{
    constructor() {

    }

    init(){
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];

        this.pan = {                            //объект для управления перемещения по сцене
            active: false,
            spacePressed: false,
            camPosTo: {x: 0, y: 0},
            screenLastPos: {x: 0, y: 0}
        }
        this.select = {                         //объект для отслеживания выделенных объектов на сцене
            active: false,
            box: new SelectionBox( FBS.sceneControl.getCamera(), FBS.sceneControl.getScene()),
            helper: new SelectionHelper( this.box, FBS.sceneControl.renderer, 'selectBox' )
        }

        this.screenPos = new THREE.Vector2();       //ссылка на координаты экрана от -1 до 1
        this.pointerPos3d = new THREE.Vector2();    //ссылка на координаты курсора в сцене
        this.pointerDownPos = new THREE.Vector2();  //ссылка на координаты последнего нажатия курсора

        this.setEvents();
    }

    /**
     * Установка всех обработчиков событий
     */
    setEvents(){
        FBS.dom.canvas.addEventListener('pointermove', (e)=>this.onPointerMove(e));
        FBS.dom.canvas.addEventListener('pointerdown', (e)=>this.onPointerDown(e));
        FBS.dom.canvas.addEventListener('pointerup', (e)=>this.onPointerUp(e));
        FBS.dom.canvas.addEventListener('dblclick', (e)=>this.onDblclick(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        FBS.dom.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
        //события вещающие при переходе зума камеры за или под определённый порог
    }

    /**
     * Обработчик нажатия клавиши
     * @param e
     * @returns {null}
     */
    onKeyDown(e){
        //при редактировании текста включается свой обработчик нажатий, этот игнорируется
        if(TextEditor.active) return null;
        if(e.code === 'Space' && !this.pan.spacePressed) {
            //фиксируем нажатие пробела для последующего перемещения по сцене левым поинтером
            this.pan.spacePressed = true;
            FBS.dom.canvas.classList.add('grab');
        } else if(e.code === 'KeyT'){
            //смена темы сцены
            if(!e.repeat) {
                ThemeControl.switch();
                ThemeControl.update(FBS.dom, FBS.sceneControl, NodeControl, LineControl, NodeMenu);
            }
        } else if(e.code === 'Backspace' || e.code === 'Delete'){
            LineControl.removeSelectedLines();
        }
    }

    /**
     * Обработчик отжатия клавиши
     * @param e
     * @returns {null}
     */
    onKeyUp(e){
        //при редактировании текста включается свой обработчик нажатий, этот игнорируется
        if(TextEditor.active) return null;
        if(e.code === 'Space') {
            //фиксируем отжатие пробела для отключения возможности последующего перемещения по сцене левым поинтером
            this.pan.spacePressed = false;
            FBS.dom.canvas.classList.remove('grab');
        }
    }

    /**
     * Обработчик контекстного меню. Отключает действие по умолчанию
     * @param e
     */
    onContextMenu(e){
        e.preventDefault();
    }

    /**
     * Обработчик нажатия поинтера
     * @param e
     */
    onPointerDown(e){
        if(TextEditor.active)
        //выключение редактирования, при клике не на заголовок
        {
            if(this.intersects.length < 1 ||
                (this.intersects.length > 0 && this.intersects[0].object !== TextEditor.get3dObject())){
                TextEditor.accept();
            }
        }

        if(NodeMenu.active){
            if(this.intersects.length < 1 || this.intersects.length > 0 && this.intersects[0].object.name !== 'nodeMenuBigMount') {
                NodeMenu.hide();
            }
        }

        //сохранение координаты последнего нажатия поинтера, что бы впоследствии определить сместился ли поинтер
        this.pointerDownPos.x = this.pointerPos3d.x;
        this.pointerDownPos.y = this.pointerPos3d.y;

        if(this.pan.spacePressed || e.button === 1)
        //включение начала перемещения по сцене
        {
            FBS.dom.canvas.classList.remove('grab');
            FBS.dom.canvas.classList.add('grabbing');
            this.pan.active = true;
        }
        else
        {
            if (this.intersects.length > 0) {
                const firstObject = this.intersects[0].object;
                if(firstObject.name === 'nodeBigMount'){
                    NodeControl.onPointerDown(e, this.intersects);
                } else if(firstObject.name === 'watchPointBigMount'){
                    WatchPointControl.onPointerDown(e, this.intersects);
                } else if(firstObject.name === 'connector'){
                    LineControl.onPointerDown(e, this.intersects);
                }
            } else {
                //нажатие в пустоту
                if(e.buttons === 1) {
                    this.unselectAll();
                    LineControl.hideWatchPoints();

                    //активируется мультивыделение
                    this.select.active = true;
                    this.select.helper.onSelectStart(e);
                    this.select.box.startPoint.set(this.screenPos.x, this.screenPos.y, 0.5);
                }
            }
        }

        if((this.pan.spacePressed && e.buttons === 1) || e.buttons === 4) {
            //сохранение текущей позиции камеры, от которой будет перемещение по сцене
            this.pan.camPosTo.x = FBS.sceneControl.camera.position.x;
            this.pan.camPosTo.y = FBS.sceneControl.camera.position.y;
        }
    }

    onPointerMove(e) {
        this.unhoverObjects(); //TODO solve this for better performance
        this.screenPos.x = (e.clientX / FBS.dom.canvas.clientWidth) * 2 - 1;
        this.screenPos.y = -(e.clientY / FBS.dom.canvas.clientHeight) * 2 + 1;

        if (this.pan.active && (e.buttons === 1 || e.buttons === 4)) //перемещение камеры по сцене
        {
            let dx = (this.pan.screenLastPos.x - this.screenPos.x) / FBS.sceneControl.camera.zoom;
            let dy = (this.pan.screenLastPos.y - this.screenPos.y) / FBS.sceneControl.camera.zoom;

            this.pan.camPosTo.x = this.pan.camPosTo.x + dx * FBS.sceneControl.camera.right;
            this.pan.camPosTo.y = this.pan.camPosTo.y + dy * FBS.sceneControl.camera.top;

            FBS.sceneControl.camera.position.x = FBS.sceneControl.camera.position.x + (this.pan.camPosTo.x - FBS.sceneControl.camera.position.x);
            FBS.sceneControl.camera.position.y = FBS.sceneControl.camera.position.y + (this.pan.camPosTo.y - FBS.sceneControl.camera.position.y);
        }
        else if(this.select.active) //SELECTING
        {
            this.select.helper.onSelectMove(e);
            NodeControl.unselectAllNodes();
            LineControl.unselectAllLines();
            this.select.box.endPoint.set(this.screenPos.x, this.screenPos.y, 0.5);
            let allSelected;
            if(e.ctrlKey){
                //при нажатом ctrl выделение нод при полном захвате
                allSelected = this.select.box.selectOnCapture();
            } else {
                //выделение нод при касании
                allSelected = this.select.box.selectOnTouch(true, true);
            }
            //сохраняем список всех выделенных нод
            allSelected.map(o=>{
                if (o.name === 'nodeBigMount') {
                    const cNode = o.userData.instance;
                    NodeControl.addCNodeToSelected(cNode);
                } else if(o.name === 'thinLine'){
                    const cLine = o.userData.instance;
                    LineControl.addCLineToSelected(cLine);
                }
            });
            //подсветка выделенных нод
            NodeControl.highlightSelectedNodes();
            LineControl.highlightSelectedLines();
        }
        else {
            //обновляем параметры луча (цель и направление)
            this.raycaster.setFromCamera(this.screenPos, FBS.sceneControl.camera);

            //сохраняем позицию курсора в сцене
            this.pointerPos3d.x = this.raycaster.ray.origin.x;
            this.pointerPos3d.y = this.raycaster.ray.origin.y;

            if (NodeResizer.active) {
                //изменяем ширину ноды
                NodeResizer.move(this.pointerPos3d);
                LineControl.refreshLines([NodeResizer.get3dObject()]);
            } else if (Drag.active) {
                //перетаскиваем объекты
                Drag.dragObjects(this.pointerPos3d);

                if (Drag.type === 'node') {
                    //для ноды обновляем линии портов
                    LineControl.refreshLines(Drag.getObjects());
                } else if (Drag.type === 'watchPoint') {
                    WatchPointControl.afterMove(Drag.getObjects());
                }
            } else if (LineControl.active) //рисуем линию
            {
                //получаем список пересечений
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.checkOnIntersect(this.intersects, ['connectorMagnet']) &&
                    LineControl.canBeConnected(this.intersects[0].object)
                ) {
                    //примагничивание линии к порту назначения
                    const cPort = this.intersects[0].object.userData.portInstance;
                    const pos = cPort.getConnectorPos();
                    LineControl.drawLineFromPos(pos.x, pos.y);
                } else {
                    //рисуем линию к курсору мыши
                    LineControl.drawLineFromPos(this.pointerPos3d.x, this.pointerPos3d.y);
                }
            } else if (WPResizer.active) {
                WPResizer.move(this.pointerPos3d);
            } else {
                //получаем список пересечений
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);

                if (this.intersects.length > 0) {
                    const firstObject = this.intersects[0].object;
                    if (firstObject.name === 'nodeBigMount') {
                        NodeControl.onPointerMove(e, this.intersects, NodeResizer, this.pointerDownPos, this.pointerPos3d);
                    } else if (firstObject.name === 'watchPointBigMount') {
                        WatchPointControl.onPointerMove(e, this.intersects, WPResizer,  this.pointerPos3d);
                    } else if(firstObject.name === 'nodeMenuBigMount'){
                        NodeMenu.onPointerMove(e, this.intersects);
                    } else if (
                        firstObject.name === 'connector' ||
                        firstObject.name === 'fatLine' ||
                        firstObject.name === 'lineMarkPointer'
                    ) {
                        LineControl.onPointerMove(e, this.intersects);
                    }
                } else {
                    FBS.dom.resetCursor();
                }
            }
        }

        //сохраняем последнюю позицию камеры, что бы вычислить дельту перемещения камеры
        this.pan.screenLastPos.x = this.screenPos.x;
        this.pan.screenLastPos.y = this.screenPos.y;
    }

    /**
     * Обработчик отжатия поинтера
     * @param e
     */
    onPointerUp(e){
        if(this.pan.active){
            //отключение перемещения по сцене
            this.pan.active = false;
            if(this.pan.spacePressed) {
                FBS.dom.canvas.classList.add('grab');
            } else {
                FBS.dom.canvas.classList.remove('grab');
            }
            FBS.dom.canvas.classList.remove('grabbing');
        } else if(this.select.active){
            //отключение мультивыделения
            this.select.active = false;
            this.select.helper.onSelectOver(e);
        } else {
            if(NodeResizer.active){
                //выключение изменения ширины ноды
                NodeResizer.disable();
            } else if (Drag.active) {
                if(Drag.type === 'node') {
                    const objects = Drag.getObjects();
                    //возврат всех нод на свои координаты по Z, кроме той, за которую перемещали остальные она всегда первая
                    NodeControl.moveNodesToOriginZ([objects[0]]);
                }
                //выключение перемещения
                Drag.disable();
                FBS.dom.resetCursor();
            } else if (LineControl.active) {
                //завершение рисования линии
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    (this.intersects[0].object.name === 'connector' || this.intersects[0].object.name === 'connectorMagnet') &&
                    LineControl.canBeConnected(this.intersects[0].object)
                ) {
                    LineControl.connect(this.intersects[0].object);
                } else {
                    LineControl.disable();
                }
            } else if(WPResizer.active){
                //выключение изменения размеров вотчпоинта
                WPResizer.disable();
            } else {
                if (this.intersects.length > 0) {
                    const firstObject = this.intersects[0].object;
                    if(firstObject.name === 'nodeBigMount'){
                        NodeControl.onPointerUp(e, this.intersects);
                    } else if(firstObject.name === 'watchPointBigMount'){
                        WatchPointControl.onPointerUp(e, this.intersects);
                    } else if(firstObject.name === 'lineMarkPointer' || firstObject.name === 'fatLine'){
                        LineControl.onPointerUp(e, this.intersects);
                    } else if(firstObject.name === 'nodeMenuBigMount'){
                        NodeMenu.onPointerUp(e, this.intersects);
                    }
                }
            }
            this.pointerDownPos.x = this.pointerDownPos.y = 0;
        }
    }

    /**
     * Обработчик двойного нажатия поинтером
     */
    onDblclick(){
        if(this.intersects.length > 0) {
            const firstObject = this.intersects[0].object;
            if( firstObject.name === 'title' && !TextEditor.active){
                //включение редактирование заголовка
                TextEditor.enable(firstObject);
            } else if(NodeControl.isItMoveableElement(this.intersects[0].object.name)){
                //разворачивание полностью свёрнутой ноды
                const cNode = this.intersects[0].object.userData.instance;
                if(cNode.fullCollapse.isCollapsed){
                    cNode.fullCollapseNode(false);
                }
            }
        }
    }

    /**
     * Снятие подсветки со всех объектов, кроме аргумента
     */
    unhoverObjects(){
        NodeControl.unhoverObjects();
        LineControl.unhoverObjects();
        WatchPointControl.unhoverObjects();
    }

    /**
     * Поиск объектов в списке пересеченных по именам
     * @param intersects {[]}
     * @param names {[]}
     * @returns {null|Object}
     */
    checkOnIntersect(intersects, names){
        let res = null;
        cycle: for(let i = 0; i < intersects.length; i += 1){
            for(let j = 0; j < names.length; j += 1) {
                if (intersects[i].object.name === names[j]) {
                    res = intersects[i];
                    break cycle;
                }
            }
        }
        return res;
    }

    /**
     * Снятие выделения со всех линий и нод
     */
    unselectAll(){
        NodeControl.unselectAllNodes();
        LineControl.unselectAllLines();
    }
}

const interactive = new Interactive();

export default interactive;