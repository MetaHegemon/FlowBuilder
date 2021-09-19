import * as THREE from "three";
import Port from './NodePort';
import PseudoPort from "./NodePseudoPort";
import C from "./../Constants";
import {Text} from "troika-three-text";

export default class{
    constructor(data, renderOrder){
        this.renderOrder = renderOrder;
        this.selected = false;
        this.nodeHeight = null;
        this.playing = false;
        this.title = null;
        this.inputPortCollapsed = true;
        this.outputPortsCollapsed = true;
        this.cPortsInput = [];
        this.cPortsOutput = [];
        this.data = data;
        this.mesh = this.create();

    }

    create() {
        this.calcNodeHeight();

        const nodeObject = new THREE.Object3D();
        nodeObject.matrixWorld.makeTranslation(0, 1000, 0);
        nodeObject.updateWorldMatrix();
        nodeObject.updateMatrix();
        nodeObject.name = 'node';

        //create title
        this.title = this.createTitle(this.data.name);
        nodeObject.add(this.title);

        //create indicator
        const indicator = this.createIndicator(this.data.indicator);
        nodeObject.add(indicator);

        //create shield
        const shieldObject = new THREE.Object3D();
        const backMount = this.createBackMountMesh();
        shieldObject.add(backMount);
        const frontMount = this.createFrontMount();
        shieldObject.add(frontMount);
        nodeObject.add(shieldObject);

        //header
        const header = this.createHeaderButtons();
        nodeObject.add(header);

        //input ports
        //create ports before calc height of node
        const inputPorts = this.createInputPorts(this.data.inputs);
        this.cPortsInput = this.packPortsWithPseudo( inputPorts, 'input');
        this.setPositionsForInputPorts();
        for (let i = 0; i < this.cPortsInput.length; i += 1) {
            nodeObject.add(this.cPortsInput[i].getMPort());
        }

        //output ports
        const outputPorts = this.createOutputPorts(this.data.outputs);
        this.cPortsOutput = this.packPortsWithPseudo( outputPorts, 'output');
        this.setPositionsForOutputPorts();
        for (let i = 0; i < this.cPortsOutput.length; i += 1) {
            nodeObject.add(this.cPortsOutput[i].getMPort());
        }

        nodeObject.position.set(this.data.position.x, this.data.position.y, C.layers[0]);

        //set class for all children
        nodeObject.traverse(function (object) {
            object.userData.nodeClass = this;
        }.bind(this));

        this.setDepthTest(nodeObject);

        return nodeObject;
    }

    setDepthTest(object){
        object.traverse(function (object) {
            if(object.material){
                clog(object.name);
                object.renderOrder = this.renderOrder;
                clog(object.renderOrder);
                object.material.depthTest = false;
            }
        }.bind(this));
    }

    createHeaderButtons(){
        const header = new THREE.Object3D();

        //triangle
        const collapse = this.createCollapseButton();
        header.add(collapse);
        header.position.set(0, -C.nodeMesh.header.height/2, C.layers[3]);

        //play
        const play = this.createPlayButton();
        header.add(play);
        header.position.set(0, -C.nodeMesh.header.height/2, C.layers[3]);

        //menu
        const menu = this.createMenuButton();
        header.add(menu);
        header.position.set(0, -C.nodeMesh.header.height/2, C.layers[3]);

        return header;
    }

    createCollapseButton(){
        const collapse = new Text();
        collapse.text = '';
        collapse.font = C.fontPaths.awSolid;
        collapse.fontSize = C.nodeMesh.header.collapse.fontSize;
        collapse.color = C.nodeMesh.header.collapse.fontColor;
        collapse.anchorX = 'right';
        collapse.anchorY = 'bottom';
        collapse.rotateZ(Math.PI);
        collapse.position.set(C.nodeMesh.header.collapse.leftMargin, C.nodeMesh.header.height/2-C.nodeMesh.header.collapse.topMargin, 0);
        collapse.name = 'collapseButton';

        return collapse;
    }

