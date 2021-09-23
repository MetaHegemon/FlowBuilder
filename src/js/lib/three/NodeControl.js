import Node from '../three/Node';
import C from './../Constants';

export default class {
    constructor() {
        this.nodeMeshes = [];
    }

    buildNodes (data, animationControl){
        for(let i = 0; i < data.length; i += 1){
            const node = new Node(data[i], i * C.layers.nodeStep, animationControl);
            this.nodeMeshes.push(node.mesh);
        }
    }

    getNodes (){
        return this.nodeMeshes;
    }
}