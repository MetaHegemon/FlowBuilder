/*
Объект контроля перемещения
 */

//import for description
import Node from '../three/node/Node';
import WatchPoint from "../three/watchPoint/WatchPoint";

export default class{
    constructor() {
        this.active = false;        //флаг активности перемещения
        this.type = null;           //тип перетаскиваемого элемента node/watchPoint/etc..
        this.objects = [];          //список перемещаемых объектов
        this.offsets = [];          //смещение объектов относительно курсора мыши, эквивалентен this.objects
    }

    /**
     * Перемещение объектов по x и y
     * @param pos {Vector2}
     */
    dragObjects(pos){
        for(let i = 0; i < this.objects.length; i += 1){
            this.objects[i].position.set(pos.x + this.offsets[i].x, pos.y + this.offsets[i].y, this.objects[i].position.z);
        }
    }

    /**
     * Возврат списка перемещаемых объектов
     * @returns {[]|*}
     */
    getObjects(){
        return this.objects;
    }

    /**
     * Включение перемещения
     * @param type {String} тип перетаскиваемого элемента
     * @param objects {[Node|WatchPoint]} список классов для перемещения
     * @param pos {Vector2} начальное смещение нод относительно курсора мыши
     */
    enable(type, objects, pos){
        this.active = true;
        this.type = type;
        objects.map(o=>{
            const m = o.get3dObject()
            this.objects.push(m);
            this.offsets.push({x: m.position.x - pos.x, y: m.position.y - pos.y});
        });
    }

    /**
     * Завершение перемещения
     */
    disable(){
        this.active = false;
        this.type = null;
        this.objects = [];
        this.offsets = [];
    }

}