    createPlayButton(){
        const play = new Text();
        play.text = '';
        play.font = C.fontPaths.awSolid;
        play.fontSize = C.nodeMesh.header.play.fontSize;
        play.color = C.nodeMesh.header.play.fontColor;
        play.anchorX = 'right';
        play.anchorY = 'top';
        play.position.set(C.nodeMesh.mount.width - C.nodeMesh.header.play.rightMargin, C.nodeMesh.header.height/2 - C.nodeMesh.header.play.topMargin, 0);
        play.name = 'playButton';

        return play;
    }

    createMenuButton(){
        const menu = new Text();
        menu.text = '';
        menu.font = C.fontPaths.awSolid;
        menu.fontSize = C.nodeMesh.header.menu.fontSize;
        menu.color = C.nodeMesh.header.menu.fontColor;
        menu.anchorX = 'right';
        menu.anchorY = 'top';
        menu.position.set(C.nodeMesh.mount.width - C.nodeMesh.header.menu.rightMargin,  C.nodeMesh.header.height/2 - C.nodeMesh.header.menu.topMargin, 0);
        menu.name = 'menuButton';

        return menu;
    }

    createInputPorts(inputs) {
        const cPorts = [];
        for(let i = 0; i < inputs.length; i += 1) {
            const cPort = new Port('input', inputs[i], this);
            cPorts.push(cPort);
        }

        return cPorts;
    }

