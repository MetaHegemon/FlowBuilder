/*
Контроль изменения размера ноды
 */

import * as THREE from 'three';
import NodeControl from '../three/node/NodeControl';
import C from "../Constants";

export default class{
    constructor() {
        this.active = false;    //флаг активности изменения размера
        this.cNode = null;      //класс изменяемой ноды
        this.resizer = null;    //ссылка на текущий 3д-объект ресайзера
        this.mNode = null;      //ссылка на 3д-объект изменяемой ноды
    }

    /**
     * Включение изменения
     * @param resizer {Mesh}
     */
    enable(resizer){
        this.active = true;
        this.resizer = resizer;
        this.cNode = resizer.userData.instance;
        this.mNode = this.cNode.get3dObject();

        //возврат всех нод на свои координаты по Z
        NodeControl.moveNodesToOriginZ();
        //поднятие изменяемой ноды на верхний уровень по Z
        this.cNode.moveToOverAllZ();
    }

    /**
     * Перемещение ресайзера и изменение размера ноды
     * @param pos {Vector2} позиция курсора
     */
    move(pos){
        let x = this.mNode.worldToLocal(new THREE.Vector3(pos.x, pos.y, 0)).x;
        //ограничиваем координату х в заданных переделах
        x = Math.max(C.nodeMesh.mount.minWidth, Math.min(C.nodeMesh.mount.maxWidth, x));
        this.resizer.position.setX(x);
        //изменение значения ширины ноды
        this.cNode.setNodeWidth(Math.round(x));
        //изменение геометрии ноды
        this.cNode.scaleNode();
    }

    /**
     * Возвращает 3д-объект изменяемой ноды
     * @returns {Group}
     */
    get3dObject(){
        return this.cNode.get3dObject();
    }

    /**
     * Завершение изменения размера ноды
     */
    disable(){
        this.active = false;
        this.cNode = null;
        this.resizer = null;
        this.mNode = null;
    }
}