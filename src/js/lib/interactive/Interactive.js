/*
Логика интерактивности на сцене. Взаимодействие с объектами сцены курсором и клавишами
 */

import * as THREE from 'three';
import DragControl from './DragControl';
import C from "./../Constants";
import { SelectionBox } from './SelectionBox';
import  SelectionHelper  from './SelectHelper';
import ThemeControl from "../../themes/ThemeControl";
import NodeControl from "../three/node/NodeControl";
import LineControl from '../three/line/LineControl';
import FBS from './../FlowBuilderStore';
import TextEditor from "./../three/TextEditor";
import NodeWidthResizer from './NodeWidthResizer';
import WatchPointControl from "../three/line/WatchPointControl";
import WatchPoint from "../three/line/WatchPoint";
import WatchPointResizer from "./WatchPointResizer";

//Класс контроля перемещения
const Drag = new DragControl();

//Класс контроля изменения ширины нод
const NodeResizer = new NodeWidthResizer();

//Контроль изменения размера вотчпоинта
const WPResizer = new WatchPointResizer();

export default class{
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        this.textEditor = new TextEditor();

        this.pan = {                            //объект для управления перемещения по сцене
            active: false,
            spacePressed: false,
            camPosTo: {x: 0, y: 0},
            screenLastPos: {x: 0, y: 0}
        }
        this.select = {                         //объект для отслеживания выделенных объектов на сцене
            active: false,
            box: new SelectionBox( FBS.sceneControl.getCamera(), FBS.sceneControl.getScene()),
            helper: new SelectionHelper( this.box, FBS.sceneControl.renderer, 'selectBox' ),
            cLines: [],
            cNodes: []
        }

