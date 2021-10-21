/**
 * Модуль управления нодами
 */

import Node from './Node';
import C from '../../Constants';
import Layers from '../../Layers';
import FBS from "../../FlowBuilderStore";
import Drag from './../../interactive/DragControl';
import NodeMenu from './Menu/Menu';
import TextEditor from './../TextEditor';

//for jsDoc
import * as THREE from 'three';

class NodeControl {
    constructor() {
        this.mNodes = [];       //список всех 3д объектов нод
        this.cNodes = [];       //список всех классов-нод
        this.moveableElements = [
            'backCornerTopLeft', 'backBodyTop', 'backCornerTopRight', 'backBody',
            'backCornerBottomLeft', 'backBodyBottom', 'backCornerBottomRight', 'miniBackMount',

            'frontTop', 'frontCornerTopLeft', 'frontBodyTop', 'frontCornerTopRight', 'frontHeader',
            'miniFrontTop', 'frontBody',

            'miniFrontBody', 'frontBottom', 'frontFooter', 'frontCornerBottomLeft', 'frontCornerBottomRight',
            'frontBodyBottom', 'miniFrontBottom',

            'miniBackMount',
            'miniIndicatorMount',

            'indicator'
        ];

        this.select = {
            cNodes: []
        };
        this.hovered = [];                          //контейнер для хранения всех подсвеченных объектов
    }

    init(){
        this.setEvents();
    }

    /**
     * Установка обработчиков событий
     */
    setEvents(){
        //событие изменения зума, что бы понять когда нужно коллапсировать ноды
        FBS.dom.canvas.addEventListener('zoomChange', e => this.listenZoom(e.detail.frustumSize));
    }

    onPointerDown(e, intersects){
        const firstObject = intersects[1].object;
        if(!firstObject) return null;
        if (e.buttons === 1) {
            if (this.isItMoveableElement(firstObject.name)) {
                FBS.dom.setCursor('move'); //когда скажут, что нужно переделать обратно, просто скопируй туда где Drag.enable
            }
        }
    }

    onPointerMove(e, intersects, NodeResizer, pointerDownPos, pointerPos3d){
        const firstObject = intersects[1].object;
        if(!firstObject) return null;
        //clog(firstObject.name);
        if(e.buttons === 0) //без нажатия
        {
            if (firstObject.name === 'portLabelText') {
                const cPort = firstObject.userData.portInstance;
                cPort.hoverLabel();
                this.hovered.push(firstObject);
                FBS.dom.setCursor('pointer');
            } else if (firstObject.name === 'learnMoreButton') {
                const cNode = firstObject.userData.instance;
                cNode.hoverLearnMoreButton();
                this.hovered.push(firstObject);
                FBS.dom.setCursor('pointer');
            } else if(firstObject.name === 'noticeButton'){
                const cNode = firstObject.userData.instance;
                cNode.hoverNoticeButton();
                this.hovered.push(firstObject);
                FBS.dom.setCursor('pointer');
            } else if (firstObject.name === 'collapseButton') {
                FBS.dom.setCursor('pointer');
            } else if (firstObject.name === 'playButton') {
                FBS.dom.setCursor('pointer');
            } else if (firstObject.name === 'menuButton') {
                FBS.dom.setCursor('pointer');
            } else if (firstObject.name === 'nodeWidthResizer') {
                FBS.dom.setCursor('col-resize');
            } else {
                FBS.dom.resetCursor();
            }
        }
        else if(e.buttons === 1) //левая
        {
            if (firstObject.name === 'nodeWidthResizer') {
                //включение изменения ширины ноды
                NodeResizer.enable(firstObject);
            } else if (this.isItMoveableElement(firstObject.name)) {
                //включение начала перемещения ноды
                if (this.isMoved(pointerPos3d, pointerDownPos)) {
                    const cNode = intersects[0].object.userData.instance;
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
                    this.moveNodesToOriginZ();
                    Drag.enable('node', objectsForDrag, pointerPos3d);
                    //поднятие всех перемещаемых нод на верхний уровень по Z
                    objectsForDrag.map(cN => cN.moveToOverAllZ());
                }
            }
        }
    }

