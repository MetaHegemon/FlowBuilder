/*
Объект контроля перемещения нод
 */
import FBS from './../FlowBuilderStore';

export default class{
    constructor() {
        this.active = false;        //флаг активности перемещения
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
     * @param cNodes {[]} список классов нод для перемещения
     * @param pos {Vector2} начальное смещение нод относительно курсора мыши
     */
    enable(cNodes, pos){
        //возврат всех нод на свои координаты по Z
        FBS.nodeControl.moveNodesToOriginZ();

        this.active = true;
        cNodes.map(cN=>{
            //поднятие всех перемещаемых нод на верхний уровень по Z
            cN.moveToOverAllZ();
            const mNode = cN.getMNode()
            this.objects.push(mNode);
            this.offsets.push({x: mNode.position.x - pos.x, y: mNode.position.y - pos.y});
        });
    }

    /**
     * Завершение перемещения
     */
    disable(){
        this.active = false;
        //возврат всех нод на свои координаты по Z, кроме той, за которую перемещали остальные она всегда первая
        FBS.nodeControl.moveNodesToOriginZ([this.objects[0]]);
        this.objects = [];
        this.offsets = [];
    }

}