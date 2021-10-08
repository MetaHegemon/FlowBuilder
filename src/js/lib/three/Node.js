import * as THREE from "three";
import Port from './NodePort';
import PseudoPort from "./NodePseudoPort";
import C from "./../Constants";
import ThemeControl from '../../themes/ThemeControl';
import NodeAssets from '../three/NodeAssets';
import FBS from "../FlowBuilderStore";
import LineControl from "./LineControl";

export default class{
    constructor(data, originZ){
        this.data = data;                           //входные данные ноды
        this.originZ = originZ;                     //координата Z для ноды, выдаётся при создании
        this.selected = false;                      //флаг выбрана ли нода
        this.nodeHeight = 0;                        //высота ноды
        this.nodeWidth = C.nodeMesh.mount.width;    //ширина ноды
        this.middleCollapse = {                     //объект для контроля за средним сворачиванием ноды
            isCollapsed: false,
            isPseudoInputExist: false,
            isPseudoOutputExist: false,
            storeCPortsInput: [],
            storeCPortsOutput: [],
            storeCLinesInput: [],
            storeCLinesOutput: []
        };

        this.fullCollapse = {                       //объект для контроля за полным сворачиванием ноды
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

        this.shortCollapse = {                      //объект для контроля за сворачиванием портов
            inputPortsCollapsed: true,
            outputPortsCollapsed: true
        }
        this.allCPorts = [];                        //все порты ноды, кроме псевдопортов
        this.playing = false;                       //
        this.cPortsInput = [];                      //все видимые входные порты, включая псевдо-порт
        this.cPortsOutput = [];                     //все видимые выходные порты, включая псевдопорт

        this.mesh = this.create();                  //создание 3д-объекта ноды
        this.calcNodeHeight();                      //расчёт высоты ноды
        this.scaleNode();                           //расстановка элементов ноды в правильные позиции в соответствии с высотой и шириной
        this.setPositionsForInputPorts(this.calcPositionsForInputPorts());  //расстановка входных портов на свои позиции
        this.setPositionsForOutputPorts(this.calcPositionsForOutputPorts());//расстановка выходных портов на свои позиции
    }

    /**
     * Создание 3д-объекта ноды
     * @returns {Group}
     */
    create() {
        const nodeObject = new THREE.Group();
        nodeObject.name = 'node';

        //заголовок
        const title = NodeAssets.title.clone();
        title.text = this.data.name;
        nodeObject.add(title);

        //индикатор
        const indicator = NodeAssets.indicator.clone();
        indicator.text = this.data.indicator;
        nodeObject.add(indicator);

        //обычная подложка
        const regularShield = NodeAssets.getRegularShield({
            withCollapseButton: this.data.inputs.length > 1 || this.data.outputs.length > 1
        }).clone();
        nodeObject.add(regularShield);

        //мини-подложка
        nodeObject.add(NodeAssets.getMiniShield().clone());

        //большая подложка. используется для интерактивности ноды(выделение, перемещение и т.д.)
        nodeObject.add(NodeAssets.bigMount.clone());

        //входные порты
        const inputPorts = this.createInputPorts(this.data.inputs);
        this.allCPorts.push(...inputPorts);
        this.cPortsInput = this.packPortsWithPseudo(inputPorts, 'input', null);
        this.cPortsInput.map(p => nodeObject.add(p.getMPort()));

        //выходные порты
        const outputPorts = this.createOutputPorts(this.data.outputs);
        this.allCPorts.push(...outputPorts);
        this.cPortsOutput = this.packPortsWithPseudo( outputPorts, 'output');
        this.cPortsOutput.map(p => nodeObject.add(p.getMPort()));

        nodeObject.position.set(this.data.position.x, this.data.position.y, this.originZ);

        //закрепляем за каждым дочерним объектом класс ноды, что бы из сцены получить к нему доступ
        nodeObject.traverse(o => o.userData.nodeClass = this);

        return nodeObject;
    }

    /**
     * Создание входных портов
     * @param inputs {Array}
     * @returns {*[]}
     */
    createInputPorts(inputs) {
        const cPorts = [];
        inputs.map((i)=> cPorts.push(new Port('input', i, this)));

        return cPorts;
    }

    /**
     * Создание выходных портов
     * @param outputs {Array}- входные данные выходных портов
     * @returns {*[]} -
     */
    createOutputPorts (outputs){
        let cPorts = [];
        outputs.map((o)=> cPorts.push(new Port('output', o, this)));

        return cPorts;
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

    /**
     * Упаковка портов вместе с псевдо-портом. Лишние порты скрываются и закрепляются за псевдо-портом.
     * Псевдопорт добавляется к общему списку видимых портов
     * @param cPorts {Array}
     * @param direction {String}
     * @param cPseudoPort {Class}
     * @returns {Array}
     */
    packPortsWithPseudo(cPorts, direction, cPseudoPort){
        const portsForHide = [];
        const maxVisiblePorts = C.nodeMesh.constraints.maxVisiblePorts;
        //определение списка портов для скрытия
        for(let i = maxVisiblePorts - 1; i < cPorts.length; i += 1){
            portsForHide.push(cPorts[i]);
        }
        if(portsForHide.length > 1){
            //оставляем порты для показа
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
            //скрытые порты присваиваются псевдо порту и хранятся там, пока порты не будут развёрнуты
            cPseudoPort.setHidedCPorts(portsForHide);
            this.changePseudoPortName(cPseudoPort);
            cPorts.push(cPseudoPort);
        }
        return cPorts;
    }

    /**
     * Изменение и перемещение ресайзера, при изменении размеров ноды
     * @param mesh {THREE.Mesh}
     */
    scaleRightResizer(mesh) {
        mesh = mesh ? mesh : this.mesh.getObjectByName('rightResizer');
        mesh.scale.setY(Math.abs(this.nodeHeight - C.nodeMesh.mount.roundCornerRadius * 2 -
            this.cPortsOutput.length * C.nodeMesh.port.height - C.nodeMesh.footer.height));
        mesh.position.set(this.nodeWidth, -C.nodeMesh.mount.roundCornerRadius - mesh.scale.y/2, mesh.position.z);
    }

    /**
     * Подсветка при наведении на подпись подвала
     */
    hoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = ThemeControl.theme.node.footer.label.hoverColor;
    }

    /**
     * Снятие подсветки при наведении на подпись подвала
     */
    unhoverFooterLabel(){
        const footerLabel = this.mesh.getObjectByName('footerLabel');
        footerLabel.color = ThemeControl.theme.node.footer.label.color;
    }

    /**
     * Обработка нажатия кнопки play
     * @param mPlay {Text}
     */
    play(mPlay){
        if(this.playing){
            this.playing = false;
            mPlay.text = '';
        } else {
            this.playing = true;
            mPlay.text = '';
        }
    }

    /**
     * Выбрана ли нода
     * @returns {boolean|*}
     */
    isSelected(){
        return this.selected;
    }

    /**
     * Выделение ноды на сцене
     */
    select(){
        this.selected = true;
        let mount;
        //при полном схлопывании нода имеет другую подложки
        if(this.fullCollapse.isCollapsed){
            mount = this.mesh.getObjectByName('miniBackMount');
        } else {
            mount = this.mesh.getObjectByName('backBody');
        }
        mount.material.color.setStyle(ThemeControl.theme.node.mount.back.selectedColor);

        const title = this.mesh.getObjectByName('title');
        title.color = ThemeControl.theme.node.title.fontSelectedColor;
    }

    /**
     * Снятие выделения ноды на сцене
     */
    unselect(){
        this.selected = false;
        let mount;
        //при полном схлопывании нода имеет другую подложки
        if(this.fullCollapse.isCollapsed){
            mount = this.mesh.getObjectByName('miniBackMount');
        } else {
            mount = this.mesh.getObjectByName('backBody');
        }
        mount.material.color.setStyle(ThemeControl.theme.node.mount.back.color);

        const title = this.mesh.getObjectByName('title');
        title.color = ThemeControl.theme.node.title.fontColor;
    }

    /**
     * @returns {Group} 3д объект ноды
     */
    getMNode(){
        return this.mesh;
    }

    /**
     * Поиск существующего и видимого на ноде псевдо-порта
     * @param type {string} input, output
     * @returns {Class} NodePort
     */
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

    /**
     * Частичное схлопывание ноды в результате остаются видны 1 порт слева, 1 порт справа, кнопки управления и подвал
     */
    middleCollapseNode(){
        if(!this.middleCollapse.isCollapsed) //COLLAPSE
        {
            this.middleCollapse.isCollapsed = true;
            //сохранение состояния портов
            this.middleCollapse.storeCPortsInput = [...this.cPortsInput];
            this.middleCollapse.storeCPortsOutput = [...this.cPortsOutput];
            //получение псевдо-портов
            let cPseudoPortInput = this.getPseudoPort('input');
            let cPseudoPortOutput = this.getPseudoPort('output');
            //сохранение наличия портов перед схдопыванием
            this.middleCollapse.isPseudoInputExist = !!cPseudoPortInput;
            this.middleCollapse.isPseudoOutputExist = !!cPseudoPortOutput;
            //Создание входного псевдо порта, если его нет и есть порты, которые надо им объеденить
            if (!cPseudoPortInput && this.cPortsInput.length > 0) {
                cPseudoPortInput = new PseudoPort('input', this);
                //надпись нужно удалить сразу, что бы было красиво
                cPseudoPortInput.hideLabel();
                const position = this.calcPositionsForInputPorts();
                cPseudoPortInput.moving(position[0]);
                cPseudoPortInput.addToNode(this.mesh);
            }
            //Создание выходного псевдо порта, если его нет  и есть порты, которые надо им объеденить
            if (!cPseudoPortOutput && this.cPortsOutput.length > 0) {
                cPseudoPortOutput = new PseudoPort('output', this);
                //надпись нужно удалить сразу, что бы было красиво
                cPseudoPortOutput.hideLabel();
                const position = this.calcPositionsForOutputPorts();
                cPseudoPortOutput.moving(position[position.length - 1]);
                cPseudoPortOutput.addToNode(this.mesh);
            }

            if(cPseudoPortInput) {
                cPseudoPortInput.hideLabel();
                cPseudoPortInput.showConnector();
                //сохранение всех входящих линий с псевдо-порт, что бы потом их восстановить
                this.middleCollapse.storeCLinesInput = [...cPseudoPortInput.getCLines()];
                cPseudoPortInput.animateMoving({y: this.getFirstPortPositionY()});
            }

            if(cPseudoPortOutput) {
                cPseudoPortOutput.hideLabel();
                cPseudoPortOutput.showConnector();
                //сохранение всех входящих линий с псевдо-порт, что бы потом их восстановить
                this.middleCollapse.storeCLinesOutput = [...cPseudoPortOutput.getCLines()];
                cPseudoPortOutput.animateMoving({y: this.getFirstPortPositionY()});
            }

            //анимация скрытия входных портов//TODO replace pseudo
            this.cPortsInput.map(p=>p.type !== 'pseudo' ? p.animateHide() : void null);

            //переключение всех входных линий на псевдо-порт
            const allInputLines = [];
            this.cPortsInput.map(p => allInputLines.push(...p.getCLines()));
            if (cPseudoPortInput) cPseudoPortInput.setCLines(allInputLines);
            //для всех линий отмечается, что входной порт сколлапсирован
            allInputLines.map(cLine => cLine.collapsedPort2());

            //анимация скрытия выходных портов //TODO replace pseudo
            this.cPortsOutput.map(p=>p.type !== 'pseudo' ? p.animateHide() : void null);

            //переключение всех выходных линий на псевдо-порт
            const allOutputLines = [];
            this.cPortsOutput.map(p => allOutputLines.push(...p.getCLines()));
            if (cPseudoPortOutput) cPseudoPortOutput.setCLines(allOutputLines);
            allOutputLines.map((cLine) => {
                //для всех линий отмечается, что входной порт сколлапсирован
                cLine.collapsedPort1();
                //Для входных портов на другом конце линии коннектор делается неактивным
                const cPort2 = cLine.getCPort2();
                cPort2.setConnectorInactive();
            });

            //единственными портами ноды становятся 1 входной и 1 выходной
            if (cPseudoPortInput) this.cPortsInput = [cPseudoPortInput];
            if (cPseudoPortOutput) this.cPortsOutput = [cPseudoPortOutput];

            this.calcNodeHeight(1);
        }
        else //UNCOLLAPSE
        {
            this.middleCollapse.isCollapsed = false;

            const cPseudoPortInput = this.getPseudoPort('input');

            if (this.middleCollapse.isPseudoInputExist) {
                //входной псевдо-порт существовал на ноде, возвращается ему имя
                cPseudoPortInput.hideLabel();
                this.changePseudoPortName(cPseudoPortInput);
                cPseudoPortInput.animateShowLabel();
                //this.changePseudoPortName(cPseudoPortInput);
                if (!this.shortCollapse.inputPortsCollapsed) cPseudoPortInput.hideConnector();
                //псевдо-порту возвращаются его линии
                cPseudoPortInput.setCLines(this.middleCollapse.storeCLinesInput);
            } else {
                //входного псевдо-порта не существовало, текущий порт удаляется
                if(cPseudoPortInput) this.mesh.remove(cPseudoPortInput.getMPort());
            }

            const cPseudoPortOutput = this.getPseudoPort('output');
            if (this.middleCollapse.isPseudoOutputExist) {
                //выходной псевдо-порт существовал на ноде, возвращается ему имя
                cPseudoPortOutput.hideLabel();
                this.changePseudoPortName(cPseudoPortOutput);
                cPseudoPortOutput.animateShowLabel();
                if (!this.shortCollapse.outputPortsCollapsed) cPseudoPortOutput.hideConnector();
                //возвращаются линии
                cPseudoPortOutput.setCLines(this.middleCollapse.storeCLinesOutput);
            }else {
                //выходного псевдо-порта не существовало, текущий порт удаляется
                if(cPseudoPortOutput) this.mesh.remove(cPseudoPortOutput.getMPort());
            }

            //восстановление состояния портов до коллапса
            this.cPortsInput = [...this.middleCollapse.storeCPortsInput];
            this.cPortsOutput = [...this.middleCollapse.storeCPortsOutput];

            //очищение хранилища линий
            this.middleCollapse.storeCLinesInput = [];
            this.middleCollapse.storeCLinesOutput = [];

            this.cPortsInput.map(p=>{
                if (p.type !== 'pseudo') {
                    //анимированный возврат портов в сцену
                    p.addToNode(this.mesh);
                    p.animateShow();

                    const cLines = p.getCLines();
                    //отмечаем на линии, что входной порт больше не сколлапсирован
                    cLines.map((cLine) => cLine.unCollapsedPort2());
                }
            });

            this.cPortsOutput.map(p => {
                if (p.type !== 'pseudo') {
                    //анимированный возврат портов в сцену
                    p.addToNode(this.mesh);
                    p.animateShow();

                    const cLines = p.getCLines();
                    cLines.map((cLine) => {
                        //отмечаем на линии, что входной порт больше не сколлапсирован
                        cLine.unCollapsedPort1();
                        // для входных портов на другом конце линии коннектор делается активным
                        const cPort2 = cLine.getCPort2();
                        cPort2.setConnectorActive();
                    });
                }
            });

            //очищение хранилища портов
            this.middleCollapse.storeCPortsInput = [];
            this.middleCollapse.storeCPortsOutput = [];

            //считаем высоту ноды, что впоследствии правильно рассчитать позицию псевдо-портов
            this.calcNodeHeight();

            //анимированный возврат псевдо-портов на свои места
            if(cPseudoPortInput) {
                const position = this.calcPositionsForInputPorts();
                cPseudoPortInput.animateMoving({y: position[position.length - 1].y});
            }

            if(cPseudoPortOutput) {
                const position = this.calcPositionsForOutputPorts();
                cPseudoPortOutput.animateMoving({x: this.nodeWidth, y: position[position.length - 1].y});
            }
        }

        this.animateRefreshLines();
        this.scaleNodeWithAnimation();
        this.scaleBigMount();
        this.animateButtonRotate();
    }

    /**
     * Изменение имени псевдо-порта в соответствии с состоянием ноды
     * @param cPort
     */
    changePseudoPortName(cPort) {
        if (cPort.direction === 'input') {
            if (this.shortCollapse.inputPortsCollapsed) {
                cPort.setCollapsedText();
            } else {
                cPort.setUncollapsedText();
            }
        } else if (cPort.direction === 'output') {
            if (this.shortCollapse.outputPortsCollapsed) {
                cPort.setCollapsedText();
            } else {
                cPort.setUncollapsedText();
            }
        }
    }

    /**
     * Полное схлопывание ноды
     * @param isNeedCollapse {boolean}
     * @returns {null}
     */
    fullCollapseNode(isNeedCollapse){
        //Ниже система очередей, если анимация не завершена и поступила другая задача,
        //то новая задача встаёт в очередь и выполняется после текущей
        if(this.fullCollapse.state === 'inProcess'){
            this.fullCollapse.queue.push(isNeedCollapse);
        } else {
            let operationCount = 0;
            let waitCount = 0;
            //метод ожидания звершения всех анимаций
            const wait = () => {
                waitCount += 1;
                //ожидание завершения всех анимаций
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
                //на маленькой ноде ресайзер не используется
                this.turnOffResizer();

                //сохранение состояния портов
                this.fullCollapse.storeCPortsInput = [...this.cPortsInput];
                this.fullCollapse.storeCPortsOutput = [...this.cPortsOutput];

                let cPseudoPortInput = this.getPseudoPort('input');
                let cPseudoPortOutput = this.getPseudoPort('output');
                //сохранение наличия псевдо-портов ноды
                this.fullCollapse.isPseudoInputExist = !!cPseudoPortInput;
                this.fullCollapse.isPseudoOutputExist = !!cPseudoPortOutput;
                //Создание входного псевдо порта, если его нет и есть порты, которые надо им объеденить
                if (!cPseudoPortInput && this.cPortsInput.length > 0) {
                    cPseudoPortInput = new PseudoPort('input', this);
                    //надпись нужно удалить сразу, что бы было красиво
                    cPseudoPortInput.hideLabel();
                    const position = this.calcPositionsForInputPortsMin();
                    cPseudoPortInput.moving(position[0]);
                    cPseudoPortInput.addToNode(this.mesh);
                }
                //Создание выходного псевдо порта, если его нет и есть порты, которые надо им объеденить
                if (!cPseudoPortOutput && this.cPortsOutput.length > 0) {
                    cPseudoPortOutput = new PseudoPort('output', this);
                    //надпись нужно удалить сразу, что бы было красиво
                    cPseudoPortOutput.hideLabel();
                    const position = this.calcPositionsForOutputPortsMin();
                    cPseudoPortOutput.moving(position[position.length - 1]);
                    cPseudoPortOutput.addToNode(this.mesh);
                }

                if (cPseudoPortInput) {
                    cPseudoPortInput.hideLabel();
                    cPseudoPortInput.showConnector();
                    //сохранение всех входящих линий с псевдо-порт, что бы потом их восстановить
                    this.fullCollapse.storeCLinesInput = [...cPseudoPortInput.getCLines()];
                    cPseudoPortInput.animateMoving({y: -C.miniNodeMesh.height/2});
                }

                if (cPseudoPortOutput) {
                    cPseudoPortOutput.hideLabel();
                    cPseudoPortOutput.showConnector();
                    //сохранение всех входящих линий с псевдо-порт, что бы потом их восстановить
                    this.fullCollapse.storeCLinesOutput = [...cPseudoPortOutput.getCLines()];
                    cPseudoPortOutput.animateMoving({x: C.miniNodeMesh.width, y: -C.miniNodeMesh.height/2});
                }

                //анимация скрытия входных портов
                this.cPortsInput.map(p=>{
                    if(p.type !== 'pseudo') {
                        operationCount += 1;
                        p.animateHide(() => wait());
                    }
                });

                //переключение всех входных линий на псевдо-порт
                const allInputLines = [];
                this.cPortsInput.map(p => allInputLines.push(...p.getCLines()));
                if (cPseudoPortInput) cPseudoPortInput.setCLines(allInputLines);
                //для всех линий отмечается, что входной порт сколлапсирован
                allInputLines.map(cLine => cLine.collapsedPort2());

                //анимация скрытия выходных портов
                this.cPortsOutput.map(p=>{
                    if(p.type !== 'pseudo') {//TODO replace pseudo
                        operationCount += 1;
                        p.animateHide(() => wait());
                    }
                });

                const allOutputLines = [];
                this.cPortsOutput.map(p => allOutputLines.push(...p.getCLines()));
                if (cPseudoPortOutput) cPseudoPortOutput.setCLines(allOutputLines);
                //для всех линий отмечается, что входной порт сколлапсирован
                allOutputLines.map(item => item.collapsedPort1());

                //единственными портами ноды становятся 1 входной и 1 выходной
                if (cPseudoPortInput) this.cPortsInput = [cPseudoPortInput];
                if (cPseudoPortOutput) this.cPortsOutput = [cPseudoPortOutput];

                this.showMenuButtons(false);
                //переключение с большой ноды на маленькую осуществляется 2-я анимациями
                operationCount += 2;
                this.switchOnMiniMount(()=>wait());
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
                        //при среднем схлопывании у псевдо-портов нет подписи
                        cPseudoPortInput.hideLabel();
                    } else {
                        //Анимация плавного появления текста, иначе видно как он скачет сверху вниз
                        cPseudoPortInput.hideLabel();
                        this.changePseudoPortName(cPseudoPortInput);
                        operationCount += 1;
                        cPseudoPortInput.animateShowLabel(()=>wait());
                    }
                    if (!this.shortCollapse.inputPortsCollapsed) cPseudoPortInput.hideConnector();
                    //псевдо-порту возвращаются его линии
                    cPseudoPortInput.setCLines(this.fullCollapse.storeCLinesInput);
                } else {
                    //входного псевдо-порта не существовало, текущий порт удаляется
                    if (cPseudoPortInput) this.mesh.remove(cPseudoPortInput.getMPort());
                }

                const cPseudoPortOutput = this.getPseudoPort('output');
                if (this.fullCollapse.isPseudoOutputExist) {
                    if(this.middleCollapse.isCollapsed){
                        //при среднем схлопывании у псевдо-портов нет подписи
                        cPseudoPortOutput.hideLabel();
                    } else {
                        //Анимация плавного появления текста, иначе видно, как он скачет сверху вниз
                        cPseudoPortOutput.hideLabel();
                        this.changePseudoPortName(cPseudoPortOutput);
                        operationCount += 1;
                        cPseudoPortOutput.animateShowLabel(()=>wait());
                    }
                    if (!this.shortCollapse.outputPortsCollapsed) cPseudoPortOutput.hideConnector();
                    //псевдо-порту возвращаются его линии
                    cPseudoPortOutput.setCLines(this.fullCollapse.storeCLinesOutput);
                } else {
                    //входного псевдо-порта не существовало, текущий порт удаляется
                    if (cPseudoPortOutput) this.mesh.remove(cPseudoPortOutput.getMPort());

                }
                //восстановление состояния портов до коллапса
                this.cPortsInput = [...this.fullCollapse.storeCPortsInput];
                this.cPortsOutput = [...this.fullCollapse.storeCPortsOutput];

                //очищение хранилища линий
                this.fullCollapse.storeCLinesInput = [];
                this.fullCollapse.storeCLinesOutput = [];

                this.cPortsInput.map(p=>{
                    if (p.type !== 'pseudo') {
                        //анимированный возврат портов в сцену
                        p.addToNode(this.mesh);
                        operationCount += 1;
                        p.animateShow( ()=>wait());

                        const cLines = p.getCLines();
                        //отмечаем на линии, что входной порт больше не сколлапсирован
                        cLines.map((cLine) => cLine.unCollapsedPort2());
                    }
                });

                this.cPortsOutput.map(p => {
                    if (p.type !== 'pseudo') {
                        //анимированный возврат портов в сцену
                        p.addToNode(this.mesh);
                        operationCount += 1;
                        p.animateShow( ()=>wait());

                        const cLines = p.getCLines();
                        //отмечаем на линии, что входной порт больше не сколлапсирован
                        cLines.map(cLine => cLine.unCollapsedPort1());
                    }
                });

                //очищение хранилища портов
                this.fullCollapse.storeCPortsInput = [];
                this.fullCollapse.storeCPortsOutput = [];

                //анимированный возврат псевдо-портов на свои места
                if(this.middleCollapse.isCollapsed){
                    this.calcNodeHeight(1);
                    if (cPseudoPortInput) cPseudoPortInput.animateMoving({y: this.getFirstPortPositionY()});
                    if (cPseudoPortOutput) cPseudoPortOutput.animateMoving({x: this.nodeWidth, y: this.getFirstPortPositionY()});
                } else {
                    //считаем высоту ноды, что впоследствии правильно рассчитать позицию псевдо-портов
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
                //переключение с маленькой ноды на большую осуществляется 2-я анимациями
                operationCount += 2;
                this.switchOnRegularNode(()=>wait());
                this.scaleBigMount();
            }

            this.animateRefreshLines();
            this.animateButtonRotate();
        }
    }

