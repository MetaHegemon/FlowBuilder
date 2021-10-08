/**
 * Модуль расширения обычного порта до псевдо порта
 */

import Port from './NodePort';

export default class extends Port{
    constructor(direction, cNode) {
        const data = {                  //псевдо данные для создания порта
            id: -1,
            name: 'Show more',
            type: 'pseudo',
            mark: null
        }
        super(direction, data, cNode);

        this.type = 'pseudo';
        this.hidedCPorts = [];          //контейнер для хранения скрытых портов
    }

    /**
     * Установка текста подписи порта для свёрнутого состояния
     */
    setCollapsedText(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.text = 'Show more' + ' (' + this.hidedCPorts.length + ')';
    }

    /**
     * Установка текста для подписи порта для развёрнутого состояния
     */
    setUncollapsedText(){
        const label = this.mesh.getObjectByName('portLabelText');
        if(this.direction === 'input'){
            label.text = 'Hide inputs';
        } else {
            label.text = 'Hide outputs';
        }
    }

    /**
     *  Скрывает 3д-объект коннектор
     */
    hideConnector(){
        const connector = this.mesh.getObjectByName('connector');
        connector.visible = false;
    }

    /**
     * Показывает 3д-объект коннектор
     */
    showConnector(){
        const connector = this.mesh.getObjectByName('connector');
        connector.visible = true;
    }

    /**
     * Возвращает список скрытых портов
     * @returns {[]|*}
     */
    getHidedCPorts(){
        return this.hidedCPorts;
    }

    /**
     * Устанавливает список скрытых портов
     * @param cPorts
     */
    setHidedCPorts(cPorts){
        this.hidedCPorts = cPorts;
    }
}