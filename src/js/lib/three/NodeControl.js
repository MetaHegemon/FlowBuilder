/**
 * Модуль управления нодами
 */

import Node from '../three/Node';
import C from './../Constants';

class NodeControl {
    constructor() {
        this.mNodes = [];       //список всех 3д объектов нод
        this.cNodes = [];       //список всех классов-нод
        this.nodeInteractiveComponentNames = [
            'backCornerTopLeft', 'backBodyTop', 'backCornerTopRight', 'backBody',
            'backCornerBottomLeft', 'backBodyBottom', 'backCornerBottomRight', 'miniBackMount',

            'frontTop', 'frontCornerTopLeft', 'frontBodyTop', 'frontCornerTopRight', 'frontHeader',
            'miniFrontTop', 'frontBody',

            'miniFrontBody', 'frontBottom', 'frontFooter', 'frontCornerBottomLeft', 'frontCornerBottomRight',
            'frontBodyBottom', 'miniFrontBottom',

            'miniBackMount',
            'miniIndicatorMount',
        ];
    }

    /**
     * Создание экземпляра класса ноды
     * @param data - входные данные о нодах
     */
    buildNodes(data) {
        for (let i = 0; i < data.length; i += 1) {
            const cNode = new Node(data[i], i * C.layers.nodeStep);
            this.mNodes.push(cNode.getMNode());
            this.cNodes.push(cNode);
        }
    }

    /**
     * Возвращает список всех 3д-объектов нод
     * @returns {[]}
     */
    getMNodes() {
        return this.mNodes;
    }

    /**
     * Возвращает список всех нод
     * @returns {[]}
     */
    getCNodes() {
        return this.cNodes;
    }

    /**
     *  Обновление темы
     */
    updateTheme() {
        this.cNodes.map(n => n.updateTheme());
    }

    /**
     * Перемещение всех нод на свою координату по Z, за исключением ноды
     * @param exceptMNodes - 3д-объект ноды
     */
    moveNodesToOriginZ(exceptMNodes) {
        if (exceptMNodes) {
            this.cNodes.map(cN => {
                const mNode = cN.getMNode();
                const isExcept = exceptMNodes.some(n => {
                    return n === mNode;
                });
                if (!isExcept) cN.moveToOriginZ();
            });
        } else {
            this.cNodes.map(n => n.moveToOriginZ());
        }
    }

    isItNodeComponent(name){
        for(let i = 0; i < this.nodeInteractiveComponentNames.length; i += 1){
            if(this.nodeInteractiveComponentNames[i] === name){
                return true;
            }
        }
        return false;
    }
}

const nodeControl = new NodeControl();

export default nodeControl;