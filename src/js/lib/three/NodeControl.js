import Node from '../three/Node';

export default class {
    constructor() {
        this.nodeData = [];
        this.nodeMeshes = [];
    }

    setData(nodeData){
        //TODO need convert to NodeControl format
        this.nodeData = nodeData;
    }

    buildNodes (){
        for(let i = 0; i < this.nodeData.length; i += 1){
            const node = new Node(this.nodeData[i]);

            this.nodeMeshes.push(node.mesh);
        }
    }

    getNodes (){
        return this.nodeMeshes;
    }
}