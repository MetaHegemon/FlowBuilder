import * as THREE from "three";
import Port from './NodePort';
import PseudoPort from "./NodePseudoPort";
import C from "./../Constants";
import ThemeControl from '../../themes/ThemeControl';
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
        const nodeObject = new THREE.Group();
        nodeObject.name = 'node';

        //create title
        const title = FBS.nodeAssets.title.clone();
        title.text = this.data.name;
        nodeObject.add(title);

        //create indicator
        const indicator = FBS.nodeAssets.indicator.clone();
        indicator.text = this.data.indicator;
        nodeObject.add(indicator);

        const regularShield = FBS.nodeAssets.getRegularShield({
            withCollapseButton: this.data.inputs.length > 1 || this.data.outputs.length > 1
        }).clone();
        nodeObject.add(regularShield);

        nodeObject.add(FBS.nodeAssets.getMiniShield().clone());

        nodeObject.add(FBS.nodeAssets.bigMount.clone());

        //input ports
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

    getOriginZ(){
        return this.originZ;
    }

    /**
     * Позиция Y первого входного порта
     * @returns {number}
     */
    getFirstPortPositionY(){
        return -C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.front.headHeight - C.nodeMesh.header.height - C.nodeMesh.port.height/2;
    }

    /**
     * Позиция Y первого входного порта при минимальный высоте ноды
     * @returns {number}
     */
    getFirstPortPositionYMin(){
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
        let currentYPos = this.getFirstPortPositionY();
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
        let currentYPos = this.getFirstPortPositionYMin();
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
            mPort.position.set(positions[i].x, positions[i].y, positions[i].z);
        }
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
            this.changePseudoPortName(cPseudoPort);
            cPorts.push(cPseudoPort);
        }

        return cPorts;
    }

    scaleRightResizer(mesh) {
        mesh = mesh ? mesh : this.mesh.getObjectByName('rightResizer');
        mesh.scale.setY(Math.abs(this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2 -
            this.cPortsOutput.length * C.nodeMesh.port.height - C.nodeMesh.footer.height));
        mesh.position.set(this.nodeWidth, -C.nodeMesh.mount.roundCornerRadius - mesh.scale.y/2, mesh.position.z);
    }

    hoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = ThemeControl.theme.node.footer.label.hoverColor;
    }

    unhoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = ThemeControl.theme.node.footer.label.color;
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
        let mount;
        if(this.fullCollapse.isCollapsed){
            mount = this.mesh.getObjectByName('miniBackMount');
        } else {
            mount = this.mesh.getObjectByName('backBody');
        }
        mount.material.color.setStyle(ThemeControl.theme.node.mount.back.selectedColor);

        const title = this.mesh.getObjectByName('title');
        title.color = ThemeControl.theme.node.title.fontSelectedColor;
    }

    unselect(){
        this.selected = false;
        let mount;
        if(this.fullCollapse.isCollapsed){
            mount = this.mesh.getObjectByName('miniBackMount');
        } else {

            mount = this.mesh.getObjectByName('backBody');
        }
        mount.material.color.setStyle(ThemeControl.theme.node.mount.back.color);

        const title = this.mesh.getObjectByName('title');
        title.color = ThemeControl.theme.node.title.fontColor;
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
        if(!this.middleCollapse.isCollapsed) //COLLAPSE
        {
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
                cPseudoPortInput.animateMoving({y: this.getFirstPortPositionY()});
            }

            if(cPseudoPortOutput) {
                cPseudoPortOutput.removeLabelText();
                cPseudoPortOutput.showConnector();
                this.middleCollapse.storeCLinesOutput = [...cPseudoPortOutput.getCLines()];
                cPseudoPortOutput.animateMoving({y: this.getFirstPortPositionY()});
            }
            const allInputLines = [];
            for (let i = 0; i < this.cPortsInput.length; i += 1) {
                allInputLines.push(...this.cPortsInput[i].getCLines());
                if (this.cPortsInput[i].type === 'pseudo') continue;
                this.cPortsInput[i].animateHide();
            }
            if (cPseudoPortInput) cPseudoPortInput.setCLines(allInputLines);
            allInputLines.map((cLine) => {
                cLine.collapsedPort2();
            });

            const allOutputLines = [];
            for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                allOutputLines.push(...this.cPortsOutput[i].getCLines());

                if (this.cPortsOutput[i].type === 'pseudo') continue;
                this.cPortsOutput[i].animateHide();
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
        else //UNCOLLAPSE
        {
            this.middleCollapse.isCollapsed = false;

            const cPseudoPortInput = this.getPseudoPort('input');
            if (this.middleCollapse.isPseudoInputExist) {
                this.changePseudoPortName(cPseudoPortInput);
                if (!this.shortCollapse.inputPortsCollapsed) cPseudoPortInput.hideConnector();
                cPseudoPortInput.setCLines(this.middleCollapse.storeCLinesInput);
            } else {
                if(cPseudoPortInput){
                    this.mesh.remove(cPseudoPortInput.getMPort());
                }
            }

            const cPseudoPortOutput = this.getPseudoPort('output');
            if (this.middleCollapse.isPseudoOutputExist) {
                this.changePseudoPortName(cPseudoPortOutput);
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
                this.cPortsInput[i].addToNode(this.mesh);
                this.cPortsInput[i].animateShow();

                const cLines = this.cPortsInput[i].getCLines();
                cLines.map((cLine) => {
                    cLine.unCollapsedPort2();
                });
            }

            for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                if (this.cPortsOutput[i].type === 'pseudo') continue;
                this.cPortsOutput[i].addToNode(this.mesh);
                this.cPortsOutput[i].animateShow();

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

            if(cPseudoPortInput) {
                const positions = this.calcPositionsForInputPorts();
                cPseudoPortInput.animateMoving({y: positions[positions.length - 1].y});
            }

            if(cPseudoPortOutput) {
                const positions = this.calcPositionsForOutputPorts();
                cPseudoPortOutput.animateMoving({x: this.nodeWidth, y: positions[positions.length - 1].y});
            }
        }

        this.animateRefreshLines();
        this.scaleNodeWithAnimation();
        this.scaleBigMount();
        this.collapseButtonRotate();
    }

    changePseudoPortName(cPort) {
        if (cPort.direction === 'input') {
            if (this.shortCollapse.inputPortsCollapsed) {
                cPort.setCollapsedText(cPort.hidedCPorts.length);
            } else {
                cPort.setUncollapsedText();
            }
        } else if (cPort.direction === 'output') {
            if (this.shortCollapse.outputPortsCollapsed) {
                cPort.setCollapsedText(cPort.hidedCPorts.length);
            } else {
                cPort.setUncollapsedText();
            }
        }
    }

    fullCollapseNode(isNeedCollapse){
        /*
        Ниже система очередей, если анимация не завершена и поступила другая задача,
        то новая задача встаёт в очередь и выполняется после текущей
         */
        if(this.fullCollapse.state === 'inProcess'){
            this.fullCollapse.queue.push(isNeedCollapse);
        } else {
            let operationCount = 0;
            let waitCount = 0;
            const wait = () => {
                waitCount += 1;
                if (waitCount === operationCount) {
                    this.fullCollapse.state = 'done';
                    const queue = this.fullCollapse.queue;
                    for (let i = 0; i < queue.length; i += 1) {
                        if (queue[i] !== this.fullCollapse.isCollapsed) {
                            const value = queue[i];
                            queue.length = 0;
                            this.fullCollapseNode(value);
                            break;
                        } else {
                            queue.splice(0, 1);
                            i -= 1;
                        }
                    }
                }
            }

            if (isNeedCollapse) //COLLAPSE
            {
                if(this.fullCollapse.isCollapsed) return null;
                this.fullCollapse.state = 'inProcess';

                this.fullCollapse.isCollapsed = true;
                this.turnOffResizer();

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
                    cPseudoPortInput.animateMoving({y: -C.miniNodeMesh.height/2});
                }

                if (cPseudoPortOutput) {
                    cPseudoPortOutput.removeLabelText();
                    cPseudoPortOutput.showConnector();
                    this.fullCollapse.storeCLinesOutput = [...cPseudoPortOutput.getCLines()];
                    cPseudoPortOutput.animateMoving({x: C.miniNodeMesh.width, y: -C.miniNodeMesh.height/2});
                }

                const allInputLines = [];
                for (let i = 0; i < this.cPortsInput.length; i += 1) {
                    allInputLines.push(...this.cPortsInput[i].getCLines());
                    if (this.cPortsInput[i].type === 'pseudo') continue;
                    operationCount += 1;
                    this.cPortsInput[i].animateHide(()=>wait());
                }

                if (cPseudoPortInput) cPseudoPortInput.setCLines(allInputLines);
                allInputLines.map((cLine) => {
                    cLine.collapsedPort2();
                });

                const allOutputLines = [];
                for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                    allOutputLines.push(...this.cPortsOutput[i].getCLines());

                    if (this.cPortsOutput[i].type === 'pseudo') continue;
                    operationCount += 1;
                    this.cPortsOutput[i].animateHide(()=>wait());
                }

                if (cPseudoPortOutput) cPseudoPortOutput.setCLines(allOutputLines);
                allOutputLines.map((item) => {
                    item.collapsedPort1();
                });

                if (cPseudoPortInput) this.cPortsInput = [cPseudoPortInput];
                if (cPseudoPortOutput) this.cPortsOutput = [cPseudoPortOutput];

                this.showMenuButtons(false);
                operationCount += 2;
                this.switchOnMiniNode(()=>wait());
                this.scaleBigMount(C.miniNodeMesh.width, C.miniNodeMesh.height);
            }
            else  //UNCOLLAPSE
            {
                if(!this.fullCollapse.isCollapsed) return null;
                this.fullCollapse.state = 'inProcess';

                this.fullCollapse.isCollapsed = false;
                this.turnOnResizer();

                const cPseudoPortInput = this.getPseudoPort('input');
                if (this.fullCollapse.isPseudoInputExist) {
                    if(this.middleCollapse.isCollapsed){
                        cPseudoPortInput.removeLabelText();
                    } else {
                        //Анимация плавного появления текста, иначе видно, как он скачет сверху вниз
                        cPseudoPortInput.hideLabel();
                        this.changePseudoPortName(cPseudoPortInput);
                        operationCount += 1;
                        cPseudoPortInput.animateShowLabel(()=>wait());
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
                        //Анимация плавного появления текста, иначе видно, как он скачет сверху вниз
                        cPseudoPortOutput.hideLabel();
                        this.changePseudoPortName(cPseudoPortOutput);
                        operationCount += 1;
                        cPseudoPortOutput.animateShowLabel(()=>wait());
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
                    this.cPortsInput[i].addToNode(this.mesh);
                    operationCount += 1;
                    this.cPortsInput[i].animateShow( ()=>wait());
                    const cLines = this.cPortsInput[i].getCLines();
                    cLines.map((item) => {
                        item.unCollapsedPort2();
                    });
                }

                for (let i = 0; i < this.cPortsOutput.length; i += 1) {
                    if (this.cPortsOutput[i].type === 'pseudo') continue;
                    this.cPortsOutput[i].addToNode(this.mesh);
                    operationCount += 1;
                    this.cPortsOutput[i].animateShow( ()=>wait());

                    const cLines = this.cPortsOutput[i].getCLines();
                    cLines.map((item) => {
                        item.unCollapsedPort1();
                    });
                }

                this.fullCollapse.storeCPortsInput = [];
                this.fullCollapse.storeCPortsOutput = [];

                if(this.middleCollapse.isCollapsed){
                    this.calcNodeHeight(1);
                    if (cPseudoPortInput) cPseudoPortInput.animateMoving({y: this.getFirstPortPositionY()});
                    if (cPseudoPortOutput) cPseudoPortOutput.animateMoving({x: this.nodeWidth, y: this.getFirstPortPositionY()});
                } else {
                    this.calcNodeHeight();
                    if (cPseudoPortInput) {
                        const positions = this.calcPositionsForInputPorts();
                        cPseudoPortInput.animateMoving({y: positions[positions.length - 1].y});
                    }
                    if (cPseudoPortOutput) {
                        const positions = this.calcPositionsForOutputPorts();
                        cPseudoPortOutput.animateMoving({x: this.nodeWidth, y: positions[positions.length - 1].y});
                    }
                }

                this.showMenuButtons(true);
                operationCount += 2;
                this.switchOnRegularNode(()=>wait());
                this.scaleBigMount();
            }

            this.animateRefreshLines();
            this.collapseButtonRotate();
        }
    }

    switchOnMiniNode(callback){
        const mini = this.mesh.getObjectByName('miniMount');
        mini.visible = true;
        new FBS.tween.Tween(mini.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
            })
            .start();

        const regular = this.mesh.getObjectByName('regularMount');
        new FBS.tween.Tween(regular.scale)
            .to( {x: 0, y: 0, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
            })
            .start();

        const indicator = this.mesh.getObjectByName('indicator');
        indicator.position.set(C.miniNodeMesh.width/2, -C.miniNodeMesh.height/2, indicator.position.z);
        indicator.fontSize = C.miniNodeMesh.indicatorFontSize;
        indicator.color = ThemeControl.theme.node.indicator.miniFontColor;
        indicator.anchorX = 'center'; //TODO Изначально выставить правильно
        indicator.anchorY = 'middle';

        const title = this.mesh.getObjectByName('title');
        title.fontSize = C.miniNodeMesh.titleFontSize;
    }

    switchOnRegularNode(callback){
        const mini = this.mesh.getObjectByName('miniMount');
        new FBS.tween.Tween(mini.scale)
            .to( {x: 0, y: 0, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
                mini.visible = false;
            })
            .start();

        const regular = this.mesh.getObjectByName('regularMount');
        regular.visible = true;
        new FBS.tween.Tween(regular.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
            })
            .start();

        const indicator = this.mesh.getObjectByName('indicator');
        indicator.position.set(this.nodeWidth - C.nodeMesh.indicator.rightMargin, 0,  indicator.position.z);
        indicator.fontSize = C.nodeMesh.indicator.fontSize;
        indicator.color = ThemeControl.theme.node.indicator.fontColor;
        indicator.anchorX = 'right';
        indicator.anchorY = 'bottom';

        const title = this.mesh.getObjectByName('title');
        title.fontSize = C.nodeMesh.title.fontSize;
    }

    turnOnResizer(){
        const resizer = this.mesh.getObjectByName('rightResizer');
        resizer.visible = true;
    }

    turnOffResizer(){
        const resizer = this.mesh.getObjectByName('rightResizer');
        resizer.visible = false;
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
            new FBS.tween.Tween(mCollapse.rotation)
                .to( {z: angle}, C.animation.collapseButtonRotateTime )
                .easing( FBS.tween.Easing.Exponential.InOut )
                .start();
        }
    }

    /**
     * Animate refresh lines while node collapsing
     */
    animateRefreshLines(){
        new FBS.tween.Tween({x:0})
            .to( {x: 1}, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=> {
                FBS.lineControl.refreshLines([this.mesh]);
            })
            .start();
    }

    shortCollapsePorts(cPseudoPort){
        if(cPseudoPort.direction === 'input'){
            this.shortCollapseInputPorts(cPseudoPort, C.nodeMesh.constraints.maxVisiblePorts);
        } else {
            this.shortCollapseOutputPorts(cPseudoPort, C.nodeMesh.constraints.maxVisiblePorts);
        }
        this.scaleBigMount();
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
        this.scaleNodeWithAnimation();
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

        for(let i = 0; i < hidedCPorts.length; i += 1){
            const cLines = hidedCPorts[i].getCLines();
            cLines.map((item) => {item.collapsedPort2()});
            hidedCPorts[i].animateHide();
        }

        const positions = this.calcPositionsForOutputPorts();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            this.cPortsOutput[i].animateMoving({y: positions[i].y});
        }

        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.showConnector();
        cPseudoPort.animateMoving({y: positions[positions.length - 1].y});
    }

    unCollapseInputPorts(cPseudoPort){
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        for(let i = 0; i < hidedCPorts.length; i += 1){
            this.cPortsInput.push(hidedCPorts[i]);

            hidedCPorts[i].hide();
            hidedCPorts[i].addToNode(this.mesh);
            hidedCPorts[i].animateShow();
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
        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.hideConnector();
        this.calcNodeHeight();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            const positions = this.calcPositionsForOutputPorts();
            this.cPortsOutput[i].animateMoving({y: positions[i].y});
        }

        const positions = this.calcPositionsForInputPorts();
        cPseudoPort.animateMoving({y: positions[positions.length - 1].y});
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
        this.scaleNodeWithAnimation();
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

            hidedCPorts[i].animateHide();
        }

        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.showConnector();
        const positions = this.calcPositionsForOutputPorts();
        cPseudoPort.animateMoving({ x: this.nodeWidth, y: positions[positions.length - 1].y});
    }

    unCollapseOutputPorts(cPseudoPort){
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        for(let i = 0; i < hidedCPorts.length; i += 1){
            this.cPortsOutput.push(hidedCPorts[i]);
            hidedCPorts[i].hide();
            hidedCPorts[i].addToNode(this.mesh);
            hidedCPorts[i].animateShow();
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
        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.setHidedCPorts([]);
        cPseudoPort.hideConnector();
        this.calcNodeHeight();
        const positions = this.calcPositionsForOutputPorts();
        cPseudoPort.animateMoving({ x: this.nodeWidth, y: positions[positions.length - 1].y});
    }

    scaleNodeWithAnimation(){
        this.scaleRightResizer();

        const mBackMount = this.mesh.getObjectByName('backBody');
        new FBS.tween.Tween(mBackMount.scale)
            .to(
                {x: this.nodeWidth, y: this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2, z: 1},
                C.animation.nodeCollapseTime
            )
            .start();
        new FBS.tween.Tween(mBackMount.position)
            .to({y: -this.nodeHeight / 2}, C.animation.nodeCollapseTime)
            .start();

        const mFrontMount = this.mesh.getObjectByName('frontBody');
        new FBS.tween.Tween(mFrontMount.scale)
            .to(
                {
                    x: this.nodeWidth - C.nodeMesh.mount.borderSize * 2,
                    y: this.nodeHeight - C.nodeMesh.mount.roundCornerRadius  * 2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.footer.height,
                    z: 1
                },
                C.animation.nodeCollapseTime
            )
            .start();
        new FBS.tween.Tween(mFrontMount.position)
            .to({
                    y:-(this.nodeHeight - C.nodeMesh.mount.roundCornerRadius  * 2 - C.nodeMesh.mount.front.headHeight -
                    C.nodeMesh.footer.height)/2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.mount.roundCornerRadius +
                    C.nodeMesh.mount.borderSize
            },
                C.animation.nodeCollapseTime)
            .start();

        const mFrontFooter = this.mesh.getObjectByName('frontBottom');
        new FBS.tween.Tween(mFrontFooter.position)
            .to({ y: -this.nodeHeight + C.nodeMesh.mount.borderSize*2}, C.animation.nodeCollapseTime)
            .start();

        const mBackFooter = this.mesh.getObjectByName('backBottom');
        new FBS.tween.Tween(mBackFooter.position)
            .to({ y: -this.nodeHeight}, C.animation.nodeCollapseTime)
            .start();
    }

    scaleNode(){
        this.moveIndicator();
        this.moveOutputPorts();
        this.moveMenuButton();
        this.movePlayButton();
        this.scaleBigMount();
        this.scaleBackBody();
        this.scaleFrontBody();
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

    scaleBigMount(w, h){
        const mesh = this.mesh.getObjectByName('bigMount');
        mesh.scale.set(w ? w : this.nodeWidth, h ? h : this.nodeHeight, 1);
        mesh.updateWorldMatrix();
    }

    scaleBackBody(){
        const top = this.mesh.getObjectByName('backTop');
        const topBody = top.getObjectByName('backBodyTop');
        topBody.scale.set(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2, 1, 1);
        topBody.position.setX(this.nodeWidth/2);
        const topRightCorner = top.getObjectByName('backCornerTopRight');
        topRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius);

        const body = this.mesh.getObjectByName('backBody');
        body.scale.set( this.nodeWidth, this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2, 1);
        body.position.set(this.nodeWidth/2, -this.nodeHeight/2, body.position.z);

        const bottom = this.mesh.getObjectByName('backBottom');
        bottom.position.setY(-this.nodeHeight);
        const bottomBody = bottom.getObjectByName('backBodyBottom');
        bottomBody.scale.set(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2, 1, 1);
        bottomBody.position.setX(this.nodeWidth/2);
        const bottomRightCorner = bottom.getObjectByName('backCornerBottomRight');
        bottomRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius);
    }

    scaleFrontBody(){
        const top = this.mesh.getObjectByName('frontTop');
        const topBody = top.getObjectByName('frontBodyTop');
        topBody.scale.set(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2, 1, 1);
        topBody.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);
        const topRightCorner = top.getObjectByName('frontCornerTopRight');
        topRightCorner.position.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
        const header = top.getObjectByName('frontHeader');
        header.scale.setX(this.nodeWidth - C.nodeMesh.mount.borderSize * 2);
        header.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);

        const bodyHeight = this.nodeHeight - C.nodeMesh.mount.roundCornerRadius  * 2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.footer.height;
        const body = this.mesh.getObjectByName('frontBody');
        body.scale.set(this.nodeWidth - C.nodeMesh.mount.borderSize * 2, bodyHeight, 1);
        body.position.setY(-bodyHeight/2 - C.nodeMesh.mount.front.headHeight - C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.borderSize);
        body.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);

        const bottom = this.mesh.getObjectByName('frontBottom');
        bottom.position.setY(-this.nodeHeight + C.nodeMesh.mount.borderSize * 2);
        const frontFooter = bottom.getObjectByName('frontFooter');
        frontFooter.scale.setX(this.nodeWidth - C.nodeMesh.mount.borderSize * 2);
        frontFooter.position.set(
            this.nodeWidth/2 - C.nodeMesh.mount.borderSize,
            C.nodeMesh.footer.height/2 + C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize,
            frontFooter.position.z
        );
        const bottomBody = bottom.getObjectByName('frontBodyBottom');
        bottomBody.scale.setX(this.nodeWidth - C.nodeMesh.mount.roundCornerRadius * 2);
        bottomBody.position.setX(this.nodeWidth/2 - C.nodeMesh.mount.borderSize);
        const bottomRightCorner = bottom.getObjectByName('frontCornerBottomRight');
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
            m.color = ThemeControl.theme.node.title.fontColor;
            m.font = ThemeControl.theme.fontPaths.mainMedium;
        }

        m = this.mesh.getObjectByName('indicator');
        if(m){
            if(this.fullCollapse.isCollapsed){
                m.color = ThemeControl.theme.node.indicator.miniFontColor;
            } else {
                m.color = ThemeControl.theme.node.indicator.fontColor;
            }
            m.font = ThemeControl.theme.fontPaths.mainNormal;
        }

        m = this.mesh.getObjectByName('collapseButton');
        if(m) m.color = ThemeControl.theme.node.header.fontColor;

        m = this.mesh.getObjectByName('playButton');
        if(m) m.color = ThemeControl.theme.node.header.fontColor;

        m = this.mesh.getObjectByName('menuButton');
        if(m) m.color = ThemeControl.theme.node.header.fontColor;

        m = this.mesh.getObjectByName('frontHeader');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.front.headColor);


        m = this.mesh.getObjectByName('frontBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.front.bodyColor);


        m = this.mesh.getObjectByName('frontFooter');
        if(m) {
            if (this.fullCollapse.isCollapsed) {
                m.material.color.setStyle(ThemeControl.theme.node.mount.front.bodyColor);
            } else {
                m.material.color.setStyle(ThemeControl.theme.node.footer.color);
            }
        }

        m = this.mesh.getObjectByName('footerLabel');
        if(m) {
            m.color = ThemeControl.theme.node.footer.label.color;
            m.font = ThemeControl.theme.fontPaths.mainNormal;
        }


        m = this.mesh.getObjectByName('backBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.back.color);

        m = this.mesh.getObjectByName('miniBackMount');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.back.color);

        m = this.mesh.getObjectByName('miniFrontTop');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.front.headColor);

        m = this.mesh.getObjectByName('miniFrontBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.front.bodyColor);

        m = this.mesh.getObjectByName('miniFrontBottom');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.footer.color);

        m = this.mesh.getObjectByName('miniIndicatorMount');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.mount.front.headColor);

        m = this.mesh.getObjectByName('miniMenuButton');
        if(m) {
            m.color = ThemeControl.theme.node.header.fontColor;
        }

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