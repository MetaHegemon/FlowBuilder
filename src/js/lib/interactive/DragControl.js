import * as THREE from 'three';
import FBS from './../FlowBuilderStore';

export default class{
    constructor() {
        this.active = false;
        this.objects = [];
        this.offsets = [];
    }

    dragObject(pos){
        for(let i = 0; i < this.objects.length; i += 1){
            this.objects[i].position.set(pos.x + this.offsets[i].x, pos.y + this.offsets[i].y, this.objects[i].position.z);
        }
    }

    getObjects(){
        return this.objects;
    }

    enable(cNodes, pos){
        FBS.nodeControl.moveAllNodesToOriginZ();

        this.active = true;
        cNodes.map(cN=>{
            cN.moveToOverAllZ();
            const mNode = cN.getMNode()
            this.objects.push(mNode);
            this.offsets.push({x: mNode.position.x - pos.x, y: mNode.position.y - pos.y});
        });
    }

    disable(){
        this.active = false;
        FBS.nodeControl.moveNodesToOriginZ([this.objects[0]]);
        this.objects = [];
        this.offsets = [];
    }

}