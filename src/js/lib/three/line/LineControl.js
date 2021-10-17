/**
 * Модуль управления линиями
 */
import Line from './Line';
import ThemeControl from '../../../themes/ThemeControl';
import FBS from '../../FlowBuilderStore';

class LineControl{
    constructor() {
        this.active = false;
        this.cLine = null;      //ссылка на текущий линию-класс
        this.allCLines = [];    //контейнер для хранения всех линий-классов
        this.select = {
            cLines: []
        };
        this.hovered = [];                          //контейнер для хранения всех подсвеченных объектов
    }

    onPointerDown(e, intersects){
        const firstObject = intersects[0].object;
        if (e.buttons === 1) {
            const cPort = firstObject.userData.portInstance;
            if (cPort.connectorActive) {
                if (cPort.type !== 'pseudo') {
                    //если с портом можно взаимодействовать, то
                    //сохраняем 3д-объект коннектора, на которое произведено нажатие
                    //this.unselectAllLines(); //возможно придётся вернуть
                    //включаем рисование линии
                    this.enable(firstObject);
                }
            }

        }
    }

    onPointerMove(e, intersects) {
        const firstObject = intersects[0].object;
       // clog(firstObject)
        if (e.buttons === 0) { //подсветка или смена курсора при наведении на разные объекты сцены
            if (firstObject.name === 'connector') {
                const cPort = firstObject.userData.portInstance;
                if (cPort.connectorActive) {
                    if (cPort.type !== 'pseudo') {
                        FBS.dom.setCursor('pointer');
                    }
                }
            } else if (firstObject.name === 'fatLine') {
                if (this.canBeSelected(firstObject)) {
                    FBS.dom.setCursor('pointer');
                }
            } else if (firstObject.name === 'lineMarkPointer') {
                if (this.canBeSelected(firstObject)) {
                    const cLine = firstObject.userData.instance;
                    cLine.hoverLineMark();
                    this.hovered.push(firstObject);
                    FBS.dom.setCursor('pointer');
                }
            } else {
                //this.unhoverObjects(firstObject);
                //FBS.dom.resetCursor();
            }
        } else if (e.buttons === 1) //нажатие левой кнопки
        {
            if (firstObject.name === 'connector') {
                //включаем рисование линии
                this.enable(firstObject);
            }
        }
    }

    onPointerUp(e, intersects){
        const firstObject = intersects[0].object;
        if (e.button === 0) {
            //обработка нажатия на разные элементы сцены
            if(firstObject.name === 'lineMarkPointer'){
                if(this.canBeSelected(firstObject)){
                    const cLine = firstObject.userData.instance;
                    this.onWatchPointClick(cLine);
                }
            } else if(firstObject.name === 'fatLine'){
                if(this.canBeSelected(firstObject)){
                    const cLine = firstObject.userData.instance;
                    this.onLineClick(cLine);
                }
            }
        }
    }

    /**
     * Снятие подсветки со всех объектов, кроме аргумента
     * @param exceptObject - 3д-объект, который надо исключить
     */
    unhoverObjects(exceptObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === exceptObject) continue;

