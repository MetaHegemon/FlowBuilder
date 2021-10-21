/**
 * Модуль управления несколькими вотчпоинтами
 *
 */
import {Object3D} from "three";
import FBS from '../../../FlowBuilderStore';
import Drag from '../../../interactive/DragControl';

//for jsDoc
import WatchPoint from "./WatchPoint";

class WatchPointControl{
    constructor() {
        //список имён элементов вотчпоинта, за который вотчпоинт можно перетаскивать
        this.moveableElements = ['frontCornerTopLeft', 'frontCornerTopRight', 'frontBodyTop', 'frontHeader'];
        //контейнер для хранения всех подсвеченных объектов
        this.hovered = [];
    }

    onPointerDown(e, intersects) {
        const firstObject = intersects[1].object;
        if (e.buttons === 1) {
            if (this.isItMoveableElement(firstObject.name)) {
                FBS.dom.setCursor('move');
            }
        }
    }

    onPointerMove(e, intersects, WPResizer, pointerPos3d){
        const firstObject = intersects[1].object;
        if(e.buttons === 0) //без нажатияf
        {
            if (firstObject.name === 'cornerResizeReactor') { //rename to simple name
                FBS.dom.setCursor('nwse-resize');
            } else if (firstObject.name === 'copyButton' || firstObject.name === 'exportButton' || firstObject.name === 'closeButton') {
                const instance = firstObject.userData.instance;
                instance.hoverElementByName(firstObject.name);
                this.hovered.push(firstObject);
                FBS.dom.setCursor('pointer');
            } else {

                FBS.dom.resetCursor();
            }
        }
        else if(e.buttons === 1) //левая
        {
            if (this.isItMoveableElement(firstObject.name)) {
                Drag.enable('watchPoint', [firstObject.userData.instance], pointerPos3d);
            } else if (firstObject.name === 'cornerResizeReactor') {//rename to simple name
                WPResizer.enable(firstObject); //move to this
            }
        }
    }

    onPointerUp(e, intersects) {
        const firstObject = intersects[1].object;

        const instance = firstObject.userData.instance;
        if (e.button === 0) //левая
        {
            if (firstObject.name === 'closeButton') {
                this.onWatchPointCloseButtonClick(instance);
            } else if (firstObject.name === 'copyButton') {
                this.onWatchPointCopyButtonClick(instance);
            } else if (firstObject.name === 'exportButton') {
                this.onWatchPointExportButtonClick(instance);
            } else if (this.isItMoveableElement(firstObject.name)) {
                FBS.dom.resetCursor();
            }
        }
    }

    /**
     * Снятие подсветки со всех объектов, кроме аргумента
     * @param exceptObject - 3д-объект, который надо исключить
     */
    unhoverObjects(exceptObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === exceptObject) continue;

            if(this.hovered[i].name === 'copyButton' || this.hovered[i].name === 'exportButton' || this.hovered[i].name === 'closeButton'){
                const instance = this.hovered[i].userData.instance;
                instance.unhoverElementByName(this.hovered[i].name);
            }
            this.hovered.splice(i, 1);
            i -= 1;
        }
    }

    afterMove(objects){
        this.recalculateEdgePositions(objects);
        this.refreshLines(objects);
    }

    isItMoveableElement(name) {
        for(let i = 0; i < this.moveableElements.length; i += 1){
            if(this.moveableElements[i] === name){
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param objects {[Object3D]}
     */
    refreshLines(objects){
        objects.map(o => {
            const instance = o.userData.instance;
            instance.updateLine();
        });
    }

    /**
     *
     * @param objects {[Object3D]}
     */
    recalculateEdgePositions(objects){
        objects.map(o => {
            const instance = o.userData.instance;
            instance.calcEdgePositions();
        });
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
}

const watchPointControl = new WatchPointControl();

export default watchPointControl;