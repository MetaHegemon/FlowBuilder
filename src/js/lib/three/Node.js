import * as THREE from "three";
import C from "../Constants";
import {Text} from "troika-three-text";

export default class{
    constructor(data){
        this.backMountMesh = null;
        this.data = data;
        this.mesh = this.create();
    }

    create() {
        const nodeShieldHeight = this.calcNodeShieldHeight(this.data.inputs.length + this.data.outputs.length);

        const nodeObject = new THREE.Object3D();
        nodeObject.matrixWorld.makeTranslation(0, 1000, 0);
        nodeObject.updateWorldMatrix();
        nodeObject.updateMatrix();
        nodeObject.name = 'node';
        nodeObject.userData.data = this.data;

        //create title
        const title = this.createTitle(this.data.name);
        nodeObject.add(title);

        //create shield
        const shieldObject = new THREE.Object3D();
        const backMount = this.createBackMount(nodeShieldHeight);
        shieldObject.add(backMount);
        const frontMount = this.createFrontMount(nodeShieldHeight);
        shieldObject.add(frontMount);
        nodeObject.add(shieldObject);

        //header

        //ports
        const inputs = this.createInputPorts(this.data.inputs);
        for (let i = 0; i < inputs.length; i += 1) {
            nodeObject.add(inputs[i]);
        }
        nodeObject.userData.inPorts = inputs;

        const outputs = this.createOutputPorts(this.data.outputs, this.data.inputs);
        for (let i = 0; i < outputs.length; i += 1) {
            nodeObject.add(outputs[i]);
        }
        nodeObject.userData.outPorts = outputs;

        //footer
        const footer = this.createFooter(nodeShieldHeight);
        nodeObject.add(footer);

        nodeObject.position.set(this.data.position.x, this.data.position.y, C.layers[0]);

        //set superParent for children
        nodeObject.traverse(function (object) {
            if (object.name === 'node') return null;
            object.userData.superParent = nodeObject;
        });

        nodeObject.userData.selected = false;

        nodeObject.userData.methods = {};
        nodeObject.userData.methods.select = ()=>{
            nodeObject.userData.selected = true;
            this.backMountMesh.material.color.setStyle(C.nodeMesh.mount.backMountSelectedColor);
        }

        nodeObject.userData.methods.unselect = ()=>{
            nodeObject.userData.selected = false;
            this.backMountMesh.material.color.setStyle(C.nodeMesh.mount.backMountColor);
        }

        return nodeObject;
    }

    calcNodeShieldHeight(portsCount) {
        const portsHeight = portsCount * C.nodeMesh.port.height;
        return C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.headerHeight + portsHeight + C.nodeMesh.mount.footerHeight;
    }

