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
    }

    /**
     * Включение рисования линии
     * @param mConnector {Mesh}- 3д-объект коннектора
     */
    enable(mConnector) {
        this.active = true;
        const cPort1 = mConnector.userData.portClass;
        const lines = cPort1.cLines;
        if(cPort1.direction === 'input' && lines.length > 0){
            //отсоединение линии от входного порта
            this.cLine = cPort1.cLines[0];
            this.cLine.removeLineMark();
            this.cLine.setCPort2(null);
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
        this.remove([this.cLine]);
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
            const cNode = mNode.userData.nodeClass;
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
        const cPort2 = mConnector2.userData.portClass;

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
        const cLine = mLine.userData.class;
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
        this.cLine.connect(mConnector2.userData.portClass);
        this.allCLines.push(this.cLine);
    }

    /**
     *
     */
    hideWatchPoints(){
        this.allCLines.map(l => l.hideWatchPoint());
    }

    /**
     * Удаление линии
     * @param cLines {[]}
     */
    remove(cLines){
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