        this.screenPos = new THREE.Vector2();       //ссылка на координаты экрана от -1 до 1
        this.pointerPos3d = new THREE.Vector2();    //ссылка на координаты курсора в сцене
        this.pointerDownPos = new THREE.Vector2();  //ссылка на координаты последнего нажатия курсора
        this.hovered = [];                          //контейнер для хранения всех подсвеченных объектов
        this.selectedOnPointerDown = null;          //ссылка на последний объект, на который было нажатие

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
        FBS.dom.canvas.addEventListener('needFullCollapse', () => this.fullCollapseNode(true));
        FBS.dom.canvas.addEventListener('needFullUnCollapse', () => this.fullCollapseNode(false));
    }

    /**
     * Обработчик нажатия клавиши
     * @param e
     * @returns {null}
     */
    onKeyDown(e){
        //при редактировании текста включается свой обработчик нажатий, этот игнорируется
        if(this.textEditor.active) return null;
        if(e.code === 'Space' && !this.pan.spacePressed) {
            //фиксируем нажатие пробела для последующего перемещения по сцене левым поинтером
            this.pan.spacePressed = true;
            FBS.dom.canvas.classList.add('grab');
        } else if(e.code === 'KeyT'){
            //смена темы сцены
            if(!e.repeat) {
                ThemeControl.switch();
                ThemeControl.update(FBS.dom, FBS.sceneControl, NodeControl, LineControl);
            }
        } else if(e.code === 'Backspace' || e.code === 'Delete'){
            //удаление выделенных элементов (линий)
            if(this.select.cLines.length > 0){
                LineControl.remove(this.select.cLines);
            }
        }
    }

    /**
     * Обработчик отжатия клавиши
     * @param e
     * @returns {null}
     */
    onKeyUp(e){
        //при редактировании текста включается свой обработчик нажатий, этот игнорируется
        if(this.textEditor.active) return null;
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
        if(this.textEditor.active)
        //выключение редактирования, при клике не на заголовок
        {
            const titleIntersect = this.checkOnIntersect(this.intersects, ['title']);
            if (!titleIntersect) {
                this.textEditor.accept();
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
                if (e.buttons === 1) {
                    let intersect;
                    if(this.intersects[0].object.name === 'nodeWidthResizer')
                    {
                        //сохраняем 3д-объект ресайзера, на которое произведено нажатие, для изменения её ширины
                        this.selectedOnPointerDown = this.intersects[0].object;
                    }
                    else if(this.intersects[0].object.name === 'watchPointCornerResizeReactor'){
                        //сохраняем 3д-объект ресайзера, на которое произведено нажатие, для изменения размера вотчпоинта
                        this.selectedOnPointerDown = this.intersects[0].object;
                    }
                    else if (NodeControl.isItMoveableElement(this.intersects[0].object.name)) {
                        //сохраняем 3д-объект ноды, на которое произведено нажатие, для её перемещения
                        this.selectedOnPointerDown = this.intersects[0].object.userData.nodeClass.get3dObject();
                        this.setCursor('move'); //когда скажут, что нужно переделать обратно, просто скопируй туда где Drag.enable
                    }
                    else if(WatchPointControl.isItMoveableElement(this.intersects[0].object.name)){
                        this.selectedOnPointerDown = this.intersects[0].object.userData.class.get3dObject();
                        this.setCursor('move');
                    }
                    else if ((intersect = this.checkOnIntersect(this.intersects, ['connector'])))
                    {
                        const cPort = intersect.object.userData.portClass;
                        if(cPort.connectorActive) {
                            if (cPort.type !== 'pseudo') {
                                //если с портом можно взаимодействовать, то
                                //сохраняем 3д-объект коннектора, на которое произведено нажатие
                                this.selectedOnPointerDown = intersect.object;
                                this.unselectAllLines();
                                //включаем рисование линии
                                LineControl.enable(intersect.object);
                            }
                        }
                    }
                }
            } else {
                //нажатие в пустоту
                if(e.buttons === 1) {
                    this.unselectAll();
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
            this.unselectAllNodes();
            this.select.box.endPoint.set(this.screenPos.x, this.screenPos.y, 0.5);
            let allSelected;
            if(e.ctrlKey){
                //при нажатом ctrl выделение нод при полном захвате
                allSelected = this.select.box.selectOnCapture();
            } else {
                //выделение нод при касании
                allSelected = this.select.box.selectOnTouch();
            }
            //сохраняем список всех выделенных нод
            allSelected.map(o=>{
                if (o.name === 'bigMount') {
                    const cNode = o.userData.nodeClass;
                    this.addCNodeToSelected(cNode);
                }
            });
            //подсветка выделенных нод
            this.select.cNodes.map(cN => cN.select());
        }
        else
        {
            //обновляем параметры луча (цель и направление)
            this.raycaster.setFromCamera(this.screenPos, FBS.sceneControl.camera);

            //сохраняем позицию курсора в сцене
            this.pointerPos3d.x = this.raycaster.ray.origin.x;
            this.pointerPos3d.y = this.raycaster.ray.origin.y;

            if(NodeResizer.active){
                //изменяем ширину ноды
                NodeResizer.move(this.pointerPos3d);
                LineControl.refreshLines([NodeResizer.get3dObject()]);
            } else if (Drag.active) {
                //перетаскиваем объекты
                Drag.dragObjects(this.pointerPos3d);

                if(Drag.type === 'node') {
                    //для ноды обновляем линии портов
                    LineControl.refreshLines(Drag.getObjects());
                } else if(Drag.type === 'watchPoint'){
                    WatchPointControl.recalculateEdgePositions(Drag.getObjects());
                    WatchPointControl.refreshLines(Drag.getObjects());
                }
            }
            else if (LineControl.active) //рисуем линию
            {
                //получаем список пересечений
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.checkOnIntersect(this.intersects, ['connectorMagnet']) &&
                    LineControl.canBeConnected(this.intersects[0].object)
                ) {
                    //примагничивание линии к порту назначения
                    const cPort = this.intersects[0].object.userData.portClass;
                    const pos = cPort.getConnectorPos();
                    LineControl.drawLineFromPos(pos.x, pos.y);
                } else {
                    //рисуем линию к курсору мыши
                    LineControl.drawLineFromPos(this.pointerPos3d.x, this.pointerPos3d.y);
                }
            }
            else if(WPResizer.active){
                WPResizer.move(this.pointerPos3d);
            }
            else
            {
                //получаем список пересечений
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);

                if (e.buttons === 0) { //подсветка или смена курсора при наведении на разные объекты сцены
                    if (this.intersects.length > 0) {
                        const firstObject = this.intersects[0].object;

                        if (firstObject.name === 'portLabelText') {
                            const cPort = firstObject.userData.portClass;
                            cPort.hoverLabel();
                            this.hovered.push(firstObject);
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'footerLabel') {
                            const cNode = firstObject.userData.nodeClass;
                            cNode.hoverFooterLabel();
                            this.hovered.push(firstObject);
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'connector') {
                            const cPort = firstObject.userData.portClass;
                            if(cPort.connectorActive) {
                                if (cPort.type !== 'pseudo') {
                                    this.setCursor('pointer');
                                }
                            }
                        } else if (firstObject.name === 'line')
                        {
                            if(LineControl.canBeSelected(firstObject)) {
                                this.setCursor('pointer');
                            }
                        } else if (firstObject.name === 'lineMarkPointer')
                        {
                            if(LineControl.canBeSelected(firstObject)){
                                const cLine = firstObject.userData.class;
                                cLine.hoverLineMark();
                                this.hovered.push(firstObject);
                                this.setCursor('pointer');
                            }
                        } else if (firstObject.name === 'collapseButton') {
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'playButton') {
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'menuButton') {
                            this.setCursor('pointer');
                        } else if (firstObject.name === 'nodeWidthResizer') {
                            this.setCursor('col-resize');
                        } else if (firstObject.name === 'watchPointCornerResizeReactor') {
                            this.setCursor('nwse-resize');
                        } else if (
                            firstObject.name === 'copyButton' || firstObject.name === 'exportButton' ||
                            firstObject.name === 'closeButton'
                        ){
                            const instance = firstObject.userData.class;
                            if(instance instanceof WatchPoint){
                                instance.hoverElementByName(firstObject.name);
                                this.hovered.push(firstObject);
                                this.setCursor('pointer');
                            }
                        } else {
                            this.unhoverObjects(firstObject);
                            this.resetCursor();
                        }
                    } else {
                        this.unhoverObjects(null);
                        this.resetCursor();
                    }
                } else if (e.buttons === 1) {
                    if (this.selectedOnPointerDown) {
                        if(this.selectedOnPointerDown.name === 'nodeWidthResizer'){
                            //включение изменения ширины ноды
                            NodeResizer.enable(this.selectedOnPointerDown);
                        } else if (this.selectedOnPointerDown.name === 'node') {
                            //включение начала перемещения ноды
                            if (this.isMoved(this.pointerPos3d, this.pointerDownPos)) {
                                const cNode = this.intersects[0].object.userData.nodeClass;
                                let objectsForDrag;
                                if (cNode.isSelected()) {
                                    objectsForDrag = this.select.cNodes;
                                    //сортируется список перемещаемых нод, что бы текущую поднять наверх,
                                    // что бы отличить её от остальных после перемещения
                                    objectsForDrag.sort((a, b) => {
                                        return a === cNode ? -1 : cNode === b;
                                    });
                                } else {
                                    objectsForDrag = [cNode];
                                }
                                //возврат всех нод на свои координаты по Z
                                NodeControl.moveNodesToOriginZ();
                                Drag.enable('node', objectsForDrag, this.pointerPos3d);
                                //поднятие всех перемещаемых нод на верхний уровень по Z
                                objectsForDrag.map(cN => cN.moveToOverAllZ());
                            }
                        } else if (this.selectedOnPointerDown.name === 'connector') {
                            //включаем рисование линии
                            if(this.intersects[0]) {
                                const firstObject = this.intersects[0].object;
                                if (firstObject.name === 'connector') {
                                    LineControl.enable(firstObject);
                                }
                            }
                        } else if(this.selectedOnPointerDown.name === 'watchPoint'){
                            Drag.enable('watchPoint', [this.selectedOnPointerDown.userData.class], this.pointerPos3d);
                        } else if(this.selectedOnPointerDown.name === 'watchPointCornerResizeReactor'){
                            WPResizer.enable(this.selectedOnPointerDown);
                        }
                    } else {

                    }
                } else {

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
            this.selectedOnPointerDown = null;
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
                this.resetCursor();
            } else if (LineControl.active) {
                //завершение рисования линии
                this.intersects = this.raycaster.intersectObjects(FBS.sceneControl.scene.children, true);
                if (
                    this.intersects.length > 0 &&
                    this.intersects[0].object.name === 'connector' &&
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
                    if (e.button === 0) {
                        const first = this.intersects[0];
                        //обработка нажатия на разные элементы сцены
                        if (first.object.name === 'collapseButton') {
                            this.onCollapseButtonClick(first.object);
                        } else if (first.object.name === 'playButton') {
                            this.onPlayButtonClick(first.object);
                        } else if (first.object.name === 'menuButton') {
                            this.onMenuButtonClick(first.object);
                        } else if(first.object.name === 'portLabelText'){
                            this.onPortLabelClick(first.object);
                        } else if(first.object.name === 'lineMarkPointer'){
                            if(LineControl.canBeSelected(first.object)){
                                const cLine = first.object.userData.class;
                                this.onWatchPointClick(cLine);
                            }
                        } else if(first.object.name === 'line'){
                            if(LineControl.canBeSelected(first.object)){
                                const cLine = first.object.userData.class;
                                this.onLineClick(cLine);
                            }
                        } else if(NodeControl.isItMoveableElement(first.object.name)){
                            const cNode = first.object.userData.nodeClass;
                            this.onNodeClick(cNode, e.shiftKey, e.ctrlKey);
                            //сброс 'move' курсора
                            this.resetCursor();
                        } else if(WatchPointControl.isItMoveableElement(first.object.name)){
                            this.resetCursor();
                        } else if (first.object.name === 'closeButton'){
                            const instance = first.object.userData.class;
                            if(instance instanceof WatchPoint){
                                this.onWatchPointCloseButtonClick(instance);
                            }
                        } else if (first.object.name === 'copyButton'){
                            const instance = first.object.userData.class;
                            if(instance instanceof WatchPoint){
                                this.onWatchPointCopyButtonClick(instance);
                            }
                        } else if(first.object.name === 'exportButton'){
                            const instance = first.object.userData.class;
                            if(instance instanceof WatchPoint){
                                this.onWatchPointExportButtonClick(instance);
                            }
                        }
                    }
                } else {

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
            let intersect;
            if((intersect = this.checkOnIntersect(this.intersects, ['title'])) && !this.textEditor.active){
                //включение редактирование заголовка
                this.textEditor.enable(intersect.object);
            } else if(NodeControl.isItMoveableElement(this.intersects[0].object.name)){
                //разворачивание полностью свёрнутой ноды
                const cNode = this.intersects[0].object.userData.nodeClass;
                if(cNode.fullCollapse.isCollapsed){
                    cNode.fullCollapseNode(false);
                }
            }
        }
    }

    /**
     * Обработчик клика на подпись порта
     * @param mPort - 3д-объект порта
     */
    onPortLabelClick(mPort){
        const cPort = mPort.userData.portClass;
        if(cPort.type === 'pseudo'){
            //Сворачивание разворачивание портов в ноде
            const cNode = cPort.getCNode();
            cNode.shortCollapsePorts(cPort);
        }
    }

    /**
     * Обработчик кнопки управления сворачиванием ноды
     * @param mCollapse - 3д-объект кнопки
     */
    onCollapseButtonClick(mCollapse){
        const cNode = mCollapse.userData.nodeClass;
        cNode.middleCollapseNode();
    }

    /**
     * Сворачивание/разворачивание всех нод при zoomOut/zoomIn
     * @param isNeedCollapse
     */
    fullCollapseNode(isNeedCollapse){
        const cNodes = NodeControl.getCNodes();
        cNodes.map((node)=>{
            node.fullCollapseNode(isNeedCollapse);
        });
    }

    /**
     * Обработчик нажатия на кнопку управления play
     * @param mPlay
     */
    onPlayButtonClick(mPlay){
        const cNode = mPlay.userData.nodeClass;
        cNode.play(mPlay);
    }

    /**
     * Обработчик нажатия на кнопку управления menu
     */
    onMenuButtonClick(){

    }

    /**
     * Снятие подсветки со всех объектов, кроме аргумента
     * @param exceptObject - 3д-объект, который надо исключить
     */
    unhoverObjects(exceptObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === exceptObject) continue;
            if(this.hovered[i].name === 'portLabelText'){
                const cPort = this.hovered[i].userData.portClass;
                cPort.unhoverLabel();
            } else if(this.hovered[i].name === 'footerLabel'){
                const cNode = this.hovered[i].userData.nodeClass;
                cNode.unhoverFooterLabel();
            } else if(this.hovered[i].name === 'lineMarkPointer'){
                const cLine = this.hovered[i].userData.class;
                cLine.unhoverLineMark();
            } else if(
                this.hovered[i].name === 'copyButton' || this.hovered[i].name === 'exportButton' ||
                this.hovered[i].name === 'closeButton'
            ){
                const cWatchPoint = this.hovered[i].userData.class;
                cWatchPoint.unhoverElementByName(this.hovered[i].name);
            }
            this.hovered.splice(i, 1);
            i -= 1;
        }
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
     * Проверка изменилось ли положение поинтера после нажатия
     * @param currentPos {Vector2}
     * @param startPos {Vector2}
     * @returns {boolean}
     */
    isMoved(currentPos, startPos){
        return Math.abs(currentPos.x - startPos.x) > C.deltaOnPointerInteractive ||
            Math.abs(currentPos.y - startPos.y) > C.deltaOnPointerInteractive;
    }

    /**
     *  Обработчик нажатия на ноду
     * @param cNode {Object} - класс ноды
     * @param shiftKey  {Boolean}
     * @param ctrlKey   {Boolean}
     */
    onNodeClick (cNode, shiftKey, ctrlKey) {
        if (cNode.isSelected()) {
            if(ctrlKey) {
                //нода удаляется из списка выбранных
                for (let i = 0; i < this.select.cNodes.length; i += 1) {
                    if (this.select.cNodes[i] === cNode) {
                        this.select.cNodes.splice(i, 1);
                        break;
                    }
                }
                //снимается подсветка
                cNode.unselect();
            } else if(shiftKey){

            } else {
                if(this.select.cNodes.length > 1){
                    //текущая нода остаётся выбранной, с остальных выбор снимается
                    this.unselectAllSelectedNodesExcept(cNode);
                } else {
                    this.select.cNodes = [];
                    cNode.unselect();
                }
            }
        } else {
            //все ноды возвращаются на свои координаты по Z
            NodeControl.moveNodesToOriginZ([cNode]);
            //текущая нода поднимается над всеми остальными
            cNode.moveToOverAllZ();
            if(shiftKey || ctrlKey) {
                this.addCNodeToSelected(cNode);
            } else {
                this.unselectAllSelectedNodesExcept(cNode);
                this.addCNodeToSelected(cNode);
            }
            cNode.select();
        }
    }

    /**
     * Обработчик скрытия вотч-поинта
     * @param instance {WatchPoint}
     */
    onWatchPointCloseButtonClick(instance){
        instance.hide();
    }

    /**
     * Обработчик копирования из вотч-поинта
     * @param instance {WatchPoint}
     */
    onWatchPointCopyButtonClick(instance){
        clog('onWatchPointCopyButtonClick');
    }

    /**
     * Обработчик экспорта из вотч поинта
     * @param instance{WatchPoint}
     */
    onWatchPointExportButtonClick(instance){
        clog('onWatchPointExportButtonClick');
    }

    /**
     * Снятие выбора со всех нод за исключением
     * @param cNode - класс ноды, который нужно проигнорировать при снятии выбора
     */
    unselectAllSelectedNodesExcept(cNode){
        for (let i = 0; i < this.select.cNodes.length; i += 1) {
            if (this.select.cNodes[i] === cNode) continue;
            this.select.cNodes[i].unselect();
            this.select.cNodes.splice(i, 1);
            i -= 1;
        }
    }

    /**
     * Добавление ноды к выбранным
     * @param cNode
     */
    addCNodeToSelected(cNode){
        const isExist = this.select.cNodes.some(n=>{
            return n === cNode;
        });

        if(!isExist) this.select.cNodes.push(cNode);
    }

    /**
     * Обработка нажатия на линию
     * @param cLine - класс линии
     */
    onLineClick(cLine){
        clog('onLineClick');
        let isSelected = false;
        for(let i = 0; i < this.select.cLines.length; i += 1){
            if(this.select.cLines[i] === cLine){
                isSelected = true;
                this.select.cLines.splice(i, 1);
                break;
            }
        }
        if(isSelected){
            cLine.unselect();
        } else {
            this.select.cLines.push(cLine);
            cLine.select();

        }
    }

    /**
     *
     * @param cLine {Line}
     */
    onWatchPointClick(cLine){
        clog('onWatchPointClick');
        cLine.showWatchPoint();
    }

    /**
     * Снятие выделения со всех линий и нод
     */
    unselectAll(){
        this.unselectAllNodes();
        this.unselectAllLines();
    }

    /**
     * Снятие выделения всех нод
     */
    unselectAllNodes(){
        this.select.cNodes.map(l=>l.unselect());
        this.select.cNodes = [];
    }

    /**
     * Снятие выделения всех линий
     */
    unselectAllLines(){
        this.select.cLines.map(l=>l.unselect());
        this.select.cLines = [];
    }

    /**
     * Установка стиля курсора
     * @param style {String}
     */
    setCursor(style){
        if(FBS.dom.canvas.style.cursor !== style) FBS.dom.canvas.style.cursor = style;
    }

    /**
     * Сброс курсора
     */
    resetCursor(){
        FBS.dom.canvas.style.cursor = 'default';
    }
}