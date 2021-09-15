import C from "../Constants";
import * as THREE from "three";
import {Text} from "troika-three-text";

export default class {
    constructor(direction, data, cNode) {
        this.cNode = cNode;
        this.connectorMesh = null;
        this.direction = direction;
        this.data = data;
        this.portMesh = this.createPort();
        this.cLines = [];
    }

    createPort(){
        const portMesh = this.portMesh = new THREE.Object3D();
        portMesh.name = 'port';

        const connector = this.createPortConnector();
        portMesh.userData.connector = connector;
        portMesh.add(connector);

        const mark = this.createPortMark();
        portMesh.userData.mark = mark;
        portMesh.add(mark);

        const label = this.createPortLabel();
        portMesh.userData.label = label;
        portMesh.add(label);

        this.portMesh.userData.class = this;
        this.portMesh.userData.data = this.data;

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
        connectorMesh.userData.class = this;
        return connectorMesh;
    }

    createPortMark(){
        const markObject = new THREE.Object3D();

        const w = C.nodeMesh.port.markWidth;
        const h = C.nodeMesh.port.markHeight;
        const r = C.nodeMesh.port.markCornerRadius;
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
        label.fontSize = C.nodeMesh.port.markFontSize;
        label.color = C.nodeMesh.portTypes[this.data.type].fontColor;
        label.userData.originColor = C.nodeMesh.portTypes[this.data.type].fontColor
        label.anchorX = 'center';
        label.anchorY = 'middle';
        label.position.set(C.nodeMesh.port.markWidth/2, 0, 0);

        markObject.userData.label = label;
        markObject.add(label);

        markObject.position.set(
            this.direction === 'input' ? C.nodeMesh.port.markLeftMargin : -C.nodeMesh.port.markLeftMargin - C.nodeMesh.port.markWidth,
            0,
            0
        );

        return markObject;
    }

    createPortLabel(){
        const label = new Text();
        label.text = this.data.name;
        label.name = 'portLabel';
        label.fontSize = C.nodeMesh.port.fontSize;
        label.color = C.nodeMesh.portTypes[this.data.type].labelColor;
        label.anchorX = this.direction === 'input' ? 'left' : 'right';
        label.anchorY = 'middle';
        label.position.set(this.direction === 'input' ? C.nodeMesh.port.labelLeftMargin : -C.nodeMesh.port.labelLeftMargin, 0, 0);

        label.userData.methods = {};
        label.userData.methods.hover = ()=>{
            label.color = C.nodeMesh.port.labelHoverColor;
        }
        label.userData.methods.unhover = ()=>{
            label.color = C.nodeMesh.portTypes[this.data.type].labelColor;
        }

        return label;
    }

    getMPort(){
        return this.portMesh;
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