    createTitle(name) {
        const title = new Text();
        title.text = name;
        title.fontSize = C.nodeMesh.title.fontSize;
        title.color = C.nodeMesh.title.fontColor;
        title.anchorX = 'left';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.title.leftMargin, 0, 0);
        title.name = 'title';
        return title;
    }

    createBackMount (height) {
        const mount = this.backMountMesh = this.createBackMountMesh({
            w: C.nodeMesh.mount.width,
            h: height,
            color: C.nodeMesh.mount.backMountColor
        });
        mount.name = 'backMount';
        mount.visible = true;

        return mount;
    }

    createBackMountMesh(settings){
        //w - width, h - height, color - color
        const h = settings.h;
        const w = settings.w;
        const color = settings.color;
        const radius = C.nodeMesh.mount.roundCornerRadius;

        const shape = new THREE.Shape();

        shape.moveTo(radius, 0);
        shape.lineTo(w - radius, 0);
        shape.quadraticCurveTo(w, 0 , w, -radius);
        shape.lineTo(w, -h + radius);
        shape.quadraticCurveTo(w, -h, w-radius, -h);
        shape.lineTo(radius, -h);
        shape.quadraticCurveTo(0, -h, 0, -h+radius);
        shape.lineTo(0, -radius);
        shape.quadraticCurveTo(0, 0, radius, 0);
        shape.closePath();

        const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshBasicMaterial({color: color ? color : 'red'});

        return new THREE.Mesh( geometry, material);
    }

    createFrontMount (height) {
        const mount = this.createFrontMountMesh({
            w: C.nodeMesh.mount.width - C.nodeMesh.mount.borderSize,
            h: height - C.nodeMesh.mount.borderSize
        });
        mount.name = 'frontMount';
        mount.position.set(C.nodeMesh.mount.borderSize / 2, -C.nodeMesh.mount.borderSize / 2, C.layers[1]);

        return mount;
    }

    createFrontMountMesh(settings){
        //w - width, h - height, headColor - color, bodyColor - color
        const h = settings.h;
        const w = settings.w;
        const headColor = C.nodeMesh.mount.frontHeadColor;
        const bodyColor = C.nodeMesh.mount.frontBodyColor;
        const footerColor = C.nodeMesh.mount.footerColor;
        const radius = C.nodeMesh.mount.roundCornerRadius;
        const footerHeight = C.nodeMesh.mount.footerHeight;

        const frontMountObject = new THREE.Object3D();
        //head
        const headShape = new THREE.Shape();
        headShape.moveTo(radius, 0);
        headShape.lineTo(w - radius, 0);
        headShape.quadraticCurveTo(w, 0, w, -radius);
        headShape.lineTo(0, -radius);
        headShape.quadraticCurveTo(0, 0, radius, 0);
        headShape.closePath();

        const headMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( headShape ),
            new THREE.MeshBasicMaterial({color: headColor ? headColor : 'red'})
        );
        headMesh.name = 'headFrontMount';
        frontMountObject.add(headMesh);

        //body
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(0, -radius);
        bodyShape.lineTo(w , -radius);
        bodyShape.lineTo(w, -h + footerHeight);
        bodyShape.lineTo(0, -h + footerHeight);
        bodyShape.closePath();

        const bodyMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( bodyShape ),
            new THREE.MeshBasicMaterial({color: bodyColor ? bodyColor : 'red'})
        );
        bodyMesh.name = 'bodyFrontMount';
        frontMountObject.add(bodyMesh);

        //footer
        const footerShape = new THREE.Shape();
        footerShape.moveTo(0, -h + footerHeight);
        footerShape.lineTo(w , -h + footerHeight);
        footerShape.lineTo(w, -h + radius);
        footerShape.quadraticCurveTo(w, -h, w-radius, -h);
        footerShape.lineTo(radius, -h);
        footerShape.quadraticCurveTo(0, -h, 0, -h + radius);
        footerShape.closePath();

        const footerMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( footerShape ),
            new THREE.MeshBasicMaterial({color: footerColor ? footerColor : 'red'})
        );
        footerMesh.name = 'footerFrontMount';
        frontMountObject.add(footerMesh);

        return frontMountObject;
    }

    createInputPorts (inputs){
        let currentYPos = - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.headerHeight - C.nodeMesh.port.height/2;
        const ports = [];
        for(let i = 0; i < inputs.length; i += 1) {
            const portObject = this.createEmptyPort('input', inputs[i].type);
            portObject.userData.label.text = inputs[i].name;
            portObject.userData.mark.userData.label.text = inputs[i].mark;
            portObject.userData.connector.userData.port = portObject;
            portObject.userData.data = inputs[i];
            portObject.userData.direction = 'input';
            portObject.userData.lines = [];
            portObject.position.set(0, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;
            ports.push(portObject);
        }

        return ports;
    }

    createOutputPorts (outputs, inputs){
        let currentYPos = - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.headerHeight -
            C.nodeMesh.port.height * inputs.length - C.nodeMesh.port.height/2;
        const ports = [];
        for(let i = 0; i < outputs.length; i += 1) {
            const portObject = this.createEmptyPort('output', outputs[i].type);
            portObject.userData.label.text = outputs[i].name;
            portObject.userData.mark.userData.label.text = outputs[i].mark;
            portObject.userData.connector.userData.port = portObject;
            portObject.userData.data = outputs[i];
            portObject.userData.direction = 'output';
            portObject.userData.lines = [];
            portObject.position.set(C.nodeMesh.mount.width, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;
            ports.push(portObject);
        }

        return ports;
    }

    createEmptyPort(direction, portType){
        const portObject = new THREE.Object3D();
        portObject.name = 'port';

        const connector = this.createPortConnector(direction, portType);
        portObject.userData.connector = connector;
        portObject.add(connector);

        const mark = this.createPortMark(direction, portType);
        portObject.userData.mark = mark;
        portObject.add(mark);

        const label = this.createPortLabel(direction, portType);
        portObject.userData.label = label;
        portObject.add(label);

        return portObject
    }

    createPortConnector(direction, portType){
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

        const connectorMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shapeConnector ),
            new THREE.MeshBasicMaterial({color: C.nodeMesh.portTypes[portType].connectorColor})
        );
        if(direction === 'output') {
            connectorMesh.rotateZ(Math.PI);
            connectorMesh.position.set(w, 0 ,0);
        } else {
            connectorMesh.position.set(-w, 0 ,0);
        }

        connectorMesh.name = 'connector';
        connectorMesh.userData.selected = false;

        //set methods
        connectorMesh.userData.methods = {};
        connectorMesh.userData.methods.select = ()=>{
            connectorMesh.userData.selected = true;
            connectorMesh.material.color.setStyle(C.nodeMesh.port.connectorSelectedColor);
        };
        connectorMesh.userData.methods.unselect = ()=>{
            connectorMesh.userData.selected = false;
            connectorMesh.material.color.setStyle(C.nodeMesh.portTypes[portType].connectorColor);
        };

        return connectorMesh;
    }

    createPortMark(direction, portType){
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
            new THREE.MeshBasicMaterial({color: C.nodeMesh.portTypes[portType].markColor})
        );
        markMountMesh.name = 'mark';
        markMountMesh.userData.originColor = C.nodeMesh.portTypes[portType].markColor;

        markObject.add(markMountMesh);

        const label = new Text();
        label.name = 'markLabel';
        label.fontSize = C.nodeMesh.port.markFontSize;
        label.color = C.nodeMesh.portTypes[portType].fontColor;
        label.userData.originColor = C.nodeMesh.portTypes[portType].fontColor
        label.anchorX = 'center';
        label.anchorY = 'middle';
        label.position.set(C.nodeMesh.port.markWidth/2, 0, 0);

        markObject.userData.label = label;
        markObject.add(label);

        markObject.position.set(
            direction === 'input' ? C.nodeMesh.port.markLeftMargin : -C.nodeMesh.port.markLeftMargin - C.nodeMesh.port.markWidth,
            0,
            0
        );

        return markObject;
    }

    createPortLabel(direction, portType){
        const label = new Text();
        label.name = 'portLabel';
        label.fontSize = C.nodeMesh.port.fontSize;
        label.color = C.nodeMesh.portTypes[portType].labelColor;
        label.anchorX = direction === 'input' ? 'left' : 'right';
        label.anchorY = 'middle';
        label.position.set(direction === 'input' ? C.nodeMesh.port.labelLeftMargin : -C.nodeMesh.port.labelLeftMargin, 0, 0);

        label.userData.methods = {};
        label.userData.methods.hover = ()=>{
            label.color = C.nodeMesh.port.labelHoverColor;
        }
        label.userData.methods.unhover = ()=>{
            label.color = C.nodeMesh.portTypes[portType].labelColor;
        }

        return label;
    }

    createFooter(nodeShieldHeight){
        const footerLabel = new Text();
        footerLabel.name = 'footerLabel';
        footerLabel.text = 'Learn more';
        footerLabel.fontSize = 8;
        footerLabel.color = C.nodeMesh.mount.footerLabelColor;
        footerLabel.anchorX = 'left';
        footerLabel.anchorY = 'bottom';
        footerLabel.position.set(4, -nodeShieldHeight + 1, C.layers[3]);

        footerLabel.userData.methods = {};
        footerLabel.userData.methods.hover = ()=>{
            footerLabel.color = C.nodeMesh.mount.footerLabelHoverColor;
        }
        footerLabel.userData.methods.unhover = ()=>{
            footerLabel.color = C.nodeMesh.mount.footerLabelColor;
        }

        return footerLabel;
    }
}