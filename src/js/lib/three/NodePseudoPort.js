import Port from './NodePort';

export default class extends Port{
    constructor(direction, cNode) {
        const data = {
            id: -1,
            name: 'Show more',
            type: 'pseudo',
            mark: null
        }
        super(direction, data, cNode);
        this.type = 'pseudo';
        this.hidedCPorts = [];
        this.setName();
    }

    setName(){

    }

    changeLabelText(collapsed){
        const label = this.mesh.getObjectByName('portLabelText');
        if(collapsed){
            label.text = 'Show more' + ' (' + this.hidedCPorts.length + ')';
        } else {
            if(this.direction === 'input'){
                label.text = 'Hide inputs';
            } else {
                label.text = 'Hide outputs';
            }
        }
        label.visible = true;
    }

    removeLabelText(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.scale.set(0,0,1);
        label.text = '';
    }

    hideConnector(){
        const connector = this.mesh.getObjectByName('connector');
        connector.visible = false;
    }

    showConnector(){
        const connector = this.mesh.getObjectByName('connector');
        connector.visible = true;
    }

    getHidedCPorts(){
        return this.hidedCPorts;
    }

    setHidedCPorts(cPorts){
        this.hidedCPorts = cPorts;
    }
}