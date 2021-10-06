import * as THREE from "three";
import ThemeControl from './../../themes/ThemeControl';
import FBS from "../FlowBuilderStore";
import C from "../Constants";

export default class {
    constructor(direction, data, cNode) {
        this.type = 'regular'; //TODO see instance
        this.cNode = cNode;
        this.direction = direction;
        this.data = data;
        this.mesh = this.create();
        this.cLines = [];

        this.connectorActive = true;
    }

    create(){
        const port = FBS.nodeAssets.getPort(this.data.name, this.data.type, this.direction, this.data.mark).clone();

        port.traverse(function (object) {
            object.userData.portClass = this;
        }.bind(this));

        return port
    }

    hover(){
        this.hoverLabel(); //TODO что за фигня?
    }

    unhover(){
        this.unhoverLabel();
    }

    hoverLabel(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.material.color.setStyle(ThemeControl.theme.node.port.label.hoverColor);
    }

    unhoverLabel(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.material.color.setStyle(ThemeControl.theme.node.portTypes[this.data.type].labelColor);
    }

    getMPort(){
        return this.mesh;
    }

    getMConnector(){
        return this.mesh.getObjectByName('connector');
    }

    selectConnector(){
        const connector = this.mesh.getObjectByName('connector');
        connector.material.color.setStyle(ThemeControl.theme.line.selectedColor);
    };

    getConnectorPos(){
        const pos = new THREE.Vector3();
        const connector = this.mesh.getObjectByName('connector');
        connector.getWorldPosition(pos);
        return pos;
    }

    unselectConnector(){
        this.resetConnectorColor();

    }

    setConnectorActive(){
        this.connectorActive = true;
        this.resetConnectorColor();
    }

    setConnectorInactive(){
        this.connectorActive = false;
        const connector = this.mesh.getObjectByName('connector');
        connector.material.color.setStyle(ThemeControl.theme.node.portTypes["pseudo"].connectorColor);
    }

    getColor(){
        return ThemeControl.theme.node.portTypes[this.data.type].connectorColor;
    }

    resetConnectorColor(){
        const connector = this.mesh.getObjectByName('connector');
        connector.material.color.setStyle(ThemeControl.theme.node.portTypes[this.data.type].connectorColor);
    }

    getCLines(){
        return this.cLines;
    }

    setCLines(cLines){
        this.cLines = cLines;
    }

    removeCLine(cLine){
        for(let i = 0; i < this.cLines.length; i += 1){
            if(this.cLines[i] === cLine){
                this.cLines.splice(i, 1);
                break;
            }
        }
    }

    getCNode(){
        return this.cNode;
    }

    getMLabel(){
        return this.mesh.getObjectByName('portLabelText');
    }

    hide(){
        this.mesh.scale.set(0,0,0);
    }
/*
    show(){
        this.mesh.scale(1, 1, 1);
    }
*/

    addToNode(mNode){
        mNode.add(this.mesh);
    }

    animateHide(callback){
        new FBS.tween.Tween( this.mesh.scale)
            .to( {x: 0, y: 0, z: 0}, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
                this.mesh.removeFromParent();
            })
            .start();
    }

    animateShow(callback){
        new FBS.tween.Tween( this.mesh.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
            })
            .start();
    }

    hideLabel(){
        const label = this.getMLabel();
        label.scale.set(0,0,1);
    }

    animateShowLabel(callback){
        const label = this.getMLabel();
        new FBS.tween.Tween( label.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.footerLabelHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
            })
            .start();
    }

    animateMoving(to, callback){
        new FBS.tween.Tween( this.mesh.position)
            .to( to, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
            })
            .start();
    }

    moving(to){
        const pos = this.mesh.position;
        this.mesh.position.set(to.x ? to.x : pos.x, to.y ? to.y : pos.y, to.z ? to.z : pos.z);
    }

    updateTheme(){
        let m;

        m = this.mesh.getObjectByName('connector');
        if (m) m.material.color.setStyle(
            this.connectorActive ? ThemeControl.theme.node.portTypes[this.data.type].connectorColor : ThemeControl.theme.node.portTypes["pseudo"].connectorColor
        );

        m = this.mesh.getObjectByName('portLabelText');
        if(m){
            m.color = ThemeControl.theme.node.portTypes[this.data.type].labelColor;
            m.font = ThemeControl.theme.fontPaths.mainNormal;
        }

        m = this.mesh.getObjectByName('mark');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.portTypes[this.data.type].markColor);

        m = this.mesh.getObjectByName('markLabel');
        if(m){
            m.color = ThemeControl.theme.node.portTypes[this.data.type].markFontColor;
            m.font = ThemeControl.theme.fontPaths.mainNormal;
        }
    }
};