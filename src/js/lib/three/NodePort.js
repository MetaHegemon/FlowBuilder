import C from "../Constants";
import * as THREE from "three";
import {Text} from "troika-three-text";

export default class {
    constructor(direction, data, cNode) {
        this.type = 'regular'; //TODO see instance
        this.cNode = cNode;
        this.label = null;
        this.connectorMesh = null;
        this.direction = direction;
        this.data = data;
        this.mesh = this.createPort();
        this.cLines = [];

        this.connectorActive = true;
    }

    createPort(){
        const portMesh = new THREE.Object3D();
        portMesh.name = 'port';

        const connector = this.createPortConnector();
        portMesh.add(connector);

        if(this.data.mark) {
            const mark = this.createPortMark();
            portMesh.userData.mark = mark;
            portMesh.add(mark);
        }

        const label = this.label = this.createPortLabel();
        portMesh.add(label);
        portMesh.userData.data = this.data;

        //set class for all children
        portMesh.traverse(function (object) {
            object.userData.portClass = this;
        }.bind(this));

        return portMesh
    }

    createPortConnector(){
        const w = C.nodeMesh.port.connector.width;
        const h = C.nodeMesh.port.connector.height;
        const r = C.nodeMesh.port.connector.cornerRadius;

        const shapeConnector = new THREE.Shape()
            .moveTo(0, h/2 - r)
            .lineTo(0, -h/2 + r)
            .quadraticCurveTo(0, -h/2, r, -h/2)
            .lineTo(w, -h/2)
            .lineTo( w, h/2)
            .lineTo(r, h/2)
            .quadraticCurveTo(0, h/2, 0, h/2 - r);

        const connectorMesh = this.connectorMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shapeConnector ),
            new THREE.MeshBasicMaterial({color: C.nodeMesh.portTypes[this.data.type].connectorColor})
        );
        if(this.direction === 'output') {
            connectorMesh.rotateZ(Math.PI);
            connectorMesh.position.set(w, 0 ,0);
        } else {
            connectorMesh.position.set(-w, 0 ,0);
        }

        connectorMesh.name = 'connector';
        connectorMesh.userData.selected = false;
        return connectorMesh;
    }

    createPortMark(){
        const markObject = new THREE.Object3D();

        const w = C.nodeMesh.port.mark.width;
        const h = C.nodeMesh.port.mark.height;
        const r = C.nodeMesh.port.mark.cornerRadius;
        const markMountShape = new THREE.Shape()
            .moveTo(0, h/2-r)
            .quadraticCurveTo(0, h/2, r, h/2)
            .lineTo(w - r, h/2)
            .quadraticCurveTo(w, h/2, w, h/2 - r)
            .lineTo(w, -h/2 + r)
            .quadraticCurveTo(w, -h/2, w-r, -h/2)
            .lineTo(r, -h/2, 0, -h/2 + r)
            .quadraticCurveTo(0, -h/2, 0, -h/2 + r)
            .lineTo(0, h/2 - r);
        const markMountMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( markMountShape ),
            new THREE.MeshBasicMaterial({color: C.nodeMesh.portTypes[this.data.type].markColor})
        );
        markMountMesh.name = 'mark';

        markObject.add(markMountMesh);

        const label = new Text();
        label.text = this.data.mark;
        label.name = 'markLabel';
        label.font = C.fontPaths.mainNormal;
        label.fontSize = C.nodeMesh.port.mark.fontSize;
        label.color = C.nodeMesh.portTypes[this.data.type].fontColor;

        //label.lineHeight =
        label.anchorX = 'center';
        label.anchorY = 'middle';
        label.position.set(C.nodeMesh.port.mark.width/2 + C.nodeMesh.port.mark.label.leftMargin, C.nodeMesh.port.mark.label.topMargin, 0);

        markObject.userData.label = label;
        markObject.add(label);

        const posX = this.direction === 'input' ? C.nodeMesh.port.mark.leftMargin : -C.nodeMesh.port.mark.leftMargin - C.nodeMesh.port.mark.width
        const posY = C.nodeMesh.port.height/2 - C.nodeMesh.port.mark.topMargin;
        markObject.position.set(posX, posY, 0);

        return markObject;
    }

    createPortLabel(){
        const labelObj = new THREE.Object3D();
        labelObj.name = 'portLabel';

        const label = new Text();
        label.text = this.data.name;
        label.name = 'portLabelText';
        label.font = C.fontPaths.mainNormal;
        label.fontSize = C.nodeMesh.port.label.fontSize;
        label.color = C.nodeMesh.portTypes[this.data.type].labelColor;
        label.anchorX = this.direction === 'input' ? 'left' : 'right';
        label.anchorY = 'bottom';
        label.letterSpacing = C.nodeMesh.port.label.letterSpacing;
        labelObj.add(label);

        const posX = this.data.mark ? C.nodeMesh.port.label.leftMargin : C.nodeMesh.port.label.pseudoLeftMargin;
        labelObj.position.set(
            this.direction === 'input' ? posX : -posX,
            -C.nodeMesh.port.label.topMargin,
            0
        );

        return labelObj;
    }

    hover(){
        this.hoverLabel();
    }

    unhover(){
        this.unhoverLabel();
    }

    hoverLabel(){
        for(let i = 0; i < this.label.children.length; i += 1){
            this.label.children[i].color = C.nodeMesh.port.label.hoverColor;
        }
    }

    unhoverLabel(){
        for(let i = 0; i < this.label.children.length; i += 1){
            this.label.children[i].color = C.nodeMesh.portTypes[this.data.type].labelColor;
        }
    }

    getMPort(){
        return this.mesh;
    }

    getMConnector(){
        return this.connectorMesh;
    }

    selectConnector = ()=>{
        this.connectorMesh.userData.selected = true;
        this.connectorMesh.material.color.setStyle(C.nodeMesh.port.connector.selectedColor);
    };

    getConnectorPos(){
        const pos = new THREE.Vector3();
        this.connectorMesh.getWorldPosition(pos);
        return pos;
    }

    unselectConnector = ()=>{
        this.connectorMesh.userData.selected = false;
        this.resetConnectorColor();

    }

    setConnectorActive(){
        this.connectorActive = true;
        this.resetConnectorColor();
    }

    setConnectorInactive(){
        this.connectorActive = false;
        this.connectorMesh.material.color.setStyle(C.nodeMesh.portTypes["pseudo"].connectorColor);
    }

    getColor(){
        return C.nodeMesh.portTypes[this.data.type].connectorColor;
    }

    resetConnectorColor(){
        this.connectorMesh.material.color.setStyle(C.nodeMesh.portTypes[this.data.type].connectorColor);
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
};