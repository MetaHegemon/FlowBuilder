import * as THREE from 'three';
import C from './../Constants';

export default class{
    constructor() {
        this.active = false;
        this.offset = new THREE.Vector2();
        this.object = null;
    }

    dragObject(pos){
        this.object.position.set(pos.x + this.offset.x, pos.y + this.offset.y, C.layers.drag);
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
        const cNode = this.object.userData.nodeClass;
        this.object.position.setZ(cNode.getOriginZ());
        this.object = null;
    }

}