    /**
     * Переключение с большой подложки к маленькой
     * @param callback
     */
    switchOnMiniMount(callback){
        //разворот маленькой ноды
        const mini = this.mesh.getObjectByName('miniMount');
        mini.visible = true;
        new FBS.tween.Tween(mini.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
            })
            .start();
        //схлопывание большой ноды
        const regular = this.mesh.getObjectByName('regularMount');
        new FBS.tween.Tween(regular.scale)
            .to( {x: 0, y: 0, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
            })
            .start();

        //перемещение индикатора в центр
        const indicator = this.mesh.getObjectByName('indicator');
        indicator.position.set(C.miniNodeMesh.width/2, -C.miniNodeMesh.height/2, indicator.position.z);
        indicator.fontSize = C.miniNodeMesh.indicatorFontSize;
        indicator.color = ThemeControl.theme.node.indicator.miniFontColor;
        indicator.anchorX = 'center'; //TODO Изначально выставить правильно
        indicator.anchorY = 'middle';

        //изменение размера шрифта для заголовка
        const title = this.mesh.getObjectByName('title');
        title.fontSize = C.miniNodeMesh.titleFontSize;
    }

    /**
     * Переключение с маленькой подложки на большую
     * @param callback
     */
    switchOnRegularNode(callback){
        //схлопывание маленькой подложки
        const mini = this.mesh.getObjectByName('miniMount');
        new FBS.tween.Tween(mini.scale)
            .to( {x: 0, y: 0, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
                mini.visible = false;
            })
            .start();

        //разворот большой подложки
        const regular = this.mesh.getObjectByName('regularMount');
        regular.visible = true;
        new FBS.tween.Tween(regular.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.nodeCollapseTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback();
            })
            .start();

        //смещение индикатора в правый верхний угол
        const indicator = this.mesh.getObjectByName('indicator');
        indicator.position.set(this.nodeWidth - C.nodeMesh.indicator.rightMargin, 0,  indicator.position.z);
        indicator.fontSize = C.nodeMesh.indicator.fontSize;
        indicator.color = ThemeControl.theme.node.indicator.fontColor;
        indicator.anchorX = 'right';
        indicator.anchorY = 'bottom';

        //изменение размера шрифта для заголовка
        const title = this.mesh.getObjectByName('title');
        title.fontSize = C.nodeMesh.title.fontSize;
    }

    /**
     * Включение активности ресайзера на сцене
     */
    turnOnResizer(){
        const resizer = this.mesh.getObjectByName('rightResizer');
        resizer.visible = true;
    }

    /**
     * выключение активности ресайзера на сцене
     */
    turnOffResizer(){
        const resizer = this.mesh.getObjectByName('rightResizer');
        resizer.visible = false;
    }

    /**
     * Показ/скрытие кнопок управления
     * @param show {Boolean}
     */
    showMenuButtons(show) {
        const mCollapseButton = this.mesh.getObjectByName('collapseButton');
        if(mCollapseButton) mCollapseButton.visible = show;
        const mPlayButton = this.mesh.getObjectByName('playButton');
        if(mPlayButton) mPlayButton.visible = show;
        const mMenuButton = this.mesh.getObjectByName('menuButton');
        if(mMenuButton) mMenuButton.visible = show;
    }

    /**
     * Анимация вращения кнопки среднего схлопывания
     */
    animateButtonRotate() {
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
     * Анимация обновления линий при анимации схлопывания ноды
     */
    animateRefreshLines(){
        new FBS.tween.Tween({x:0})
            .to( {x: 1}, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=> {
                LineControl.refreshLines([this.mesh]);
            })
            .start();
    }

    /**
     * Схлопывание/разворачивание портов, через нажатие на псевдо-порт
     * @param cPseudoPort {Class}
     */
    shortCollapsePorts(cPseudoPort){
        if(cPseudoPort.direction === 'input'){
            this.shortCollapseInputPorts(cPseudoPort);
        } else {
            this.shortCollapseOutputPorts(cPseudoPort);
        }
        this.scaleBigMount();
    }

    /**
     * Схлопывание/разворачивание входящих портов
     * @param cPseudoPort {Class}
     */
    shortCollapseInputPorts(cPseudoPort){
        if(!this.shortCollapse.inputPortsCollapsed){ //схлопывание
            this.shortCollapse.inputPortsCollapsed = true;
            this.collapseInputPorts(cPseudoPort);
        } else { //разворот
            this.shortCollapse.inputPortsCollapsed = false;
            this.unCollapseInputPorts(cPseudoPort);
        }

        const positions = this.calcPositionsForInputPorts();
        //удаление последней позиции для порта, т.к. псевдо-порт будет перемещён анимацией
        positions.length = positions.length - 1;
        this.setPositionsForInputPorts(positions);
        this.scaleNodeWithAnimation();
    }

    /**
     * Схлопывание входных портов
     * @param cPseudoPort {Class}
     */
    collapseInputPorts(cPseudoPort){
        //удаление псевдо-порта из списка входных
        for(let i = 0; i < this.cPortsInput.length; i += 1){
            if(this.cPortsInput[i] === cPseudoPort) {
                this.cPortsInput.splice(i, 1);
                break;
            }
        }
        //составляем новый список видимых портов вместе с псевдо-портом
        this.cPortsInput = this.packPortsWithPseudo(this.cPortsInput, 'input', cPseudoPort);
        //считаем высоту ноды, что бы потом правильно рассчитать позиции портов
        this.calcNodeHeight();

        //анимация скрытия портов
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        hidedCPorts.map(p => p.animateHide());

        hidedCPorts.map(p => {
            const cLines = p.getCLines();
            //устанавливаем отметку на линии, что второй порт сколлапсирован
            cLines.map(l => l.collapsedPort2());
        });

        //расстановка портов по местам
        const positionOut = this.calcPositionsForOutputPorts();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            this.cPortsOutput[i].animateMoving({y: positionOut[i].y});
        }

        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.showConnector();
        const positionIn = this.calcPositionsForInputPorts();
        cPseudoPort.animateMoving({y: positionIn[positionIn.length - 1].y});
    }

    /**
     * Разворачивание входных портов
     * @param cPseudoPort {Class}
     */
    unCollapseInputPorts(cPseudoPort){
        const hidedCPorts = cPseudoPort.getHidedCPorts();

        hidedCPorts.map(p => {
            //включение скрытых портов в общий список видимых
            this.cPortsInput.push(p);
            //анимация появления портов
            p.hide();
            p.addToNode(this.mesh);
            p.animateShow();
        });

        for(let i = 0; i < this.cPortsInput.length; i += 1){
            if(this.cPortsInput[i] === cPseudoPort){
                this.cPortsInput.splice(i, 1);
                break;
            }
        }

        this.cPortsInput.map(p => {
            const cLines = p.getCLines();
            //устанавливаем отметку на линии, что второй порт развёрнут
            cLines.map(l => l.unCollapsedPort2());
        });

        this.cPortsInput.push(cPseudoPort);
        cPseudoPort.setHidedCPorts([]);
        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.hideConnector();
        //рассчитываем высоту ноды, что правильно рассчитать позиции портов
        this.calcNodeHeight();
        //расстановка портов на позиции
        const positionOut = this.calcPositionsForOutputPorts();
        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            this.cPortsOutput[i].animateMoving({y: positionOut[i].y});
        }

        //this.cPortsOutput.map(p => p.animateMoving({y: positionOut[i].y}));

        const positionIn = this.calcPositionsForInputPorts();
        cPseudoPort.animateMoving({y: positionIn[positionIn.length - 1].y});
    }

    /**
     * Схлопывание/разворачивание выходящих портов
     * @param cPseudoPort {Class}
     */
    shortCollapseOutputPorts(cPseudoPort){
        if(!this.shortCollapse.outputPortsCollapsed){ //сворачивание
            this.shortCollapse.outputPortsCollapsed = true;
            this.collapseOutputPorts(cPseudoPort);
        } else { //разворот
            this.shortCollapse.outputPortsCollapsed = false;
            this.unCollapseOutputPorts(cPseudoPort);
        }

        const position = this.calcPositionsForOutputPorts();
        //удаление последней позиции для порта, т.к. псевдо-порт будет перемещён анимацией
        position.length = position.length - 1;

        this.setPositionsForOutputPorts(position);
        this.scaleNodeWithAnimation();
    }

    /**
     * Схлопывание выходных портов
     * @param cPseudoPort {Class}
     */
    collapseOutputPorts(cPseudoPort) {
        //удаление псевдо-порта из списка входных
        for (let i = 0; i < this.cPortsOutput.length; i += 1) {
            if (this.cPortsOutput[i] === cPseudoPort) {
                this.cPortsOutput.splice(i, 1);
                break;
            }
        }
        //составляем новый список видимых портов вместе с псевдо-портом
        this.cPortsOutput = this.packPortsWithPseudo(this.cPortsOutput, 'output', cPseudoPort);

        //считаем высоту ноды, что бы потом правильно рассчитать позиции портов
        this.calcNodeHeight();

        //анимация скрытия портов
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        hidedCPorts.map(p => p.animateHide());

        hidedCPorts.map(p => {
            const cLines = p.getCLines();
            //устанавливаем отметку на линии, что первый порт сколлапсирован
            cLines.map(l => {
                l.collapsedPort1();

                //для входных портов на другом конце линии коннектор делается неактивным
                if (!l.isPort2Collapsed) {
                    const cPort2 = l.getCPort2();
                    cPort2.setConnectorInactive();
                }
            });
        });

        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.showConnector();
        //расстановка портов по местам
        const positions = this.calcPositionsForOutputPorts();
        cPseudoPort.animateMoving({x: this.nodeWidth, y: positions[positions.length - 1].y});
    }

    /**
     * Разворачивание выходных портов
     * @param cPseudoPort {Class}
     */
    unCollapseOutputPorts(cPseudoPort){
        const hidedCPorts = cPseudoPort.getHidedCPorts();
        hidedCPorts.map(p => {
            //включение скрытых портов в общий список видимых
            this.cPortsOutput.push(p);
            //анимация появления портов
            p.hide();
            p.addToNode(this.mesh);
            p.animateShow();
        });

        for(let i = 0; i < this.cPortsOutput.length; i += 1){
            if(this.cPortsOutput[i] === cPseudoPort){
                this.cPortsOutput.splice(i, 1);
                break;
            }
        }

        this.cPortsInput.map(p => {
            const cLines = p.getCLines();
            //устанавливаем отметку на линии, что второй порт развёрнут
            cLines.map(l => {
                l.unCollapsedPort1();

                //для входных портов на другом конце линии коннектор делается активным
                if(!l.isPort2Collapsed) {
                    const cPort2 = cLine.getCPort2();
                    cPort2.setConnectorActive();
                }
            });
        });

        this.cPortsOutput.push(cPseudoPort);
        this.changePseudoPortName(cPseudoPort);
        cPseudoPort.setHidedCPorts([]);
        cPseudoPort.hideConnector();
        //рассчитываем высоту ноды, что правильно рассчитать позиции портов
        this.calcNodeHeight();
        //расстановка портов на позиции
        const position = this.calcPositionsForOutputPorts();
        cPseudoPort.animateMoving({ x: this.nodeWidth, y: position[position.length - 1].y});
    }

    /**
     * Изменение размера ноды по высоте, при неполном схлопывании
     */
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

    /**
     * Изменение размеров и перемещение элементов ноды без анимации
     */
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

    /**
     * Задание ширины ноды
     * @param width {number}
     */
    setNodeWidth(width){
        this.nodeWidth = Math.max(C.nodeMesh.mount.minWidth, Math.min(C.nodeMesh.mount.maxWidth, width));
    }

    /**
     * Перемещение индикатора при изменении ширины ноды
     */
    moveIndicator(){
        const indicator = this.mesh.getObjectByName('indicator');
        indicator.position.setX(this.nodeWidth - C.nodeMesh.indicator.rightMargin);
    }

    /**
     * Перемещение выходных портов при изменении ширины ноды
     */
    moveOutputPorts(){
        this.allCPorts.map(p => {
            if(p.direction === 'output') p.getMPort().position.setX(this.nodeWidth);
        });

        const cPseudoPort = this.getPseudoPort('output');
        if(cPseudoPort) {
            cPseudoPort.getMPort().position.setX(this.nodeWidth);
        }
    }

    /**
     * Перемещение кнопки меню при изменении ширины ноды
     */
    moveMenuButton(){
        const menu = this.mesh.getObjectByName('menuButton');
        menu.position.setX(this.nodeWidth - C.nodeMesh.header.menu.rightMargin);
    }

    /**
     * Перемещение кнопки плей при изменении ширины ноды
     */
    movePlayButton(){
        const play = this.mesh.getObjectByName('playButton');
        play.position.setX(this.nodeWidth - C.nodeMesh.header.play.rightMargin);
    }

    /**
     * Изменение размера большой подложки
     */
    scaleBigMount(w, h){
        const mesh = this.mesh.getObjectByName('bigMount');
        mesh.scale.set(w ? w : this.nodeWidth, h ? h : this.nodeHeight, 1);
        mesh.updateWorldMatrix();
    }

    /**
     * Изменение размера задней подложки без анимации
     */
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

    /**
     * Изменение размера передней подложки без анимации
     */
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

    /**
     * Расчёт высоты ноды в обычном состоянии(не при полном схлопывании). Главным образом зависит от количества портов
     * @param portsCount {int}
     */
    calcNodeHeight(portsCount) {
        const cPorts = this.getAllVisibleCPorts();
        portsCount = portsCount ? portsCount : cPorts.length;
        const portsHeight = portsCount * C.nodeMesh.port.height;
        this.nodeHeight = C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.front.headHeight +
            C.nodeMesh.header.height + portsHeight + C.nodeMesh.footer.height + C.nodeMesh.mount.roundCornerRadius;
    }

    /**
     * Возвращает все порты закреплённые за этой нодой, кроме псевдо-портов
     * @returns {[]}
     */
    getAllCPorts(){
        return this.allCPorts;
    }

    /**
     *
     * @returns {*[]}
     */
    getAllVisibleCPorts(){
        return [...this.cPortsInput, ...this.cPortsOutput];
    }

    /**
     * Подъём ноды на верхний уровень по Z (над всеми остальными)
     */
    moveToOverAllZ(){
        this.mesh.position.setZ(C.layers.topForNode);
    }

    /**
     * Возврат ноды на свой уровень по Z
     */
    moveToOriginZ(){
        this.mesh.position.setZ(this.originZ);
    }

    /**
     * Обновление темы ноды
     */
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