    setPositionsForInputPorts(){
        let currentYPos = -C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.header.height - C.nodeMesh.port.height/2;
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            const mPort = this.cPortsInput[i].getMPort();
            mPort.position.set(0, currentYPos, C.layers[3]);
            currentYPos -= C.nodeMesh.port.height;
        }
    }

    createOutputPorts (outputs){
        let cPorts = [];
        for(let i = 0; i < outputs.length; i += 1) {
            const cPort = new Port('output', outputs[i], this);
            cPorts.push(cPort);
        }

        return cPorts;
    }

    setPositionsForOutputPorts(){
        let currentYPos = -this.nodeHeight + C.nodeMesh.mount.borderSize + C.nodeMesh.mount.roundCornerRadius +
            C.nodeMesh.footer.height + C.nodeMesh.port.height/2;
        for(let i = this.cPortsOutput.length - 1; i >= 0; i -= 1){
            const mPort = this.cPortsOutput[i].getMPort();
            mPort.position.set(C.nodeMesh.mount.width, currentYPos, C.layers[3]);
            currentYPos += C.nodeMesh.port.height;
        }
    }

    packPortsWithPseudo(cPorts, direction, cPseudoPort){
        const portsForHide = [];
        for(let i = C.nodeMesh.constraints.maxVisiblePorts - 1; i < cPorts.length; i += 1){
            portsForHide.push(cPorts[i]);
        }
        if(portsForHide.length > 1){
            for(let i = 0; i < cPorts.length; i += 1){
                for(let j = 0; j < portsForHide.length; j += 1){
                    if(cPorts[i] === portsForHide[j]){
                        cPorts.splice(i, 1);
                        i -= 1;
                    }
                }
            }

            if(!cPseudoPort){
                cPseudoPort = new PseudoPort(direction, this);
            }

            cPseudoPort.setHidedCPorts(portsForHide);
            cPseudoPort.changeLabelText(direction === 'input' ? this.inputPortCollapsed : this.outputPortsCollapsed);
            cPorts.push(cPseudoPort);
        }

        return cPorts;
    }

    createTitle(name) {
        const title = new Text();
        title.text = name;
        title.font = C.fontPaths.mainMedium;
        title.fontSize = C.nodeMesh.title.fontSize;
        title.color = C.nodeMesh.title.fontColor;
        title.anchorX = 'left';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.title.leftMargin, C.nodeMesh.title.bottomMargin, 0);
        title.name = 'title';
        return title;
    }

    createIndicator(name){
        const title = new Text();
        title.text = name;
        title.font = C.fontPaths.mainNormal;
        title.fontSize = C.nodeMesh.indicator.fontSize;
        title.color = C.nodeMesh.indicator.fontColor;
        title.anchorX = 'right';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.mount.width - C.nodeMesh.indicator.rightMargin, C.nodeMesh.indicator.bottomMargin, 0);
        title.name = 'indicator';
        return title;
    }

    createBackMountMesh(){
        const w = C.nodeMesh.mount.width;
        const color = C.nodeMesh.mount.back.color;

        const radius = C.nodeMesh.mount.roundCornerRadius;

        const headShape = new THREE.Shape();
        headShape.moveTo(radius, 0);
        headShape.lineTo(w - radius, 0);
        headShape.quadraticCurveTo(w, 0 , w, -radius);
        headShape.lineTo(0, -radius);
        headShape.quadraticCurveTo(0, 0, radius, 0);

        const head = new THREE.Mesh(
            new THREE.ShapeGeometry( headShape ),
            new THREE.MeshBasicMaterial({color: color ? color : 'red'})
        );
        head.name = 'backMountHead';

        const body = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(w, 1),
            new THREE.MeshBasicMaterial({color: color})
        );

        body.name = 'backMountBody';
        body.position.setX(C.nodeMesh.mount.width/2);
        this.scaleBackMountBody(body);

        const footerShape = new THREE.Shape();
        footerShape.moveTo(0, radius);
        footerShape.lineTo(w, radius);
        footerShape.quadraticCurveTo(w, 0, w-radius, 0);
        footerShape.lineTo(radius, 0);
        footerShape.quadraticCurveTo(0, 0, 0, radius);

        const footer = new THREE.Mesh(
            new THREE.ShapeGeometry( footerShape ),
            new THREE.MeshBasicMaterial({color: color ? color : 'red'})
        );
        footer.name = 'backMountFooter';
        this.setBackMountFooterPosition(footer);

        const backMount = new THREE.Object3D();
        backMount.add(head);
        backMount.add(body);
        backMount.add(footer);

        backMount.name = 'backMount';

        return backMount;
    }

    createFrontMount () {
        const w = C.nodeMesh.mount.width - C.nodeMesh.mount.borderSize * 2;
        const headColor = C.nodeMesh.mount.front.headColor;
        const bodyColor = C.nodeMesh.mount.front.bodyColor;
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;

        const mount = new THREE.Object3D();
        //head
        const headShape = new THREE.Shape();
        headShape.moveTo(radius, 0);
        headShape.lineTo(w - radius, 0);
        headShape.quadraticCurveTo(w, 0, w, -radius);
        headShape.lineTo(w, -radius - C.nodeMesh.mount.front.headHeight);
        headShape.lineTo(0, -radius - C.nodeMesh.mount.front.headHeight);
        headShape.lineTo(0, -radius);
        headShape.quadraticCurveTo(0, 0, radius, 0);
        headShape.closePath();

        const headMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( headShape ),
            new THREE.MeshBasicMaterial({color: headColor ? headColor : 'red'})
        );
        headMesh.name = 'frontMountHead';
        mount.add(headMesh);

        const bodyMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(w, 1),
            new THREE.MeshBasicMaterial({color: bodyColor ? bodyColor : 'red'})
        );
        bodyMesh.name = 'frontMountBody';
        this.scaleFrontMountBody(bodyMesh);
        bodyMesh.position.setX(w/2);
        mount.add(bodyMesh);

        //footer

        const footer = this.createFooter();
        mount.add(footer);

        mount.name = 'frontMount';
        mount.position.set(C.nodeMesh.mount.borderSize, -C.nodeMesh.mount.borderSize, C.layers[1]);

        return mount;
    }

    createFooter(){
        const w = C.nodeMesh.mount.width - C.nodeMesh.mount.borderSize * 2;
        const footerColor = C.nodeMesh.footer.color;
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const footerHeight = C.nodeMesh.footer.height;

        const footer = new THREE.Object3D();


        const footerShape = new THREE.Shape();
        footerShape.moveTo(0, footerHeight + radius);
        footerShape.lineTo(w , footerHeight + radius);
        footerShape.lineTo(w, radius);
        footerShape.quadraticCurveTo(w, 0, w-radius, 0);
        footerShape.lineTo(radius, 0);
        footerShape.quadraticCurveTo(0, 0, 0, radius);
        footerShape.closePath();

        const footerMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( footerShape ),
            new THREE.MeshBasicMaterial({color: footerColor ? footerColor : 'red'})
        );
        footerMesh.name = 'frontMountFooter';

        footer.add(footerMesh);

        const footerLabel = new Text();
        footerLabel.name = 'footerLabel';
        footerLabel.text = 'Learn more';
        footerLabel.font = C.fontPaths.mainNormal;
        footerLabel.fontSize = C.nodeMesh.footer.label.fontSize;
        footerLabel.color = C.nodeMesh.footer.label.color;
        footerLabel.letterSpacing = C.nodeMesh.footer.label.letterSpacing;
        footerLabel.anchorX = 'left';
        footerLabel.anchorY = 'bottom';
        footerLabel.position.set(C.nodeMesh.footer.label.leftMargin, C.nodeMesh.footer.label.bottomMargin, C.layers[1]);

        footer.add(footerLabel);
        footer.name = 'footer';
        footer.position.set(0, 0, C.layers[3]);
        this.setFrontMountFooterPosition(footer);

        return footer;
    }

    hoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = C.nodeMesh.footer.label.hoverColor;
    }

    unhoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = C.nodeMesh.footer.label.color;
    }

    collapse(){

    }

    play(mPlay){
        if(this.playing){
            this.playing = false;
            mPlay.text = '';
        } else {
            this.playing = true;
            mPlay.text = '';
        }

    }

    isSelected(){
        return this.selected;
    }

    select(){
        this.selected = true;
        const mount = this.mesh.getObjectByName('backMount');
        for(let i = 0; i < mount.children.length; i += 1){
            mount.children[i].material.color.setStyle(C.nodeMesh.mount.back.selectedColor);
        }
        this.title.color = C.nodeMesh.title.fontSelectedColor;
    }

    unselect(){
        this.selected = false;
        const mount = this.mesh.getObjectByName('backMount');
        for(let i = 0; i < mount.children.length; i += 1){
            mount.children[i].material.color.setStyle(C.nodeMesh.mount.back.color);
        }
        this.title.color = C.nodeMesh.title.fontColor;
    }

    getMNode(){
        return this.mesh;
    }

    shortCollapsePorts(cPseudoPort){
        if(cPseudoPort.direction === 'input'){
            this.shortCollapseInputPorts(cPseudoPort);
        } else {
            this.shortCollapseOutputPorts(cPseudoPort);
        }
    }

    shortCollapseInputPorts(cPseudoPort){
        if(this.inputPortCollapsed){ //uncollapse
            this.inputPortCollapsed = false;

            const hidedCPorts = cPseudoPort.getHidedCPorts();
            for(let i = 0; i < hidedCPorts.length; i += 1){
                const mPort = hidedCPorts[i].getMPort();
                this.cPortsInput.push(hidedCPorts[i]);
                this.mesh.add(mPort);
            }
            for(let i = 0; i < this.cPortsInput.length; i += 1){
                if(this.cPortsInput[i] === cPseudoPort){
                    this.cPortsInput.splice(i, 1);
                    break;
                }
            }
            this.cPortsInput.push(cPseudoPort);
            cPseudoPort.setHidedCPorts([]);
            cPseudoPort.changeLabelText(false);
            cPseudoPort.hideConnector();
        } else { //collapse
            this.inputPortCollapsed = true;

            for(let i = 0; i < this.cPortsInput.length; i += 1){
                if(this.cPortsInput[i] === cPseudoPort) {
                    this.cPortsInput.splice(i, 1);
                    break;
                }
            }
            this.cPortsInput = this.packPortsWithPseudo(this.cPortsInput, 'input', cPseudoPort);
            const hidedCPorts = cPseudoPort.getHidedCPorts();

            for(let i = 0; i < hidedCPorts.length; i += 1){
                this.mesh.remove(hidedCPorts[i].getMPort());
            }

            cPseudoPort.changeLabelText(true);
            cPseudoPort.showConnector();
        }


        this.calcNodeHeight();
        this.scaleNode();
        this.setPositionsForInputPorts();
        this.setPositionsForOutputPorts();
    }

    shortCollapseOutputPorts(cPseudoPort){
        if(this.outputPortsCollapsed){ //uncollapse
            this.outputPortsCollapsed = false;

            const hidedCPorts = cPseudoPort.getHidedCPorts();
            for(let i = 0; i < hidedCPorts.length; i += 1){
                const mPort = hidedCPorts[i].getMPort();
                this.cPortsOutput.push(hidedCPorts[i]);
                this.mesh.add(mPort);
            }
            for(let i = 0; i < this.cPortsOutput.length; i += 1){
                if(this.cPortsOutput[i] === cPseudoPort){
                    this.cPortsOutput.splice(i, 1);
                    break;
                }
            }
            this.cPortsOutput.push(cPseudoPort);
            cPseudoPort.changeLabelText(false);
            cPseudoPort.setHidedCPorts([]);
            cPseudoPort.hideConnector();
        } else { //collapse
            this.outputPortsCollapsed = true;
            for(let i = 0; i < this.cPortsOutput.length; i += 1){
                if(this.cPortsOutput[i] === cPseudoPort) {
                    this.cPortsOutput.splice(i, 1);
                    break;
                }
            }
            this.cPortsOutput = this.packPortsWithPseudo(this.cPortsOutput, 'output', cPseudoPort);
            const hidedCPorts = cPseudoPort.getHidedCPorts();

            for(let i = 0; i < hidedCPorts.length; i += 1){
                this.mesh.remove(hidedCPorts[i].getMPort());
            }

            cPseudoPort.changeLabelText(true);
            cPseudoPort.showConnector();
        }

        this.calcNodeHeight();
        this.scaleNode();
        this.setPositionsForInputPorts();
        this.setPositionsForOutputPorts();
    }

    scaleNode(){
        this.scaleBackMountBody()
        this.scaleFrontMountBody();
        this.setFrontMountFooterPosition()
        this.setBackMountFooterPosition()
        //move footer
    }

    scaleBackMountBody(body){
        body = body ? body : this.mesh.getObjectByName('backMountBody');
        body.scale.setY(this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2);
        body.position.setY(-this.nodeHeight/2);
    }

    scaleFrontMountBody(body){
        body = body ? body : this.mesh.getObjectByName('frontMountBody');
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const h = this.nodeHeight - C.nodeMesh.mount.borderSize * 2 - radius * 2 - C.nodeMesh.mount.front.headHeight;

        body.scale.setY(h - C.nodeMesh.footer.height);
        body.position.setY(-(h - C.nodeMesh.footer.height)/2 - C.nodeMesh.mount.front.headHeight - radius);
    }

    setFrontMountFooterPosition(footer){
        footer = footer ? footer : this.mesh.getObjectByName('footer');
       // footer.position.lerp(new THREE.Vector3(footer.position.x, -this.nodeHeight + C.nodeMesh.mount.borderSize*2, footer.position.z), 0.5);
        footer.position.setY(-this.nodeHeight + C.nodeMesh.mount.borderSize*2);
    }

    setBackMountFooterPosition(footer){
        footer = footer ? footer : this.mesh.getObjectByName('backMountFooter');
        footer.position.setY(-this.nodeHeight);
    }

    calcNodeHeight() {
        const portsCount = this.calcVisiblePortsCount();
        const portsHeight = portsCount * C.nodeMesh.port.height;
        this.nodeHeight = C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.front.headHeight +
            C.nodeMesh.header.height + portsHeight + C.nodeMesh.footer.height + C.nodeMesh.mount.roundCornerRadius;
    }

    calcVisiblePortsCount() {
        let count = 0;
        const inPorts = this.data.inputs;
        if (inPorts.length > C.nodeMesh.constraints.maxVisiblePorts ) {
            if(this.inputPortCollapsed) {
                count += C.nodeMesh.constraints.maxVisiblePorts;
            } else {
                count += inPorts.length + 1;
            }
        } else {
            count += inPorts.length;
        }

        const outPorts = this.data.outputs;
        if (outPorts.length > C.nodeMesh.constraints.maxVisiblePorts) {
            if(this.outputPortsCollapsed) {
                count += C.nodeMesh.constraints.maxVisiblePorts;
            } else {
                count += outPorts.length + 1;
            }
        } else {
            count += outPorts.length;
        }

        return count;
    }

    getAllCPorts(){
        return [...this.cPortsInput, ...this.cPortsOutput];
    }


}