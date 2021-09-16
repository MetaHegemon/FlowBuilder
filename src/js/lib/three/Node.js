import * as THREE from "three";
import Port from './Port';
import C from "./../Constants";
import {Text} from "troika-three-text";

export default class{
    constructor(data){
        this.selected = false;
        this.backMountMesh = null;
        this.title = null;
        this.cPorts = [];
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
        this.title = this.createTitle(this.data.name);
        nodeObject.add(this.title);

        //create indicator
        const indicator = this.createIndicator(this.data.indicator);
        nodeObject.add(indicator);

        //create shield
        const shieldObject = new THREE.Object3D();
        const backMount = this.backMountMesh = this.createBackMountMesh(nodeShieldHeight);
        shieldObject.add(backMount);
        const frontMount = this.createFrontMount(nodeShieldHeight);
        shieldObject.add(frontMount);
        nodeObject.add(shieldObject);

        //header

        //ports
        const inputs = this.createInputPorts(this.data.inputs);
        for (let i = 0; i < inputs.length; i += 1) {
            nodeObject.add(inputs[i].getMPort());
            this.cPorts.push(inputs[i]);
        }

        const outputs = this.createOutputPorts(this.data.outputs, this.data.inputs);
        for (let i = 0; i < outputs.length; i += 1) {
            nodeObject.add(outputs[i].getMPort());
            this.cPorts.push(outputs[i]);
        }

        //footer
        const footer = this.createFooter(nodeShieldHeight);
        nodeObject.add(footer);

        nodeObject.position.set(this.data.position.x, this.data.position.y, C.layers[0]);

        //set superParent for children
        nodeObject.traverse(function (object) {
            if (object.name === 'node') return null;
            object.userData.superParent = nodeObject;
        });

        nodeObject.userData.class = this;

        return nodeObject;
    }

    createInputPorts(inputs) {
        let currentYPos = - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.headerHeight - C.nodeMesh.port.height/2;
        const cPorts = [];
        for(let i = 0; i < inputs.length; i += 1) {
            const cPort = new Port('input', inputs[i], this);
            const portObject = cPort.getMPort();
            portObject.position.set(0, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;

            cPorts.push(cPort);
        }
        return cPorts;
    }

    createOutputPorts (outputs, inputs){
        let currentYPos = - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.headerHeight -
            C.nodeMesh.port.height * inputs.length - C.nodeMesh.port.height/2;
        const cPorts = [];
        for(let i = 0; i < outputs.length; i += 1) {
            const cPort = new Port('output', outputs[i], this);
            const portObject = cPort.getMPort();
            portObject.position.set(C.nodeMesh.mount.width, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;
            cPorts.push(cPort);
        }

        return cPorts;
    }

    calcNodeShieldHeight(portsCount) {
        const portsHeight = portsCount * C.nodeMesh.port.height;
        return C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.headerHeight + portsHeight + C.nodeMesh.mount.footerHeight;
    }

    createTitle(name) {
        const title = new Text();
        title.text = name;
        title.font = C.fontPaths.main;
        title.fontSize = C.nodeMesh.title.fontSize;
        title.color = C.nodeMesh.title.fontColor;
        title.anchorX = 'left';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.title.leftMargin, 0, 0);
        title.name = 'title';
        return title;
    }

    createIndicator(name){
        const title = new Text();
        title.text = name;
        title.font = C.fontPaths.main;
        title.fontSize = C.nodeMesh.indicator.fontSize;
        title.color = C.nodeMesh.indicator.fontColor;
        title.anchorX = 'right';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.mount.width - C.nodeMesh.indicator.rightMargin, 0, 0);
        title.name = 'indicator';
        return title;
    }

    createBackMountMesh(h){
        const w = C.nodeMesh.mount.width;
        const color = C.nodeMesh.mount.backMountColor;

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

        const mesh = new THREE.Mesh( geometry, material);
        mesh.name = 'backMount';
        mesh.userData.class = this;

        return mesh;
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

    createFooter(nodeShieldHeight){
        const footerLabel = new Text();
        footerLabel.name = 'footerLabel';
        footerLabel.text = 'Learn more';
        footerLabel.font = C.fontPaths.main;
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

    select = ()=>{
        this.selected = true;
        this.backMountMesh.material.color.setStyle(C.nodeMesh.mount.backMountSelectedColor);
        this.title.color = C.nodeMesh.title.fontSelectedColor;
    }

    unselect = ()=>{
        this.selected = false;
        this.backMountMesh.material.color.setStyle(C.nodeMesh.mount.backMountColor);
        this.title.color = C.nodeMesh.title.fontColor;
    }

    getMNode(){
        return this.mesh;
    }
}