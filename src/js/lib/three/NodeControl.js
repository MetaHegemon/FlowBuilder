import * as THREE from 'three';
import {Text} from 'troika-three-text';
import C from "../Constants";
export class NodeControl{
    constructor() {
        this.nodeData = [];
        this.nodeObjects = [];
    }

    setData(nodeData){
        //TODO need convert to NodeControl format
        this.nodeData = nodeData;
    }

    buildNodes (){
        for(let i = 0; i < this.nodeData.length; i += 1){
            const node = this.createNode(this.nodeData[i]);
            this.nodeObjects.push(node);
        }
    }

    getNodes (){
        return this.nodeObjects;
    }

    createNode (data){
        const nodeShieldHeight = this.calcNodeShieldHeight(data.inputs.length + data.outputs.length);

        const nodeObject = new THREE.Object3D();
        nodeObject.matrixWorld.makeTranslation( 0, 1000, 0 );
        nodeObject.updateWorldMatrix();
        nodeObject.updateMatrix();
        nodeObject.name = 'node';
        nodeObject.userData.data = data;

        //create title
        const title = this.addTitle(data.name);
        nodeObject.add(title);

        //create shield
        const shieldObject = new THREE.Object3D();
        const backMount = this.getBackMount(nodeShieldHeight);
        shieldObject.add(backMount);
        const frontMount = this.getFrontMount(nodeShieldHeight);
        shieldObject.add(frontMount);
        nodeObject.add(shieldObject);

        //header

        //ports
        const inputs = this.getInputPorts(data.inputs);
        for(let i = 0; i < inputs.length; i += 1){
            nodeObject.add(inputs[i]);
        }

        const outputs = this.getOutputPorts(data.outputs, data.inputs);
        for(let i = 0; i < outputs.length; i += 1){
            nodeObject.add(outputs[i]);
        }

        //footer
        const footer = this.getFooter(nodeShieldHeight);
        nodeObject.add(footer);



        nodeObject.position.set(data.position.x, data.position.y, C.layers[0]);

        nodeObject.traverse(function(object){
            if(object.name === 'node') return null;
            object.userData.superParent = nodeObject;
        });

        return nodeObject;
    }

    calcNodeShieldHeight(portsCount) {
        const portsHeight = portsCount * C.nodeMesh.port.height;
        return C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.headerHeight + portsHeight + C.nodeMesh.mount.footerHeight;
    }

    addTitle(name) {
        const title = new Text();
        title.text = name;
        title.fontSize = C.nodeMesh.title.fontSize;
        title.color = C.nodeMesh.title.fontColor;
        title.anchorX = 'left';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.port.labelLeftMargin, 0, 0);
        title.name = 'title';
        return title;
    }

    getBackMount (height) {
        const mount = this.getNewBackMountMesh({
            w: C.nodeMesh.mount.width,
            h: height,
            color: C.nodeMesh.mount.backColor
        });
        mount.userData.backUpColor = C.nodeMesh.mount.backColor;
        mount.name = 'backMount';
        mount.visible = true;

        return mount;
    }

    getNewBackMountMesh(settings){
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

    getFrontMount (height) {
        const mount = this.getNewFrontMountMesh({
            w: C.nodeMesh.mount.width - C.nodeMesh.mount.borderSize,
            h: height - C.nodeMesh.mount.borderSize
        });
        mount.name = 'frontMount';
        mount.position.set(C.nodeMesh.mount.borderSize / 2, -C.nodeMesh.mount.borderSize / 2, C.layers[1]);

        return mount;
    }

    getNewFrontMountMesh(settings){
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

    getInputPorts (inputs){
        let currentYPos = - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.headerHeight - C.nodeMesh.port.height/2;
        const ports = [];
        for(let i = 0; i < inputs.length; i += 1) {
            const portObject = this.getNewEmptyPort('left', C.nodeMesh.portTypes[inputs[i].type].color);
            portObject.userData.label.text = inputs[i].name;
            portObject.userData.mark.userData.label.text = inputs[i].mark;
            portObject.userData.data = inputs[i];
            portObject.position.set(0, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;
            ports.push(portObject);
        }

        return ports;
    }

    getOutputPorts (outputs, inputs){
        let currentYPos = - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.headerHeight -
            C.nodeMesh.port.height * inputs.length - C.nodeMesh.port.height/2;
        const ports = [];
        for(let i = 0; i < outputs.length; i += 1) {
            const portObject = this.getNewEmptyPort('right', C.nodeMesh.portTypes[outputs[i].type].color);
            portObject.userData.label.text = outputs[i].name;
            portObject.userData.mark.userData.label.text = outputs[i].mark;
            portObject.userData.data = outputs[i];
            portObject.position.set(C.nodeMesh.mount.width, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;
            ports.push(portObject);
        }

        return ports;
    }

    getNewEmptyPort(side, color){
        const portObject = new THREE.Object3D();
        portObject.name = 'port';

        const connector = this.getPortConnector(side, color);
        portObject.userData.connector = connector;
        portObject.add(connector);

        const mark = this.getPortMark(side, color);
        portObject.userData.mark = mark;
        portObject.add(mark);

        const label = this.getPortLabel(side, color);
        portObject.userData.label = label;
        portObject.add(label);

        return portObject
    }

    getPortConnector(side, color){
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
            new THREE.MeshBasicMaterial({color: color})
        );
        if(side === 'right') {
            connectorMesh.rotateZ(Math.PI);
            connectorMesh.position.set(w, 0 ,0);
        } else {
            connectorMesh.position.set(-w, 0 ,0);
        }
        connectorMesh.name = 'connector';

        return connectorMesh;
    }

    getPortMark(side, color){
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
            new THREE.MeshBasicMaterial({color: color})
        );
        markMountMesh.name = 'mark';
        markMountMesh.userData.backUpColor = color;

        markObject.add(markMountMesh);

        const label = new Text();
        label.name = 'markLabel';
        label.fontSize = C.nodeMesh.port.markFontSize;
        label.color = label.userData.backUpColor = C.nodeMesh.port.markFontColor;
        label.anchorX = 'center';
        label.anchorY = 'middle';
        label.position.set(C.nodeMesh.port.markWidth/2, 0, 0);

        markObject.userData.label = label;
        markObject.add(label);

        markObject.position.set(
            side === 'left' ? C.nodeMesh.port.markLeftMargin : -C.nodeMesh.port.markLeftMargin - C.nodeMesh.port.markWidth,
            0,
            0
        );

        return markObject;
    }

    getPortLabel(side, color){
        const label = new Text();
        label.name = 'portLabel'
        label.fontSize = C.nodeMesh.port.fontSize;
        label.color = label.userData.backUpColor = color;
        label.anchorX = side;
        label.anchorY = 'middle';
        label.position.set(side === 'left' ? C.nodeMesh.port.labelLeftMargin : -C.nodeMesh.port.labelLeftMargin, 0, 0);

        return label;
    }

    getFooter(nodeShieldHeight){
        const footerLabel = new Text();
        footerLabel.name = 'footerLabel';
        footerLabel.text = 'Learn more';
        footerLabel.fontSize = 8;
        footerLabel.color = 0x888888;
        footerLabel.userData.backUpColor = 0x888888;
        footerLabel.anchorX = 'left';
        footerLabel.anchorY = 'bottom';
        footerLabel.position.set(4, -nodeShieldHeight + 1, C.layers[3]);

        return footerLabel;
    }
}