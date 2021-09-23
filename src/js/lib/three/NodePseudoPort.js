
import Port from './NodePort';
import {Text} from "troika-three-text";
import C from "../Constants";

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

        this.addUnderline();
    }

    setName(){

    }

    addUnderline(){
        const labelObj = this.mesh.getObjectByName('portLabel');
        const label = this.mesh.getObjectByName('portLabelText');

        const underline = new Text();
        underline.text = '';
        underline.name = 'portLabelUnderline';
        underline.font = C.fontPaths.mainNormal;
        underline.fontSize = C.nodeMesh.port.label.fontSize;
        underline.color = C.nodeMesh.portTypes[this.data.type].labelColor;
        underline.anchorX = this.direction === 'input' ? 'left' : 'right';
        underline.anchorY = 'bottom';
        underline.position.set(
            this.direction === 'input' ? C.nodeMesh.port.label.underlineLeftMargin : -C.nodeMesh.port.label.underlineLeftMargin,
            label.position.y - C.nodeMesh.port.label.underlineTopMargin,
            label.position.z
        );

        underline.visible = true;
        labelObj.add(underline);
    }

    changeLabelText(collapsed){
        const label = this.mesh.getObjectByName('portLabelText');
        const underline = this.mesh.getObjectByName('portLabelUnderline');
        if(collapsed){
            label.text = 'Show more' + ' (' + this.hidedCPorts.length + ')';
            underline.text = '_________________';
        } else {
            if(this.direction === 'input'){
                label.text = 'Hide inputs';
                underline.text = '_____________';
            } else {
                label.text = 'Hide outputs';
                underline.text = '_______________';
            }
        }
        label.visible = true;
        underline.visible = true;
    }

    removeLabelText(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.visible = false;
        const underline = this.mesh.getObjectByName('portLabelUnderline');
        underline.visible = false;
        label.text = '';
        underline.text = '';
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