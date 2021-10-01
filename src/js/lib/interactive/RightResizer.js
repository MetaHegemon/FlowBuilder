import * as THREE from 'three';
import FBS from './../FlowBuilderStore';
import C from "../Constants";

export default class{
    constructor() {
        this.active = false;
        this.cNode = null;
        this.resizer = null;
        this.mNode = null;
    }

    enable(resizer){
        this.active = true;
        this.resizer = resizer;
        this.cNode = resizer.userData.nodeClass;
        this.mNode = this.cNode.getMNode();

        FBS.nodeControl.moveAllNodesToOriginZ();
        this.cNode.moveToOverAllZ();
    }

    move(pos){
        let x = this.mNode.worldToLocal(new THREE.Vector3(pos.x, pos.y, 0)).x;
        x = Math.max(C.nodeMesh.mount.minWidth, Math.min(C.nodeMesh.mount.maxWidth, x));
        this.resizer.position.setX(x);
        this.cNode.setNodeWidth(Math.round(x));
        this.cNode.scaleNode();
    }

    getMNode(){
        return this.cNode.getMNode();
    }

    disable(){
        this.active = false;
        this.cNode = null;
        this.resizer = null;
        this.mNode = null;
    }
}