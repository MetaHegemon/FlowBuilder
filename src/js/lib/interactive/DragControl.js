import * as THREE from 'three';
import FBS from './../FlowBuilderStore';

export default class{
    constructor() {
        this.active = false;
        this.offset = new THREE.Vector2();
        this.object = null;
    }

    dragObject(pos){
        this.object.position.set(pos.x + this.offset.x, pos.y + this.offset.y, this.object.position.z);
    }

    getObject(){
        return this.object;
    }

    enable(object, pos){
        this.active = true;
        this.object = object;
        const cNode = this.object.userData.nodeClass;
        cNode.moveToOverAllZ();
        FBS.nodeControl.moveNodesToOriginZ(cNode);
        this.offset.x = object.position.x - pos.x;
        this.offset.y = object.position.y - pos.y;
    }

    disable(){
        this.active = false;
        this.object = null;
    }

}