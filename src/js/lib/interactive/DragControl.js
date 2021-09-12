import * as THREE from 'three';

export default class{
    constructor() {
        this.active = false;
        this.offset = new THREE.Vector2();
        this.object = null;
        this.constDelta = 3;
    }

    dragObject(pos){
        this.object.position.set(pos.x + this.offset.x, pos.y + this.offset.y, this.object.position.z);
    }

    isMoved(currentPos, startPos){
        return Math.abs(currentPos.x - startPos.x) > this.constDelta || Math.abs(currentPos.y - startPos.y) > this.constDelta;
    }

    getObject(){
        return this.object;
    }

    enable(object, pos){
        this.active = true;
        this.object = object;
        this.offset.x = object.position.x - pos.x;
        this.offset.y = object.position.y - pos.y;
    }

    disable(){
        this.active = false;
        this.object = null;
    }

}