import C from "../Constants";
import * as THREE from "three";
import {Text} from "troika-three-text";

export default class {
    constructor(direction, data, cNode) {
        this.type = 'regular';
        this.cNode = cNode;
        this.label = null;
        this.connectorMesh = null;
        this.direction = direction;
        this.data = data;
        this.mesh = this.createPort();
        this.cLines = [];
    }

    getCLines(){
        return this.cLines;
    }

    setCLines(cLines){
        this.cLines = cLines;
    }

    getCNode(){
        return this.cNode;
    }

    createPort(){
        const portMesh = new THREE.Object3D();
        portMesh.name = 'port';

        const connector = this.createPortConnector();
        portMesh.userData.connector = connector;
        portMesh.add(connector);

        if(this.data.mark) {
            const mark = this.createPortMark();
            portMesh.userData.mark = mark;
            portMesh.add(mark);
        }

        const label = this.label = this.createPortLabel();
        portMesh.userData.label = label;
        portMesh.add(label);
        portMesh.userData.data = this.data;

        //set class for all children
        portMesh.traverse(function (object) {
            object.userData.portClass = this;
        }.bind(this));

        return portMesh
    }

    createPortConnector(){
        const w = C.nodeMesh.port.connectorWidth;
        const h = C.nodeMesh.port.connectorHeight;
        const r = C.nodeMesh.port.connectorCornerRadius;

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
        markMountMesh.userData.originColor = C.nodeMesh.portTypes[this.data.type].markColor;

        markObject.add(markMountMesh);

        const label = new Text();
        label.text = this.data.mark;
        label.name = 'markLabel';
        label.font = C.fontPaths.main;
        label.fontSize = C.nodeMesh.port.mark.fontSize;
        label.color = C.nodeMesh.portTypes[this.data.type].fontColor;
        label.userData.originColor = C.nodeMesh.portTypes[this.data.type].fontColor
        label.anchorX = 'center';
        label.anchorY = 'middle';
        label.position.set(C.nodeMesh.port.mark.width/2, 0, 0);

        markObject.userData.label = label;
        markObject.add(label);

        markObject.position.set(
            this.direction === 'input' ? C.nodeMesh.port.mark.leftMargin : -C.nodeMesh.port.mark.leftMargin - C.nodeMesh.port.mark.width,
            0,
            0
        );

        return markObject;
    }

    createPortLabel(){
        const label = new Text();
        label.text = this.data.name;
        label.name = 'portLabel';
        label.font = C.fontPaths.main;
        label.fontSize = C.nodeMesh.port.fontSize;
        label.color = C.nodeMesh.portTypes[this.data.type].labelColor;
        label.anchorX = this.direction === 'input' ? 'left' : 'right';
        label.anchorY = 'middle';
        const posX = this.data.mark ? C.nodeMesh.port.label.leftMargin : C.nodeMesh.port.mark.leftMargin;
        label.position.set(this.direction === 'input' ? posX : -posX, 0, 0);

        return label;
    }

    hover(){
        this.hoverLabel();
    }

    unhover(){
        this.unhoverLabel();
    }

    hoverLabel(){
        this.label.color = C.nodeMesh.port.label.hoverColor;
    }

    unhoverLabel(){
        this.label.color = C.nodeMesh.portTypes[this.data.type].labelColor;
    }

    getMPort(){
        return this.mesh;
    }

    getMConnector(){
        return this.connectorMesh;
    }

    selectConnector = ()=>{
        this.connectorMesh.userData.selected = true;
        this.connectorMesh.material.color.setStyle(C.nodeMesh.port.connectorSelectedColor);
    };

    getConnectorPos(){
        const pos = new THREE.Vector3();
        this.connectorMesh.getWorldPosition(pos);
        return pos;
    }

    unselectConnector = ()=>{
        this.connectorMesh.userData.selected = false;
        this.connectorMesh.material.color.setStyle(C.nodeMesh.portTypes[this.data.type].connectorColor);
    };
};