    onPointerUp(e, intersects){
        const firstObject = intersects[1].object;
        if(!firstObject) return null;
        if (e.button === 0) {
            //обработка нажатия на разные элементы сцены
            if (firstObject.name === 'collapseButton') {
                this.onCollapseButtonClick(firstObject);
            } else if (firstObject.name === 'playButton') {
                this.onPlayButtonClick(firstObject);
            } else if (firstObject.name === 'menuButton') {
                this.onMenuButtonClick(firstObject);
            } else if(firstObject.name === 'portLabelText'){
                this.onPortLabelClick(firstObject);
            } else if(firstObject.name === 'noticeButton'){
                this.onNoticeButtonClick(firstObject);
            } else if(this.isItMoveableElement(firstObject.name)){
                const cNode = firstObject.userData.instance;
                this.onNodeClick(cNode, e.shiftKey, e.ctrlKey);
                //сброс 'move' курсора
                FBS.dom.resetCursor();
            }
        }
    }

    /**
     * Снятие подсветки со всех объектов, кроме аргумента
     * @param exceptObject {THREE.Object3D} - 3д-объект, который надо исключить
     */
    unhoverObjects(exceptObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === exceptObject) continue;
            if (this.hovered[i].name === 'portLabelText') {
                const cPort = this.hovered[i].userData.portInstance;
                cPort.unhoverLabel();
            } else if (this.hovered[i].name === 'learnMoreButton') {
                const cNode = this.hovered[i].userData.instance;
                cNode.unhoverLearnMoreButton();
            } else if(this.hovered[i].name === 'noticeButton'){
                const cNode = this.hovered[i].userData.instance;
                cNode.unhoverNoticeButton();
            }
            this.hovered.splice(i, 1);
            i -= 1;
        }
    }

    /**
     * Обработчик кнопки управления сворачиванием ноды
     * @param mCollapse {THREE.Object3D} - 3д-объект кнопки
     */
    onCollapseButtonClick(mCollapse){
        const cNode = mCollapse.userData.instance;
        cNode.middleCollapseNode();
    }

    /**
     * Обработчик нажатия на кнопку управления play
     * @param mPlay {THREE.Object3D}
     */
    onPlayButtonClick(mPlay){
        const cNode = mPlay.userData.instance;
        cNode.play();
    }

    /**
     * Обработчик нажатия на кнопку управления menu
     * @param button {Mesh}
     * @returns {Generator<*, void, *>}
     * @constructor
     */
    onMenuButtonClick(button) {
        const cNode = button.userData.instance;
        const data = [
            {
                name: 'Execute',
                type: 'regular',
                callback: () => {
                    cNode.play();
                    NodeMenu.hide();
                }
            },
            {
                name: 'Hide',
                type: 'regular',
                callback: () => {
                    cNode.remove();
                    NodeMenu.hide();
                }
            },
            {
                name: 'Rename',
                type: 'regular',
                callback: () => {
                    const title = cNode.getTitleMesh();
                    TextEditor.enable(title);
                    NodeMenu.hide();
                }
            },
            {
                name: 'Delete',
                type: 'warning',
                callback: () => {
                    cNode.remove();
                    NodeMenu.hide();
                }
            }
        ];

        NodeMenu.show(button.parent.localToWorld(button.position.clone()), data);
    }

    /**
     * Обработчик клика на подпись порта
     * @param mPort {THREE.Group} - 3д-объект порта
     */
    onPortLabelClick(mPort){
        const cPort = mPort.userData.portInstance;
        if(cPort.type === 'pseudo'){
            //Сворачивание разворачивание портов в ноде
            const cNode = cPort.getCNode();
            cNode.shortCollapsePorts(cPort);
        }
    }

    /**
     *
     * @param mButton {Text}
     */
    onNoticeButtonClick(mButton){
        const cNode = mButton.userData.instance;
        cNode.onNoticeButtonClick();
    }

    /**
     *  Обработчик нажатия на ноду
     * @param cNode {Node} - класс ноды
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
            this.moveNodesToOriginZ([cNode]);
            //текущая нода поднимается над всеми остальными
            cNode.moveToOverAllZ();
            if(!shiftKey && !ctrlKey) {
                this.unselectAllSelectedNodesExcept(cNode);
            }
            this.addCNodeToSelected(cNode);
            cNode.select();
        }
    }

    /**
     * Снятие выделения всех нод
     */
    unselectAllNodes(){
        this.select.cNodes.map(l=>l.unselect());
        this.select.cNodes = [];
    }

    /**
     * Подсветка выбранных нод
     */
    highlightSelectedNodes(){
        this.select.cNodes.map(cN => cN.select());
    }

    /**
     * Снятие выбора со всех нод за исключением
     * @param cNode {Node} - класс ноды, который нужно проигнорировать при снятии выбора
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
     * Добавление ноды в список выбранных
     * @param cNode {Node}
     */
    addCNodeToSelected(cNode){
        const isExist = this.select.cNodes.some(n=>{
            return n === cNode;
        });

        if(!isExist) this.select.cNodes.push(cNode);
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
     * Проверяем значение зума, после определённой границы сворачиваем или разворачиваем все ноды
     * @param frustumSize {number}
     */
    listenZoom(frustumSize){
        if(frustumSize > C.three.zoom.fullCollapseBorder && !this.isNodesFullCollapsed){
            this.fullCollapseNodes(true);
            this.isNodesFullCollapsed  = true;
        } else if(frustumSize < C.three.zoom.fullCollapseBorder && this.isNodesFullCollapsed){
            this.fullCollapseNodes(false);
            this.isNodesFullCollapsed  = false;
        }
    }

    /**
     * Сворачивание/разворачивание всех нод при zoomOut/zoomIn
     * @param isNeedCollapse {Boolean}
     */
    fullCollapseNodes(isNeedCollapse){
        this.cNodes.map((node)=>node.fullCollapseNode(isNeedCollapse));
    }

    /**
     * Создание экземпляра класса ноды
     * @param data - входные данные о нодах
     */
    buildNodes(data) {
        for (let i = 0; i < data.length; i += 1) {
            const cNode = new Node(data[i], i * Layers.nodeStep);
            this.mNodes.push(cNode.get3dObject());
            this.cNodes.push(cNode);
        }
    }

    /**
     * Возвращает список всех 3д-объектов нод
     * @returns {[Group]}
     */
    get3dObjects() {
        return this.mNodes;
    }

    /**
     * Возвращает список всех нод
     * @returns {[Node]}
     */
    getCNodes() {
        return this.cNodes;
    }

    /**
     * Перемещение всех нод на свою координату по Z, за исключением ноды
     * @param exceptMNodes - 3д-объект ноды
     */
    moveNodesToOriginZ(exceptMNodes) {
        if (exceptMNodes) {
            this.cNodes.map(cN => {
                const mNode = cN.get3dObject();
                const isExcept = exceptMNodes.some(n => {
                    return n === mNode;
                });
                if (!isExcept) cN.moveToOriginZ();
            });
        } else {
            this.cNodes.map(n => n.moveToOriginZ());
        }
    }

    isItMoveableElement(name){
        for(let i = 0; i < this.moveableElements.length; i += 1){
            if(this.moveableElements[i] === name){
                return true;
            }
        }
        return false;
    }

    /**
     *  Обновление темы
     */
    updateTheme() {
        this.cNodes.map(n => n.updateTheme());
    }
}

const nodeControl = new NodeControl();

export default nodeControl;