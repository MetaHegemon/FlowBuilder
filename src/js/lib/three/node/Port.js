import * as THREE from "three";
import ThemeControl from '../../../themes/ThemeControl';
import NodeAssets from '../NodeAssets';
import FBS from "../../FlowBuilderStore";
import C from "../../Constants";

export default class {
    constructor(direction, data, cNode) {
        this.data = data;
        this.type = 'regular';          //тип порта обычный/псевдо regulat/pseudo
        this.cNode = cNode;             //ссылка на класс ноды
        this.direction = direction;     //направление порта 'input'/'output'
        this.mesh = this.create();      //создание 3д-объекта порта
        this.cLines = [];               //список классов линий, подключённых к этому порту
        this.connectorActive = true;    //флаг активности коннектора. с неактивным коннектором нельзя взаимодействовать
    }

    /**
     * Создание 3д-объекта порта
     * @returns {THREE.Group}
     */
    create(){
        const port = NodeAssets.getPort(this.data.name, this.data.type, this.direction, this.data.mark).clone();

        //добавление всем дочерним объектам ссылки на этот класс
        port.traverse(object =>object.userData.portClass = this);

        return port
    }

    /**
     * Подсветка подписи порта
     */
    hoverLabel(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.material.color.setStyle(ThemeControl.theme.node.port.label.hoverColor);
    }

    /**
     * Снятие подсветки подписи порта
     */
    unhoverLabel(){
        const label = this.mesh.getObjectByName('portLabelText');
        label.material.color.setStyle(ThemeControl.theme.node.portTypes[this.data.type].labelColor);
    }

    /**
     * Возвращает 3д-объект порта
     * @returns {THREE.Group}
     */
    getMPort(){
        return this.mesh;
    }

    /**
     * Возвращает 3д-объект коннектора
     * @returns {THREE.Mesh}
     */
    getMConnector(){
        return this.mesh.getObjectByName('connector');
    }

    /**
     * Подсветка коннектора
     */
    selectConnector(){
        const connector = this.mesh.getObjectByName('connector');
        connector.material.color.setStyle(ThemeControl.theme.line.selectedColor);
    };

    /**
     * Снятие подсветки коннектора
     */
    unselectConnector(){
        this.resetConnectorColor();
    }

    /**
     * Возвращает глобальную координату коннектора
     * @returns {Vector3}
     */
    getConnectorPos(){
        const pos = new THREE.Vector3();
        const connector = this.mesh.getObjectByName('connector');
        connector.getWorldPosition(pos);
        return pos;
    }

    /**
     *  Включение активности коннектора
     */
    setConnectorActive(){
        this.connectorActive = true;
        this.resetConnectorColor();
    }

    /**
     * Выключение активности коннектора
     */
    setConnectorInactive(){
        this.connectorActive = false;
        const connector = this.mesh.getObjectByName('connector');
        connector.material.color.setStyle(ThemeControl.theme.node.portTypes["pseudo"].connectorColor);
    }

    /**
     * Возвращает цвет порта этого порта в формате '#000000'
     * @returns {string|*}
     */
    getColor(){
        return ThemeControl.theme.node.portTypes[this.data.type].connectorColor;
    }

    /**
     * Сброс цвета порта
     */
    resetConnectorColor(){
        const connector = this.mesh.getObjectByName('connector');
        connector.material.color.setStyle(ThemeControl.theme.node.portTypes[this.data.type].connectorColor);
    }

    /**
     * Возвращает список классов линий, присоединённых к этому порту
     * @returns {[]|*}
     */
    getCLines(){
        return this.cLines;
    }

    /**
     * Устанавливает список классов линий для этого порта
     * @param cLines
     */
    setCLines(cLines){
        this.cLines = cLines;
    }

    /**
     * Удаление класса линии из списка присоединённых к этому порту
     * @param cLine {Class}
     */
    removeCLine(cLine){
        for(let i = 0; i < this.cLines.length; i += 1){
            if(this.cLines[i] === cLine){
                this.cLines.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Возвращает класс ноды-родителя
     * @returns {Class}
     */
    getCNode(){
        return this.cNode;
    }

    /**
     * Возвращает 3д-объект подписи порта
     * @returns {Text}
     */
    getMLabel(){
        return this.mesh.getObjectByName('portLabelText');
    }

    /**
     * Скрывает порт
     */
    hide(){
        this.mesh.scale.set(0,0,0);
    }

    /**
     * Добавляет порт к указанной ноде
     * @param mNode {THREE.Group}
     */
    addToNode(mNode){
        mNode.add(this.mesh);
    }

    /**
     * Анимированное скрытие порта
     * @param callback
     */
    animateHide(callback){
        new FBS.tween.Tween( this.mesh.scale)
            .to( {x: 0, y: 0, z: 0}, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
                this.mesh.removeFromParent();
            })
            .start();
    }

    /**
     * Анимированное появление порта
     * @param callback
     */
    animateShow(callback){
        new FBS.tween.Tween( this.mesh.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
            })
            .start();
    }

    /**
     * Скрытие подписи порта
     */
    hideLabel(){
        const label = this.getMLabel();
        label.scale.set(0,0,1);
    }

    /**
     * Анимированное появление подписи порта
     * @param callback
     */
    animateShowLabel(callback){
        const label = this.getMLabel();
        new FBS.tween.Tween( label.scale)
            .to( {x: 1, y: 1, z: 1}, C.animation.footerLabelHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onComplete(()=>{
                callback ? callback() : void null;
            })
            .start();
    }

    /**
     * Анимированное перемещение порта
     * @param to
     * @param onUpdate {function}
     * @param callback {function}
     */
    animateMoving(to, onUpdate, callback){
        new FBS.tween.Tween( this.mesh.position)
            .to( to, C.animation.portHideTime )
            .easing( FBS.tween.Easing.Exponential.InOut )
            .onUpdate(()=>{
                onUpdate ? onUpdate() : void null;
            })
            .onComplete(()=>{
                callback ? callback() : void null;
            })
            .start();
    }

    /**
     * Перемещение порта
     * @param to {Object} {x, y, z}
     */
    moving(to){
        const pos = this.mesh.position;
        this.mesh.position.set(to.x ? to.x : pos.x, to.y ? to.y : pos.y, to.z ? to.z : pos.z);
    }

    /**
     * Обновление темы порта
     */
    updateTheme(){
        let m;

        m = this.mesh.getObjectByName('connector');
        if (m) m.material.color.setStyle(
            this.connectorActive ? ThemeControl.theme.node.portTypes[this.data.type].connectorColor : ThemeControl.theme.node.portTypes["pseudo"].connectorColor
        );

        m = this.mesh.getObjectByName('portLabelText');
        if(m){
            m.color = ThemeControl.theme.node.portTypes[this.data.type].labelColor;
            m.font = ThemeControl.theme.fontPaths.mainNormal;
        }

        m = this.mesh.getObjectByName('mark');
        if(m) m.material.color.setStyle(ThemeControl.theme.node.portTypes[this.data.type].markColor);

        m = this.mesh.getObjectByName('markLabel');
        if(m){
            m.color = ThemeControl.theme.node.portTypes[this.data.type].markFontColor;
            m.font = ThemeControl.theme.fontPaths.mainNormal;
        }
    }
};