            if(this.hovered[i].name === 'lineMarkPointer'){
                const cLine = this.hovered[i].userData.instance;
                cLine.unhoverLineMark();
            }
            this.hovered.splice(i, 1);
            i -= 1;
        }
    }

    /**
     *
     * @param cLine {Line}
     */
    onWatchPointClick(cLine){
        cLine.showWatchPoint();
    }

    /**
     * Снятие выделения всех линий
     */
    unselectAllLines(){
        this.select.cLines.map(l=>l.unselect());
        this.select.cLines = [];
    }

    highlightSelectedLines(){
        this.select.cLines.map(cL => cL.select());
    }

    removeSelectedLines(){
        //удаление выделенных элементов (линий)
        if(this.select.cLines.length > 0){
            this.removeLines(this.select.cLines);
            this.select.cLines = [];
        }
    }

    /**
     * Обработка нажатия на линию
     * @param cLine {Line} - класс линии
     */
    onLineClick(cLine){
        let isSelected = false;
        for(let i = 0; i < this.select.cLines.length; i += 1){
            if(this.select.cLines[i] === cLine){
                isSelected = true;
                this.select.cLines.splice(i, 1);
                break;
            }
        }
        if(isSelected){
            cLine.unselect();
        } else {
            this.select.cLines.push(cLine);
            cLine.select();

        }
    }

    /**
     * Включение рисования линии
     * @param mConnector {Mesh}- 3д-объект коннектора
     */
    enable(mConnector) {
        this.active = true;
        const cPort1 = mConnector.userData.portInstance;
        const lines = cPort1.cLines;
        if(cPort1.direction === 'input' && lines.length > 0){
            //отсоединение линии от входного порта
            this.cLine = cPort1.cLines[0];
            this.cLine.removeLineMark();
            this.cLine.setCPort2(null);
            this.cLine.hideWatchPoint();
            cPort1.cLines = [];
        } else {
            //создание новой линии от порта
            this.cLine = new Line();
            this.cLine.setCPort1(cPort1);
        }
        const mesh = this.cLine.getThinLine3dObject();

        this.cLine.setColor(ThemeControl.theme.line.colorOnActive);

        FBS.sceneControl.addObjectsToScene([mesh]);
    }

    /**
     * Завершение рисования линии
     */
    disable(){
        this.active = false;
        this.removeLines([this.cLine]);
    }

    /**
     * Удаление класса-линии из общего списка всех линий
     * @param cLine - класс линии
     */
    removeFromCLinesList(cLine){
        for(let i = 0; i < this.allCLines.length; i += 1){
            if(this.allCLines[i] === cLine){
                this.allCLines.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Добавление линии в список выбранных
     * @param cLine {Line}
     */
    addCLineToSelected(cLine){
        const isExist = this.select.cLines.some(l=>{
            return l === cLine;
        });

        if(!isExist) this.select.cLines.push(cLine);
    }

    /**
     * Обновление второй координаты линии
     * @param ex {number}
     * @param ey {number}
     */
    drawLineFromPos(ex, ey){
        const cPort1 = this.cLine.getCPort1();
        const pos = cPort1.getConnectorPos();

        if(cPort1.direction === 'input'){
            this.cLine.setPos1(ex, ey);
            this.cLine.setPos2(pos.x, pos.y);
            this.cLine.updateLine();
        } else {
            this.cLine.setPos1(pos.x, pos.y);
            this.cLine.setPos2(ex, ey);
            this.cLine.updateLine();
        }
    }

    /**
     * Обновление линий для списка нод
     * @param mNodes {[Group]}
     */
    refreshLines(mNodes) {
        mNodes.map(mNode=> {
            const cNode = mNode.userData.instance;
            const cPorts = cNode.getAllVisibleCPorts();

            for(let i = 0; i < cPorts.length; i += 1){
                const pos = cPorts[i].getConnectorPos();
                const cLines = cPorts[i].cLines;
                for(let j = 0; j < cLines.length; j += 1){
                    if(cPorts[i].direction === 'output'){
                        cLines[j].setPos1(pos.x, pos.y);
                        cLines[j].updateLine();
                    } else {
                        cLines[j].setPos2(pos.x, pos.y);
                        cLines[j].updateLine();
                    }
                }
            }
        });
    }

    /**
     * Проверка может ли линия быть присоеденена к текущему коннектору
     * @param mConnector2 - 3д-объект коннектора
     * @returns {boolean}
     */
    canBeConnected(mConnector2){
        let result = false;
        const cPort1 = this.cLine.getCPort1();
        const cPort2 = mConnector2.userData.portInstance;

        const cNode1 = cPort1.getCNode();
        const cNode2 = cPort2.getCNode();

        if(
            cNode1 !== cNode2 &&                                        //не та же нода
            cPort1.direction !== cPort2.direction &&                    //не то же направление
            cPort2.connectorActive &&                                   //коннектор доступен для взаимодействия
            cPort2.type !== 'pseudo' &&                                 //не псевдоконнектор
            !(cPort2.direction === 'input' && cPort2.cLines.length > 0) //не занятый входной порт
        ){
            result = true;
        }

        return result;
    }

    /**
     * Возвращает возможность выбора линии
     * @param mLine {Mesh}
     * @returns {boolean}
     */
    canBeSelected(mLine){
        let result = true;
        const cLine = mLine.userData.instance;
        if(cLine.isPort1Collapsed || cLine.isPort2Collapsed){
            result = false;
        }
        return result;
    }

    /**
     * Присоединение линии
     * @param mConnector2 - 3д-объект коннектора
     */
    connect(mConnector2){
        this.active = false;
        this.cLine.connect(mConnector2.userData.portInstance);
        this.allCLines.push(this.cLine);
    }

    /**
     *
     */
    hideWatchPoints(){
        this.allCLines.map(l => l.hideWatchPoint());
    }

    /**
     * Удаление линий
     * @param cLines {[Line]}
     */
    removeLines(cLines){
        cLines.map(cL => {
            cL.remove();
            this.removeFromCLinesList(cL);
        });
    }

    /**
     * Обновление темы линии
     */
    updateTheme(){
        this.allCLines.map(l=> l.updateTheme());
    }
}

const lineControl = new LineControl();

export default lineControl;