import * as THREE from "three";
import Port from './NodePort';
import PseudoPort from "./NodePseudoPort";
import C from "./../Constants";
import {Text} from "troika-three-text";
import Theme from '../../themes/Theme';
import FBS from "../FlowBuilderStore";

export default class{
    constructor(data, originZ){
        this.originZ = originZ;
        this.selected = false;
        this.nodeHeight = 0;
        this.nodeWidth = C.nodeMesh.mount.width;
        this.middleCollapse = {
            isCollapsed: false,
            isPseudoInputExist: false,
            isPseudoOutputExist: false,
            storeCPortsInput: [],
            storeCPortsOutput: [],
            storeCLinesInput: [],
            storeCLinesOutput: []
        };

        this.fullCollapse = {
            isCollapsed: false,
            isPseudoInputExist: false,
            isPseudoOutputExist: false,
            storeCPortsInput: [],
            storeCPortsOutput: [],
            storeCLinesInput: [],
            storeCLinesOutput: [],
            state: 'done',
            queue: []
        };
        this.shortCollapse = {
            inputPortsCollapsed: true,
            outputPortsCollapsed: true
        }
        this.allCPorts = [];
        this.playing = false;
        this.cPortsInput = [];
        this.cPortsOutput = [];
        this.data = data;

        this.mesh = this.create();
        this.calcNodeHeight();
        this.scaleNode();
        this.setPositionsForInputPorts(this.calcPositionsForInputPorts());
        this.setPositionsForOutputPorts(this.calcPositionsForOutputPorts());
    }

    create() {
        const nodeObject = new THREE.Object3D();
        nodeObject.matrixWorld.makeTranslation(0, 1000, 0);
        nodeObject.updateWorldMatrix();
        nodeObject.updateMatrix();
        nodeObject.name = 'node';

        //create title
        const title = this.createTitle(this.data.name);
        nodeObject.add(title);

        //create indicator
        const indicator = this.createIndicator(this.data.indicator);
        nodeObject.add(indicator);

        //create shield
        const shieldObject = new THREE.Group();
        shieldObject.name = 'shield';
        const backMount = this.createBackMountMesh();
        shieldObject.add(backMount);
        const frontMount = this.createFrontMount();
        shieldObject.add(frontMount);
        nodeObject.add(shieldObject);

        //resizer
        const rightResizer = this.createRightResizer();
        nodeObject.add(rightResizer);

        //header
        const header = this.createHeaderButtons();
        nodeObject.add(header);

        //input ports
        //create ports before calc height of node
        const inputPorts = this.createInputPorts(this.data.inputs);
        this.allCPorts.push(...inputPorts);
        this.cPortsInput = this.packPortsWithPseudo( inputPorts, 'input', C.nodeMesh.constraints.maxVisiblePorts);
        for (let i = 0; i < this.cPortsInput.length; i += 1) {
            nodeObject.add(this.cPortsInput[i].getMPort());
        }

        //output ports

        const outputPorts = this.createOutputPorts(this.data.outputs);
        this.allCPorts.push(...outputPorts);
        this.cPortsOutput = this.packPortsWithPseudo( outputPorts, 'output', C.nodeMesh.constraints.maxVisiblePorts);
        for (let i = 0; i < this.cPortsOutput.length; i += 1) {
            nodeObject.add(this.cPortsOutput[i].getMPort());
        }

        nodeObject.position.set(this.data.position.x, this.data.position.y, this.originZ);

        //set class for all children
        nodeObject.traverse(function (object) {
            object.userData.nodeClass = this;
        }.bind(this));

        return nodeObject;
    }

    getOriginZ(){
        return this.originZ;
    }

    createHeaderButtons(){
        const controlPanel = new THREE.Group();
        controlPanel.name = 'controlPanel';

        //triangle
        if(this.data.inputs.length > 1 || this.data.outputs.length > 1) {
            const collapse = this.createCollapseButton();
            controlPanel.add(collapse);
        }

        //play
        const play = this.createPlayButton();
        controlPanel.add(play);

        //menu
        const menu = this.createMenuButton();
        controlPanel.add(menu);
        controlPanel.position.set(0, -C.nodeMesh.header.height/2, C.layers.header);

        return controlPanel;
    }

    createCollapseButton(){
        const collapse = new Text();
        collapse.text = '';
        collapse.font = C.fontPaths.awSolid;
        collapse.fontSize = C.nodeMesh.header.collapse.fontSize;
        collapse.color = Theme.theme.node.header.collapse.fontColor;
        collapse.anchorX = 8;
        collapse.anchorY = -9.4;
        collapse.textAlign = 'center';
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
        play.color = Theme.theme.node.header.play.fontColor;
        play.anchorX = 'right';
        play.anchorY = 'top';
        play.position.setY( C.nodeMesh.header.height/2 - C.nodeMesh.header.play.topMargin);
        play.name = 'playButton';

        return play;
    }

    createMenuButton(){
        const menu = new Text();
        menu.text = '';
        menu.font = C.fontPaths.awSolid;
        menu.fontSize = C.nodeMesh.header.menu.fontSize;
        menu.color = Theme.theme.node.header.menu.fontColor;
        menu.anchorX = 'right';
        menu.anchorY = 'top';
        menu.name = 'menuButton';
        menu.position.setY(  C.nodeMesh.header.height/2 - C.nodeMesh.header.menu.topMargin);

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

    createOutputPorts (outputs){
        let cPorts = [];
        for(let i = 0; i < outputs.length; i += 1) {
            const cPort = new Port('output', outputs[i], this);
            cPorts.push(cPort);
        }

        return cPorts;
    }

    /**
     * Позиция Y первого входного порта
     * @returns {number}
     */
    getFirstPortPosition(){
        return -C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.front.headHeight - C.nodeMesh.header.height - C.nodeMesh.port.height/2;
    }

    /**
     * Позиция Y первого входного порта при минимальный высоте ноды
     * @returns {number}
     */
    getFirstPortPositionMin(){
        return -C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.front.headHeight - C.nodeMesh.port.height/2;
    }

    /**
     * Позиция Y последнего выходного порта
     * @returns {number}
     */
    getLastPortPosition(){
        return -this.nodeHeight +  C.nodeMesh.mount.roundCornerRadius +
            C.nodeMesh.footer.height + C.nodeMesh.port.height/2;
    }

    /**
     * Позиция Y последнего выходного порта при минимальной высоте ноды
     * @returns {number}
     */
    getLastPortPositionMin(){
        return -this.nodeHeight +  C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.port.height/2;
    }

    /**
     * Расчёт позиций входных портов
     * @returns {*[]}
     */
    calcPositionsForInputPorts(){
        const positions = [];
        let currentYPos = this.getFirstPortPosition();
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            positions.push({x: 0, y: currentYPos, z: C.layers.port});
            currentYPos -= C.nodeMesh.port.height;
        }
        return positions;
    }

