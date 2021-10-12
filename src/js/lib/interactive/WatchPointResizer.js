/*
Контроль изменения размера вотчпоинта
 */

import * as THREE from 'three';
import C from "../Constants";

export default class{
    constructor() {
        this.active = false;    //флаг активности изменения размера
        this.cWatchPoint = null;      //класс изменяемой ноды
        this.resizer = null;    //ссылка на текущий 3д-объект ресайзера
        this.mWatchPoint = null;      //ссылка на 3д-объект изменяемой ноды
    }

    /**
     * Включение изменения
     * @param resizer {Mesh}
     */
    enable(resizer){
        this.active = true;
        this.resizer = resizer.parent;
        this.cWatchPoint = resizer.userData.class;
        this.mWatchPoint = this.cWatchPoint.get3dObject();

        //возврат всех нод на свои координаты по Z
        //NodeControl.moveNodesToOriginZ();
        //поднятие изменяемой ноды на верхний уровень по Z
        //this.cNode.moveToOverAllZ();
    }

    /**
     * Перемещение ресайзера и изменение размера вотчпоинта
     * @param pos {Vector2} позиция курсора
     */
    move(pos){
        const localPos = this.mWatchPoint.worldToLocal(new THREE.Vector3(pos.x, pos.y, 0));
        //ограничиваем координату х в заданных переделах
        const x = Math.max(C.watchPoint.minWidth, Math.min(C.watchPoint.maxWidth, localPos.x));
        const y = Math.max(C.watchPoint.minHeight, Math.min(C.watchPoint.maxHeight, Math.abs(localPos.y)));

        this.resizer.position.set(x, y, this.resizer.position.z);
        //изменение значения ширины ноды
        this.cWatchPoint.setWidth(Math.round(x));
        this.cWatchPoint.setHeight(Math.round(y));
        //изменение геометрии ноды
        this.cWatchPoint.scaleWatchPoint();
    }

    /**
     * Возвращает 3д-объект изменяемого вотч поинта
     * @returns {Group}
     */
    get3dObject(){
        return this.cWatchPoint.get3dObject();
    }

    /**
     * Завершение изменения размера вотчпоинта
     */
    disable(){
        this.active = false;
        this.cWatchPoint = null;
        this.resizer = null;
        this.mWatchPoint = null;
    }
}