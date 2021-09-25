import Node from '../three/Node';
import C from './../Constants';

export default class {
    constructor() {
        this.mNodes = [];
        this.cNodes = [];
    }

    buildNodes (data){
        for(let i = 0; i < data.length; i += 1){
            const cNode = new Node(data[i], i * C.layers.nodeStep);
            this.mNodes.push(cNode.getMNode());
            this.cNodes.push(cNode);
        }
    }

    getMNodes (){
        return this.mNodes;
    }

    getCNodes(){
        return this.cNodes;
    }

    updateTheme(){
        this.cNodes.map(cNode=>{
            cNode.updateTheme();
        });
    }

    moveNodesToOriginZ(exceptCNode){
        for(let i = 0; i < this.cNodes.length; i += 1){
            if(this.cNodes[i] === exceptCNode) continue;
            this.cNodes[i].moveToOriginZ();
        }
    }
}