    /**
     * Расчёт позиций входных портов при минимальной высоте ноды
     * @returns {*[]}
     */
    calcPositionsForInputPortsMin(){
        const positions = [];
        let currentYPos = this.getFirstPortPositionMin();
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            positions.push({x: 0, y: currentYPos, z: C.layers.port});
            currentYPos -= C.nodeMesh.port.height;
        }
        return positions;
    }

    /**
     * Присвоение новых позиций входным портам
     * @param positions
     */
    setPositionsForInputPorts(positions){
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            if(!positions[i]) break;
            const mPort = this.cPortsInput[i].getMPort();
            mPort.position.set(positions[i].x, positions[i].y, positions[i].z);
        }
    }

    /**
     * Расчёт позиций выходных портов
     * @returns {*[]}
     */
    calcPositionsForOutputPorts(){

        let positions = [];
        let currentYPos = this.getLastPortPosition();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            positions[i] = {x: this.nodeWidth, y: currentYPos, z: C.layers.port};
            currentYPos += C.nodeMesh.port.height;
        }
        positions = positions.reverse();
        return positions;
    }

    /**
     * Расчёт позиций выходных портов при минимальной высоте ноды
     * @returns {*[]}
     */
    calcPositionsForOutputPortsMin(){
        let positions = [];
        let currentYPos = this.getLastPortPositionMin();
        for(let i = this.cPortsOutput.length - 1; i >= 0; i -= 1){
            positions[i] = {x: this.nodeWidth, y: currentYPos, z: C.layers.port};
            currentYPos += C.nodeMesh.port.height;
        }
        positions = positions.reverse();
        return positions;
    }

    /**
     * Присвоение новых позиций выходным портам
     * @param positions
     */
    setPositionsForOutputPorts(positions){
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            if(!positions[i]) break;
            const mPort = this.cPortsOutput[i].getMPort();
            clog(this.cPortsOutput[i].type, i);
            mPort.position.set(positions[i].x, positions[i].y, positions[i].z);
        }
    }

    /**
     * Создание задачи на анимацию перемещения порта на новую позицию.
     * @param mPort - mesh port
     * @param posY - новая позиция Y для порта
     */
    movePseudoPortToPos(mPort, posY){
        const task = {
            target: mPort.position,
            value: {x: mPort.position.x, y: posY, z: mPort.position.z},
            time: C.animation.portHideTime
        };

        FBS.animationControl.animate([task]);
    }

    movePseudoInputPortBack(mPort){
        const positions = this.calcPositionsForInputPorts();
        const task = {
            target: mPort.position,
            value: {x: mPort.position.x, y: positions[positions.length - 1].y, z: mPort.position.z},
            time: C.animation.portHideTime
        };

        FBS.animationControl.animate([task]);
    }

    movePseudoOutputPortBack(mPort){
        const positions = this.calcPositionsForOutputPorts();

        const task = {
            target: mPort.position,
            value: {x: mPort.position.x, y: positions[positions.length - 1].y, z: mPort.position.z},
            time: C.animation.portHideTime
        };

        FBS.animationControl.animate([task]);
    }

    packPortsWithPseudo(cPorts, direction, maxVisiblePorts, cPseudoPort){
        const portsForHide = [];
        for(let i = maxVisiblePorts - 1; i < cPorts.length; i += 1){
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
            cPseudoPort.changeLabelText(direction === 'input' ? this.shortCollapse.inputPortsCollapsed : this.shortCollapse.outputPortsCollapsed);
            cPorts.push(cPseudoPort);
        }

        return cPorts;
    }

    createTitle(name) {
        const title = new Text();
        title.text = name;
        title.font = Theme.theme.fontPaths.mainMedium;
        title.fontSize = C.nodeMesh.title.fontSize;
        title.color = Theme.theme.node.title.fontColor;
        title.anchorX = 'left';
        title.anchorY = 'bottom';
        title.position.set(C.nodeMesh.title.leftMargin, C.nodeMesh.title.bottomMargin, 0);
        title.name = 'title';

        return title;
    }

    createIndicator(name){
        const title = new Text();
        title.text = name;
        title.font = Theme.theme.fontPaths.mainNormal;
        title.fontSize = C.nodeMesh.indicator.fontSize;
        title.color = Theme.theme.node.indicator.fontColor;
        title.anchorX = 'right';
        title.anchorY = 'bottom';
        title.name = 'indicator';
        return title;
    }

    createBackMountMesh(){
        const backMountTop = FBS.nodeAssets.backMountTop.clone(true);

        const backMountBody = FBS.nodeAssets.backMountBody.clone();
        backMountBody.position.setX(this.nodeWidth/2);

        const backMountBottom = FBS.nodeAssets.backMountBottom.clone(true);

        const backMount = new THREE.Group();
        backMount.add(backMountTop);
        backMount.add(backMountBody);
        backMount.add(backMountBottom);

        backMount.name = 'backMount';

        const material = new THREE.MeshBasicMaterial({color: Theme.theme.node.mount.back.color});
        backMount.traverse((o) => {
            if(o.material) o.material = material;
        });

        return backMount;
    }

    createFrontMount () {
        const headMaterial = new THREE.MeshBasicMaterial({color: Theme.theme.node.mount.front.headColor});
        const bodyMaterial = new THREE.MeshBasicMaterial({color: Theme.theme.node.mount.front.bodyColor});
        const footerMaterial = new THREE.MeshBasicMaterial({color: Theme.theme.node.footer.color});

        const top = FBS.nodeAssets.frontMountTop.clone(true);

        top.traverse((o) => {
            if(o.material) o.material = headMaterial;
        });


        const body = FBS.nodeAssets.frontMountBody.clone();
        body.position.setX(this.nodeWidth/2);
        body.material = bodyMaterial;

        const bottom = FBS.nodeAssets.frontMountBottom.clone(true);
        const frontMountFooter = bottom.getObjectByName('frontMountFooter');
        frontMountFooter.material = footerMaterial;
        const frontMountCornerBottomLeft = bottom.getObjectByName('frontMountCornerBottomLeft');
        frontMountCornerBottomLeft.material = footerMaterial;
        const frontMountBodyBottom = bottom.getObjectByName('frontMountBodyBottom');
        frontMountBodyBottom.material = footerMaterial;
        const frontMountCornerBottomRight = bottom.getObjectByName('frontMountCornerBottomRight');
        frontMountCornerBottomRight.material = footerMaterial;

        const mount = new THREE.Group();
        mount.add(top);
        mount.add(body);
        mount.add(bottom);

        mount.name = 'frontMount';

        mount.position.set(C.nodeMesh.mount.borderSize, -C.nodeMesh.mount.borderSize, C.layers.frontMount);

        return mount;
    }

    createRightResizer(){
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(C.nodeMesh.rightResizer.width, 1),
            new THREE.MeshBasicMaterial({color: 'green', transparent: true, opacity:0.5})
        );
        mesh.name = 'rightResizer';

        mesh.position.setX(this.nodeWidth);

        return mesh;
    }

    scaleRightResizer(mesh) {
        mesh = mesh ? mesh : this.mesh.getObjectByName('rightResizer');
        mesh.scale.setY(Math.abs(this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2 -
            this.cPortsOutput.length * C.nodeMesh.port.height - C.nodeMesh.footer.height));
        mesh.position.setY(-C.nodeMesh.mount.roundCornerRadius - mesh.scale.y/2);
    }

    hoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = Theme.theme.node.footer.label.hoverColor;
    }

    unhoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = Theme.theme.node.footer.label.color;
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
        /**
         * backMountBody имеет общий материал с:
         * backMountBodyTop, backMountCornerTopRight, backMountCornerTopLeft, backMountCornerBottomLeft,
         * backMountCornerBottomRight, backMountBodyBottom
         */
        const mount = this.mesh.getObjectByName('backMountBody');
        mount.material.color.setStyle(Theme.theme.node.mount.back.selectedColor);

        const title = this.mesh.getObjectByName('title');
        title.color = Theme.theme.node.title.fontSelectedColor;
    }

    unselect(){
        this.selected = false;
        /**
         * backMountBody имеет общий материал с:
         * backMountBodyTop, backMountCornerTopRight, backMountCornerTopLeft, backMountCornerBottomLeft,
         * backMountCornerBottomRight, backMountBodyBottom
         */
        const mount = this.mesh.getObjectByName('backMountBody');
        mount.material.color.setStyle(Theme.theme.node.mount.back.color);

        const title = this.mesh.getObjectByName('title');
        title.color = Theme.theme.node.title.fontColor;
    }

    getMNode(){
        return this.mesh;
    }

    getPseudoPort(type) {
        let cPort, cPorts;
        if (type === 'input') {
            cPorts = this.cPortsInput;
        } else {
            cPorts = this.cPortsOutput;
        }
        for (let i = 0; i < cPorts.length; i += 1) {
            if(cPorts[i].type === 'pseudo'){
                cPort = cPorts[i];
                break;
            }
        }
        return cPort;
    }

    middleCollapsePorts(){
        let animateTasks = [];
        if(this.middleCollapse.isCollapsed) //UNCOLLAPSE
        {
            this.middleCollapse.isCollapsed = false;

            const cPseudoPortInput = this.getPseudoPort('input');
            if (this.middleCollapse.isPseudoInputExist) {
                cPseudoPortInput.changeLabelText(this.shortCollapse.inputPortsCollapsed);
                if (!this.shortCollapse.inputPortsCollapsed) cPseudoPortInput.hideConnector();
                cPseudoPortInput.setCLines(this.middleCollapse.storeCLinesInput);
            } else {
                if(cPseudoPortInput){
                    this.mesh.remove(cPseudoPortInput.getMPort());
                }
            }

            const cPseudoPortOutput = this.getPseudoPort('output');
            if (this.middleCollapse.isPseudoOutputExist) {
                cPseudoPortOutput.changeLabelText(this.shortCollapse.outputPortsCollapsed);
                if (!this.shortCollapse.outputPortsCollapsed) cPseudoPortOutput.hideConnector();
                cPseudoPortOutput.setCLines(this.middleCollapse.storeCLinesOutput);
            }else {
                if(cPseudoPortOutput){
                    this.mesh.remove(cPseudoPortOutput.getMPort());
                }
            }

            this.cPortsInput = [...this.middleCollapse.storeCPortsInput];
            this.cPortsOutput = [...this.middleCollapse.storeCPortsOutput];

            this.middleCollapse.storeCLinesInput = [];
            this.middleCollapse.storeCLinesOutput = [];

            for (let i = 0; i < this.cPortsInput.length; i += 1) {
                if (this.cPortsInput[i].type === 'pseudo') continue;
                const mPort = this.cPortsInput[i].getMPort();
                this.mesh.add(mPort);
                animateTasks.push({
                    target: mPort.scale,
                    value: {x: 1, y: 1, z: 1},
                    time: C.animation.portHideTime
                });

                const cLines = this.cPortsInput[i].getCLines();
                cLines.map((cLine) => {
                    cLine.unCollapsedPort2();
                });
            }

            for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                if (this.cPortsOutput[i].type === 'pseudo') continue;
                const mPort = this.cPortsOutput[i].getMPort();
                this.mesh.add(mPort);
                animateTasks.push({
                    target: mPort.scale,
                    value: {x: 1, y: 1, z: 1},
                    time: C.animation.portHideTime
                });

                const cLines = this.cPortsOutput[i].getCLines();
                cLines.map((cLine) => {
                    cLine.unCollapsedPort1();

                    /**
                     * Для входных портов на другом конце линии коннектор делается активным
                     */
                    const cPort2 = cLine.getCPort2();
                    cPort2.setConnectorActive();
                });
            }

            this.middleCollapse.storeCPortsInput = [];
            this.middleCollapse.storeCPortsOutput = [];
            this.calcNodeHeight();

            if(cPseudoPortInput)this.movePseudoInputPortBack(cPseudoPortInput.getMPort());
            if(cPseudoPortOutput) this.movePseudoOutputPortBack(cPseudoPortOutput.getMPort());
        }
        else
        { //COLLAPSE
            this.middleCollapse.isCollapsed = true;
            this.middleCollapse.storeCPortsInput = [...this.cPortsInput];
            this.middleCollapse.storeCPortsOutput = [...this.cPortsOutput];

            let cPseudoPortInput = this.getPseudoPort('input');
            let cPseudoPortOutput = this.getPseudoPort('output');

            this.middleCollapse.isPseudoInputExist = !!cPseudoPortInput;
            this.middleCollapse.isPseudoOutputExist = !!cPseudoPortOutput;

            if (!cPseudoPortInput && this.cPortsInput.length > 0) {
                cPseudoPortInput = new PseudoPort('input', this);
                cPseudoPortInput.removeLabelText();
                const mesh = cPseudoPortInput.getMPort();
                const positions = this.calcPositionsForInputPorts();
                mesh.position.set(positions[0].x, positions[0].y, positions[0].z);
                this.mesh.add(mesh);
            }
            if (!cPseudoPortOutput && this.cPortsOutput.length > 0) {
                cPseudoPortOutput = new PseudoPort('output', this);
                cPseudoPortOutput.removeLabelText();
                const mesh = cPseudoPortOutput.getMPort();
                const positions = this.calcPositionsForOutputPorts();
                mesh.position.set(positions[positions.length - 1].x, positions[positions.length - 1].y, positions[positions.length - 1].z);
                this.mesh.add(mesh);
            }

            if(cPseudoPortInput) {
                cPseudoPortInput.removeLabelText();
                cPseudoPortInput.showConnector();
                this.middleCollapse.storeCLinesInput = [...cPseudoPortInput.getCLines()];
                this.movePseudoPortToPos(cPseudoPortInput.getMPort(), this.getFirstPortPosition());
            }

            if(cPseudoPortOutput) {
                cPseudoPortOutput.removeLabelText();
                cPseudoPortOutput.showConnector();
                this.middleCollapse.storeCLinesOutput = [...cPseudoPortOutput.getCLines()];
                this.movePseudoPortToPos(cPseudoPortOutput.getMPort(), this.getFirstPortPosition());
            }
            const allInputLines = [];
            for (let i = 0; i < this.cPortsInput.length; i += 1) {
                allInputLines.push(...this.cPortsInput[i].getCLines());
                if (this.cPortsInput[i].type === 'pseudo') continue;

                const mPort = this.cPortsInput[i].getMPort();
                animateTasks.push({
                    target: mPort.scale,
                    value: {x: 0, y: 0, z: 0},
                    time: C.animation.portHideTime,
                    callbackOnComplete: () => {
                        this.mesh.remove(mPort)
                    }
                });
            }
            if (cPseudoPortInput) cPseudoPortInput.setCLines(allInputLines);
            allInputLines.map((cLine) => {
                cLine.collapsedPort2();
            });

            const allOutputLines = [];
            for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                allOutputLines.push(...this.cPortsOutput[i].getCLines());

                if (this.cPortsOutput[i].type === 'pseudo') continue;
                const mPort = this.cPortsOutput[i].getMPort();
                animateTasks.push({
                    target: mPort.scale,
                    value: {x: 0, y: 0, z: 0},
                    time: C.animation.portHideTime,
                    callbackOnComplete: () => {
                        this.mesh.remove(mPort)
                    }
                });
            }

            if (cPseudoPortOutput) cPseudoPortOutput.setCLines(allOutputLines);
            allOutputLines.map((cLine) => {
                cLine.collapsedPort1();

                /**
                 * Для входных портов на другом конце линии коннектор делается неактивным
                 */
                const cPort2 = cLine.getCPort2();
                cPort2.setConnectorInactive();

            });

            if (cPseudoPortInput) this.cPortsInput = [cPseudoPortInput];
            if (cPseudoPortOutput) this.cPortsOutput = [cPseudoPortOutput];

            this.calcNodeHeight(1);
        }

        animateTasks.push(this.getRefreshLinesTask());
        FBS.animationControl.animate(animateTasks);
        this.scaleHeightNodeWithAnimation();
        this.collapseButtonRotate();
    }

    fullCollapseNode(isNeedCollapse){
        /*
        Ниже система очередей, если анимация не завершена, а поступила другая задача,
        то новая задача встаёт в очередь и выполняется после текущей
         */
        if(this.fullCollapse.state === 'inProcess'){
            this.fullCollapse.queue.push({isNeedCollapse: isNeedCollapse});
        } else {
            let operationCount = 0;
            let waitCount = 0;
            const wait = () => {
                waitCount += 1;
                if (waitCount === operationCount) {
                    this.fullCollapse.state = 'done';
                    const queue = this.fullCollapse.queue;
                    if(queue[0]){
                        const value = queue[0].isNeedCollapse;
                        queue.splice(0, 1);
                        if(this.fullCollapse.isCollapsed !== value){
                            this.fullCollapseNode(value);
                        }
                    }
                }
            }

            this.fullCollapse.state = 'inProcess';
            let animateTasks = [];
            if (isNeedCollapse) //COLLAPSE
            {
                this.fullCollapse.isCollapsed = true;
                this.calcNodeMinHeight();
                this.fullCollapse.storeCPortsInput = [...this.cPortsInput];
                this.fullCollapse.storeCPortsOutput = [...this.cPortsOutput];

                let cPseudoPortInput = this.getPseudoPort('input');
                let cPseudoPortOutput = this.getPseudoPort('output');

                this.fullCollapse.isPseudoInputExist = !!cPseudoPortInput;
                this.fullCollapse.isPseudoOutputExist = !!cPseudoPortOutput;

                if (!cPseudoPortInput && this.cPortsInput.length > 0) {
                    cPseudoPortInput = new PseudoPort('input', this);
                    cPseudoPortInput.removeLabelText();
                    const mesh = cPseudoPortInput.getMPort();
                    const positions = this.calcPositionsForInputPortsMin();
                    mesh.position.set(positions[0].x, positions[0].y, positions[0].z);
                    this.mesh.add(mesh);
                }
                if (!cPseudoPortOutput && this.cPortsOutput.length > 0) {
                    cPseudoPortOutput = new PseudoPort('output', this);
                    cPseudoPortOutput.removeLabelText();
                    const mesh = cPseudoPortOutput.getMPort();
                    const positions = this.calcPositionsForOutputPortsMin();
                    mesh.position.set(positions[positions.length - 1].x, positions[positions.length - 1].y, positions[positions.length - 1].z);
                    this.mesh.add(mesh);
                }

                if (cPseudoPortInput) {
                    cPseudoPortInput.removeLabelText();
                    cPseudoPortInput.showConnector();
                    this.fullCollapse.storeCLinesInput = [...cPseudoPortInput.getCLines()];
                    this.movePseudoPortToPos(cPseudoPortInput.getMPort(), this.getFirstPortPositionMin());
                }

                if (cPseudoPortOutput) {
                    cPseudoPortOutput.removeLabelText();
                    cPseudoPortOutput.showConnector();
                    this.fullCollapse.storeCLinesOutput = [...cPseudoPortOutput.getCLines()];
                    this.movePseudoPortToPos(cPseudoPortOutput.getMPort(), this.getFirstPortPositionMin());
                }

                const allInputLines = [];
                for (let i = 0; i < this.cPortsInput.length; i += 1) {
                    allInputLines.push(...this.cPortsInput[i].getCLines());
                    if (this.cPortsInput[i].type === 'pseudo') continue;

                    const mPort = this.cPortsInput[i].getMPort();
                    operationCount += 1;
                    animateTasks.push({
                        target: mPort.scale,
                        value: {x: 0, y: 0, z: 0},
                        time: C.animation.portHideTime,
                        callbackOnComplete: () => {
                            wait();
                            this.mesh.remove(mPort);
                        }
                    });
                }
                if (cPseudoPortInput) cPseudoPortInput.setCLines(allInputLines);
                allInputLines.map((cLine) => {
                    cLine.collapsedPort2();
                });

                const allOutputLines = [];
                for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                    allOutputLines.push(...this.cPortsOutput[i].getCLines());

                    if (this.cPortsOutput[i].type === 'pseudo') continue;
                    const mPort = this.cPortsOutput[i].getMPort();
                    operationCount += 1;
                    animateTasks.push({
                        target: mPort.scale,
                        value: {x: 0, y: 0, z: 0},
                        time: C.animation.portHideTime,
                        callbackOnComplete: () => {
                            wait();
                            this.mesh.remove(mPort);
                        }
                    });
                }

                if (cPseudoPortOutput) cPseudoPortOutput.setCLines(allOutputLines);
                allOutputLines.map((item) => {
                    item.collapsedPort1();
                });

                if (cPseudoPortInput) this.cPortsInput = [cPseudoPortInput];
                if (cPseudoPortOutput) this.cPortsOutput = [cPseudoPortOutput];

                const mFooter = this.mesh.getObjectByName('frontMountFooter');
                mFooter.material.color.setStyle(Theme.theme.node.mount.front.bodyColor);
                const mFooterLabel = this.mesh.getObjectByName('footerLabel');
                operationCount += 1;
                animateTasks.push({
                    target: mFooterLabel.scale,
                    value: {x: 0, y: 0, z: 0},
                    time: C.animation.footerLabelHideTime,
                    callbackOnComplete() {
                        wait();
                    }
                });

                this.showMenuButtons(false);
            }
            else  //UNCOLLAPSE
            {
                this.fullCollapse.isCollapsed = false;

                const cPseudoPortInput = this.getPseudoPort('input');
                if (this.fullCollapse.isPseudoInputExist) {
                    if(this.middleCollapse.isCollapsed){
                        cPseudoPortInput.removeLabelText();
                    } else {
                        cPseudoPortInput.changeLabelText(this.shortCollapse.inputPortsCollapsed);
                    }

                    if (!this.shortCollapse.inputPortsCollapsed) cPseudoPortInput.hideConnector();
                    cPseudoPortInput.setCLines(this.fullCollapse.storeCLinesInput);
                } else {
                    if (cPseudoPortInput) {
                        this.mesh.remove(cPseudoPortInput.getMPort());
                    }
                }



                const cPseudoPortOutput = this.getPseudoPort('output');
                if (this.fullCollapse.isPseudoOutputExist) {
                    if(this.middleCollapse.isCollapsed){
                        cPseudoPortOutput.removeLabelText();
                    } else {
                        cPseudoPortOutput.changeLabelText(this.shortCollapse.outputPortsCollapsed);
                    }
                    if (!this.shortCollapse.outputPortsCollapsed) cPseudoPortOutput.hideConnector();
                    cPseudoPortOutput.setCLines(this.fullCollapse.storeCLinesOutput);
                } else {
                    if (cPseudoPortOutput) {
                        this.mesh.remove(cPseudoPortOutput.getMPort());
                    }
                }

                this.cPortsInput = [...this.fullCollapse.storeCPortsInput];
                this.cPortsOutput = [...this.fullCollapse.storeCPortsOutput];

                this.fullCollapse.storeCLinesInput = [];
                this.fullCollapse.storeCLinesOutput = [];

                for (let i = 0; i < this.cPortsInput.length; i += 1) {
                    if (this.cPortsInput[i].type === 'pseudo') continue;
                    const mPort = this.cPortsInput[i].getMPort();
                    this.mesh.add(mPort);
                    operationCount += 1;
                    animateTasks.push({
                        target: mPort.scale,
                        value: {x: 1, y: 1, z: 1},
                        time: C.animation.portHideTime,
                        callbackOnComplete: () => {
                            wait();
                        }
                    });

                    const cLines = this.cPortsInput[i].getCLines();
                    cLines.map((item) => {
                        item.unCollapsedPort2();
                    });
                }

                for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                    if (this.cPortsOutput[i].type === 'pseudo') continue;
                    const mPort = this.cPortsOutput[i].getMPort();
                    this.mesh.add(mPort);
                    operationCount += 1;
                    animateTasks.push({
                        target: mPort.scale,
                        value: {x: 1, y: 1, z: 1},
                        time: C.animation.portHideTime,
                        callbackOnComplete: () => {
                            wait();
                        }
                    });

                    const cLines = this.cPortsOutput[i].getCLines();
                    cLines.map((item) => {
                        item.unCollapsedPort1();
                    });
                }

                this.fullCollapse.storeCPortsInput = [];
                this.fullCollapse.storeCPortsOutput = [];


                if(this.middleCollapse.isCollapsed){
                    this.calcNodeHeight(1);
                    if (cPseudoPortInput) this.movePseudoPortToPos(cPseudoPortInput.getMPort(), this.getFirstPortPosition());
                    if (cPseudoPortOutput) this.movePseudoPortToPos(cPseudoPortOutput.getMPort(), this.getFirstPortPosition());
                } else {
                    this.calcNodeHeight();
                    if (cPseudoPortInput) this.movePseudoInputPortBack(cPseudoPortInput.getMPort());
                    if (cPseudoPortOutput) this.movePseudoOutputPortBack(cPseudoPortOutput.getMPort());
                }

                const mFooter = this.mesh.getObjectByName('frontMountFooter');
                mFooter.material.color.setStyle(Theme.theme.node.footer.color);
                const mFooterLabel = this.mesh.getObjectByName('footerLabel');
                operationCount += 1;
                animateTasks.push({
                    target: mFooterLabel.scale,
                    value: {x: 1, y: 1, z: 1},
                    time: C.animation.footerLabelHideTime,
                    callbackOnComplete: () => {
                        wait();
                    }
                });

                this.showMenuButtons(true);
            }

            animateTasks.push(this.getRefreshLinesTask());
            FBS.animationControl.animate(animateTasks);
            this.scaleHeightNodeWithAnimation();
            this.collapseButtonRotate();
        }
    }

    showMenuButtons(show) {
        const mCollapseButton = this.mesh.getObjectByName('collapseButton');
        if(mCollapseButton) mCollapseButton.visible = show;
        const mPlayButton = this.mesh.getObjectByName('playButton');
        if(mPlayButton) mPlayButton.visible = show;
        const mMenuButton = this.mesh.getObjectByName('menuButton');
        if(mMenuButton) mMenuButton.visible = show;
    }

    collapseButtonRotate() {
        const mCollapse = this.mesh.getObjectByName('collapseButton');
        if(mCollapse) {
            let angle;
            if (this.middleCollapse.isCollapsed) {
                angle = Math.PI * 1.5;
            } else {
                angle = Math.PI;
            }
            FBS.animationControl.animate([{
                target: mCollapse.rotation,
                value: {z: angle},
                time: C.animation.collapseButtonRotateTime
            }]);
        }
    }

    /**
     * Создание задачи на анимацию обновления размерных линий
     * @returns {{callbackOnUpdate: callbackOnUpdate, time: number, value: {x: number}, target: {x: number}}}
     */
    getRefreshLinesTask(){
        return {
            target: {x:0},
            value: {x: 1},
            time: C.animation.portHideTime,
            callbackOnUpdate: ()=> {
                FBS.lineControl.refreshLines([this.mesh]);
            }
        };
    }

    shortCollapsePorts(cPseudoPort){
        if(cPseudoPort.direction === 'input'){
            this.shortCollapseInputPorts(cPseudoPort, C.nodeMesh.constraints.maxVisiblePorts);
        } else {
            this.shortCollapseOutputPorts(cPseudoPort, C.nodeMesh.constraints.maxVisiblePorts);
        }
    }

    shortCollapseInputPorts(cPseudoPort, maxVisiblePorts){
        if(this.shortCollapse.inputPortsCollapsed){ //unCollapse
            this.shortCollapse.inputPortsCollapsed = false;
            this.unCollapseInputPorts(cPseudoPort);
        } else { //collapse
            this.shortCollapse.inputPortsCollapsed = true;
            this.collapseInputPorts(cPseudoPort, maxVisiblePorts);
        }

        const positions = this.calcPositionsForInputPorts();
        positions.length = positions.length - 1; //remove position for pseudo port. he moved by tween
        this.setPositionsForInputPorts(positions);
        this.scaleHeightNodeWithAnimation();
    }

    collapseInputPorts(cPseudoPort, maxVisiblePorts){
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            if(this.cPortsInput[i] === cPseudoPort) {
                this.cPortsInput.splice(i, 1);
                break;
            }
        }
        this.cPortsInput = this.packPortsWithPseudo(this.cPortsInput, 'input', maxVisiblePorts, cPseudoPort);
        this.calcNodeHeight();
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        const animateTasks = [];

        for(let i = 0; i < hidedCPorts.length; i += 1){
            const cLines = hidedCPorts[i].getCLines();
            cLines.map((item) => {item.collapsedPort2()});
            const mPort = hidedCPorts[i].getMPort();
            animateTasks.push({
                target: mPort.scale,
                value: {x: 0, y: 0, z: 0},
                time: C.animation.portHideTime,
                callbackOnComplete: () => {
                    this.mesh.remove(mPort)
                }
            });
        }

        const positions = this.calcPositionsForOutputPorts();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            const mPort = this.cPortsOutput[i].getMPort();
            animateTasks.push({
                target: mPort.position,
                value: {x: mPort.position.x, y: positions[i].y, z: mPort.position.z},
                time: C.animation.portHideTime
            });
        }

        cPseudoPort.changeLabelText(true);
        cPseudoPort.showConnector();
        this.movePseudoInputPortBack(cPseudoPort.getMPort());
        FBS.animationControl.animate(animateTasks);
    }

    unCollapseInputPorts(cPseudoPort){
        const animateTasks = [];
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        for(let i = 0; i < hidedCPorts.length; i += 1){
            const mPort = hidedCPorts[i].getMPort();
            this.cPortsInput.push(hidedCPorts[i]);
            mPort.scale.set(0, 0, 0);
            this.mesh.add(mPort);

            animateTasks.push({
                target: mPort.scale,
                value: {x: 1, y: 1, z: 1},
                time: C.animation.portHideTime
            });
        }

        for(let i = 0; i < this.cPortsInput.length; i += 1){
            if(this.cPortsInput[i] === cPseudoPort){
                this.cPortsInput.splice(i, 1);
                break;
            }
        }
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            const cLines = this.cPortsInput[i].getCLines();
            cLines.map((cLine) => {cLine.unCollapsedPort2()});
        }

        this.cPortsInput.push(cPseudoPort);
        cPseudoPort.setHidedCPorts([]);
        cPseudoPort.changeLabelText(false);
        cPseudoPort.hideConnector();
        this.calcNodeHeight();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            const mPort = this.cPortsOutput[i].getMPort();
            const positions = this.calcPositionsForOutputPorts();
            animateTasks.push({
                target: mPort.position,
                value: {x: mPort.position.x, y: positions[i].y, z: mPort.position.z},
                time: C.animation.portHideTime
            });
        }
        this.movePseudoInputPortBack(cPseudoPort.getMPort());
        FBS.animationControl.animate(animateTasks);
    }

    shortCollapseOutputPorts(cPseudoPort, maxVisiblePorts){
        if(this.shortCollapse.outputPortsCollapsed){ //unCollapse
            this.shortCollapse.outputPortsCollapsed = false;
            this.unCollapseOutputPorts(cPseudoPort);
        } else { //collapse
            this.shortCollapse.outputPortsCollapsed = true;
            this.collapseOutputPorts(cPseudoPort, maxVisiblePorts);
        }

        const positions = this.calcPositionsForOutputPorts();
        positions.length = positions.length - 1; //remove position for pseudo port. he moved by tween

        this.setPositionsForOutputPorts(positions);
        this.scaleHeightNodeWithAnimation();
    }

    collapseOutputPorts(cPseudoPort, maxVisiblePorts){
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            if(this.cPortsOutput[i] === cPseudoPort) {
                this.cPortsOutput.splice(i, 1);
                break;
            }
        }
        this.cPortsOutput = this.packPortsWithPseudo(this.cPortsOutput, 'output', maxVisiblePorts, cPseudoPort);
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        const animateTasks = [];
        this.calcNodeHeight();
        for(let i = 0; i < hidedCPorts.length; i += 1){
            const cLines = hidedCPorts[i].getCLines();
            cLines.map((cLine) => {
                cLine.collapsedPort1();

                /**
                 * Для входных портов на другом конце линии коннектор делается неактивным
                 */
                if(!cLine.isPort2Collapsed) {
                    const cPort2 = cLine.getCPort2();
                    cPort2.setConnectorInactive();
                }
            });
            const mPort = hidedCPorts[i].getMPort();
            animateTasks.push({
                target: mPort.scale,
                value: {x: 0, y: 0, z: 0},
                time: C.animation.portHideTime,
                callbackOnComplete: () => {
                    this.mesh.remove(mPort)
                }
            });
        }

        cPseudoPort.changeLabelText(true);
        cPseudoPort.showConnector();
        this.movePseudoOutputPortBack(cPseudoPort.getMPort());
        FBS.animationControl.animate(animateTasks);
    }

    unCollapseOutputPorts(cPseudoPort){
        const animateTasks = [];
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        for(let i = 0; i < hidedCPorts.length; i += 1){
            const mPort = hidedCPorts[i].getMPort();
            this.cPortsOutput.push(hidedCPorts[i]);

            mPort.scale.set(0, 0, 0);
            this.mesh.add(mPort);

            animateTasks.push({
                target: mPort.scale,
                value: {x: 1, y: 1, z: 1},
                time: C.animation.portHideTime
            });
        }
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            if(this.cPortsOutput[i] === cPseudoPort){
                this.cPortsOutput.splice(i, 1);
                break;
            }
        }
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            const cLines = this.cPortsOutput[i].getCLines();
            cLines.map((cLine) => {
                cLine.unCollapsedPort1();

                /**
                 * Для входных портов на другом конце линии коннектор делается активным
                 */
                if(!cLine.isPort2Collapsed) {
                    const cPort2 = cLine.getCPort2();
                    cPort2.setConnectorActive();
                }
            });
        }

        this.cPortsOutput.push(cPseudoPort);
        cPseudoPort.changeLabelText(false);
        cPseudoPort.setHidedCPorts([]);
        cPseudoPort.hideConnector();
        this.calcNodeHeight();
        this.movePseudoOutputPortBack(cPseudoPort.getMPort());
        FBS.animationControl.animate(animateTasks);
    }

    scaleHeightNodeWithAnimation(){
        this.scaleRightResizer();
        const tasks = [];
        const mBackMount = this.mesh.getObjectByName('backMountBody');
        tasks.push({
            target: mBackMount.scale,
            time: C.animation.nodeCollapseTime,
            value: {x: this.nodeWidth, y: this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2, z: 1}
        });
        tasks.push({
            target: mBackMount.position,
            time: C.animation.nodeCollapseTime,
            value: {x: mBackMount.position.x, y: -this.nodeHeight / 2, z: mBackMount.position.z}
        });

        const mFrontMount = this.mesh.getObjectByName('frontMountBody');
        tasks.push({
            target: mFrontMount.scale,
            time: C.animation.nodeCollapseTime,
            value: {
                x: this.nodeWidth - C.nodeMesh.mount.borderSize * 2,
                y: this.nodeHeight - C.nodeMesh.mount.roundCornerRadius  * 2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.footer.height,
                z: 1
            }
        });
        tasks.push({
            target: mFrontMount.position,
            time: C.animation.nodeCollapseTime,
            value: {
                x: mFrontMount.position.x,
                y: -(this.nodeHeight - C.nodeMesh.mount.roundCornerRadius  * 2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.footer.height)/2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.borderSize,
                z: mFrontMount.position.z
            }
        });

        const mFrontFooter = this.mesh.getObjectByName('frontMountBottom');
        tasks.push({
            target: mFrontFooter.position,
            time: C.animation.nodeCollapseTime,
            value: {x: mFrontFooter.position.x, y: -this.nodeHeight + C.nodeMesh.mount.borderSize*2, z: mFrontFooter.position.z}
        });

        const mBackFooter = this.mesh.getObjectByName('backMountBottom');
        tasks.push({
            target: mBackFooter.position,
            time: C.animation.nodeCollapseTime,
            value: {x: mBackFooter.position.x, y: -this.nodeHeight, z: mBackFooter.position.z}
        });

        FBS.animationControl.animate(tasks);
    }

    scaleNode(){
        this.moveIndicator();
        this.moveOutputPorts();
        this.moveMenuButton();
        this.movePlayButton();
        this.scaleBackMountBody();
        this.scaleFrontMountBody();
        this.scaleRightResizer();
    }

    setNodeWidth(width){
        this.nodeWidth = Math.max(C.nodeMesh.mount.minWidth, Math.min(C.nodeMesh.mount.maxWidth, width));
    }

    moveIndicator(){
        const indicator = this.mesh.getObjectByName('indicator');
        indicator.position.setX(this.nodeWidth - C.nodeMesh.indicator.rightMargin);
    }

    moveOutputPorts(){
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            if(this.cPortsOutput[i].type === 'pseudo') {
                this.cPortsOutput[i].getMPort().position.setX(this.nodeWidth);
            }
        }
        for(let i = 0; i < this.allCPorts.length; i += 1){
            if(this.allCPorts[i].direction === 'input') continue;
            this.allCPorts[i].getMPort().position.setX(this.nodeWidth);
        }
    }

    moveMenuButton(){
        const menu = this.mesh.getObjectByName('menuButton');
        menu.position.setX(this.nodeWidth - C.nodeMesh.header.menu.rightMargin);
    }

    movePlayButton(){
        const play = this.mesh.getObjectByName('playButton');
        play.position.setX(this.nodeWidth - C.nodeMesh.header.play.rightMargin);
    }

    scaleBackMountBody(){
        const top = this.mesh.getObjectByName('backMountTop');
        const topBody = top.getObjectByName('backMountBodyTop');
        topBody.scale.set(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2, 1, 1);
        topBody.position.setX(this.nodeWidth/2);
        const topRightCorner = top.getObjectByName('backMountCornerTopRight');
        topRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius);

        const body = this.mesh.getObjectByName('backMountBody');
        body.scale.set( this.nodeWidth, this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2, 1);
        body.position.setY(-this.nodeHeight/2);
        body.position.setX(this.nodeWidth/2);

        const bottom = this.mesh.getObjectByName('backMountBottom');
        bottom.position.setY(-this.nodeHeight);
        const bottomBody = bottom.getObjectByName('backMountBodyBottom');
        bottomBody.scale.set(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2, 1, 1);
        bottomBody.position.setX(this.nodeWidth/2);
        const bottomRightCorner = bottom.getObjectByName('backMountCornerBottomRight');
        bottomRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius);
    }

    scaleFrontMountBody(){
        const top = this.mesh.getObjectByName('frontMountTop');
        const topBody = top.getObjectByName('frontMountBodyTop');
        topBody.scale.set(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2, 1, 1);
        topBody.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);
        const topRightCorner = top.getObjectByName('frontMountCornerTopRight');
        topRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
        const header = top.getObjectByName('frontMountHeader');
        header.scale.setX(this.nodeWidth - C.nodeMesh.mount.borderSize * 2);
        header.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);

        const bodyHeight = this.nodeHeight - C.nodeMesh.mount.roundCornerRadius  * 2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.footer.height;
        const body = this.mesh.getObjectByName('frontMountBody');
        body.scale.set(this.nodeWidth - C.nodeMesh.mount.borderSize * 2, bodyHeight, 1);
        body.position.setY(-bodyHeight/2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.borderSize);
        body.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);

        const bottom = this.mesh.getObjectByName('frontMountBottom');
        bottom.position.setY(-this.nodeHeight + C.nodeMesh.mount.borderSize * 2);
        const frontMountFooter = bottom.getObjectByName('frontMountFooter');
        frontMountFooter.scale.setX(this.nodeWidth - C.nodeMesh.mount.borderSize * 2);
        frontMountFooter.position.set(
            this.nodeWidth/2 - C.nodeMesh.mount.borderSize,
            C.nodeMesh.footer.height/2 + C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize,
            frontMountFooter.position.z
        );
        const bottomBody = bottom.getObjectByName('frontMountBodyBottom');
        bottomBody.scale.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2);
        bottomBody.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);
        const bottomRightCorner = bottom.getObjectByName('frontMountCornerBottomRight');
        bottomRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
    }

    calcNodeHeight(portsCount) {
        portsCount = portsCount ? portsCount : this.calcVisiblePortsCount();
        const portsHeight = portsCount * C.nodeMesh.port.height;
        this.nodeHeight = C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.front.headHeight +
            C.nodeMesh.header.height + portsHeight + C.nodeMesh.footer.height + C.nodeMesh.mount.roundCornerRadius;
    }

    calcNodeMinHeight(){
        this.nodeHeight = C.nodeMesh.mount.roundCornerRadius * 2 + C.nodeMesh.mount.front.headHeight +
            C.nodeMesh.port.height;
    }

    calcVisiblePortsCount() {
        let count = 0;
        const inPorts = this.cPortsInput;
        if (inPorts.length > C.nodeMesh.constraints.maxVisiblePorts ) {
            if(this.shortCollapse.inputPortsCollapsed) {
                count += C.nodeMesh.constraints.maxVisiblePorts;
            } else {
                count += inPorts.length;
            }
        } else {
            count += inPorts.length;
        }

        const outPorts = this.cPortsOutput;
        if (outPorts.length > C.nodeMesh.constraints.maxVisiblePorts) {
            if(this.shortCollapse.outputPortsCollapsed) {
                count += C.nodeMesh.constraints.maxVisiblePorts;
            } else {
                count += outPorts.length;
            }
        } else {
            count += outPorts.length;
        }

        return count;
    }

    getAllCPorts(){
        return this.allCPorts;
    }

    getAllVisibleCPorts(){
        return [...this.cPortsInput, ...this.cPortsOutput];
    }

    moveToOverAllZ(){
        this.mesh.position.setZ(C.layers.topForNode);
    }

    moveToOriginZ(){
        this.mesh.position.setZ(this.originZ);
    }

    updateTheme(){
        let m;
        m = this.mesh.getObjectByName('title');
        if(m){
            m.color = Theme.theme.node.title.fontColor;
            m.font = Theme.theme.fontPaths.mainMedium;
        }

        m = this.mesh.getObjectByName('indicator');
        if(m){
            m.color = Theme.theme.node.indicator.fontColor;
            m.font = Theme.theme.fontPaths.mainNormal;
        }

        m = this.mesh.getObjectByName('collapseButton');
        if(m) m.color = Theme.theme.node.header.collapse.fontColor;

        m = this.mesh.getObjectByName('playButton');
        if(m) m.color = Theme.theme.node.header.play.fontColor;

        m = this.mesh.getObjectByName('menuButton');
        if(m) m.color = Theme.theme.node.header.menu.fontColor;

        /**
         *frontMountHeader имеет общий материал с:
         * frontMountCornerTopLeft, frontMountBodyTop, frontMountCornerTopRight
         */
        m = this.mesh.getObjectByName('frontMountHeader');
        if(m) m.material.color.setStyle(Theme.theme.node.mount.front.headColor);


        m = this.mesh.getObjectByName('frontMountBody');
        if(m) m.material.color.setStyle(Theme.theme.node.mount.front.bodyColor);

        /**
         * frontMountFooter имеет общий материал с:
         * frontMountCornerBottomLeft, frontMountBodyBottom, frontMountCornerBottomRight
         */
        m = this.mesh.getObjectByName('frontMountFooter');
        if(m) {
            if (this.fullCollapse.isCollapsed) {
                m.material.color.setStyle(Theme.theme.node.mount.front.bodyColor);
            } else {
                m.material.color.setStyle(Theme.theme.node.footer.color);
            }
        }

        m = this.mesh.getObjectByName('footerLabel');
        if(m) {
            m.color = Theme.theme.node.footer.label.color;
            m.font = Theme.theme.fontPaths.mainNormal;
        }

        /**
         * backMountBody имеет общий материал с:
         * backMountBodyTop, backMountCornerTopRight, backMountCornerTopLeft, backMountCornerBottomLeft,
         * backMountCornerBottomRight, backMountBodyBottom
         */
        m = this.mesh.getObjectByName('backMountBody');
        if(m) m.material.color.setStyle(Theme.theme.node.mount.back.color);

        if(this.selected) this.select();

        //all regular ports
        this.allCPorts.map(cPort=>{
            cPort.updateTheme();
        });
        //all pseudo ports
        const cPseudoPortInput = this.getPseudoPort('input');
        if(cPseudoPortInput) cPseudoPortInput.updateTheme();

        const cPseudoPortOutput = this.getPseudoPort('output');
        if(cPseudoPortOutput) cPseudoPortOutput.updateTheme();
    }
}