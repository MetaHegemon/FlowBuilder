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

    moveNodesToOriginZ(exceptMNodes){
        for(let i = 0; i < this.cNodes.length; i += 1){
            const mNode = this.cNodes[i].getMNode();
            let isExcept = exceptMNodes.some(n=>{
                return n === mNode;
            });
            if(!isExcept){
                this.cNodes[i].moveToOriginZ();
            }
        }
    }

    moveAllNodesToOriginZ(){
        this.cNodes.map(n=>{
            n.moveToOriginZ();
        });
    }
}