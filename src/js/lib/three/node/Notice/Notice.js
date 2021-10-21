import * as THREE from "three";
import Layers from "../../../Layers";
import ThemeControl from '../../../../themes/ThemeControl';
import Assets3d from './Assets3d';
import C from "../../../Constants";

export default class{
    constructor(){
        this.active = false;
        this.wrappedMessage = true;
        this.width = null;
        this.height = C.nodeNotice.minHeight;
        this.position = null;
        this.notice = this.create();
    }

    /**
     * Создание 3д-объекта окна сообщений
     * @returns {Group}
     */
    create() {
        const group = new THREE.Group();
        group.name = 'nodeNotice';

        //большая подложка. используется для интерактивности ноды(выделение, перемещение и т.д.)
        const bigMount = Assets3d.bigMount.clone();
        group.add(bigMount);

        //подложка
        const shield = Assets3d.getShield().clone();
        group.add(shield);

        //контейнер текста
        const container = Assets3d.getContainer().clone();
        group.add(container);

        //закрепляем за каждым дочерним объектом на текущий экземпляр класса, что бы из сцены получить к нему доступ
        group.traverse(o => o.userData.instance = this);
        group.position.setZ(Layers.nodeNotice.self);

        return group;
    }

    /**
     * Установка ширины окна сообщений
     * @param width {number}
     */
    setWidth(width){
        this.width = width;
    }

    /**
     * Установка текста уведомления
     * @param text {string} текст уведомления
     */
    setData(text){
        const message = this.notice.getObjectByName('message');
        message.text = text;

        const unwrapButton = this.notice.getObjectByName('unwrapButton');
        unwrapButton.text = this.wrappedMessage ? 'Show more' : 'Hide';
    }

    /**
     * Показывает окно уведомлений
     * @param parent {THREE.Group} родитель окна уведомлений
     */
    show(parent){
        this.scale();
        this.updateTheme();

        this.active = true;
        parent.add(this.notice);
    }

    /**
     * Скрывает окно уведомлений
     */
    hide(){
        this.active = false;
        this.notice.removeFromParent();
    }

    /**
     * Изменение размера окна уведомлений на основании посчитанной высоты и ширины
     */
    scale(){
        this.scaleBigMount();
        this.scaleBackBody();
        this.scaleFrontBody();
        this.setArrowPosition();
        this.setupMessage();
        this.setUnwrapButtonPosition();
    }

    /**
     * Изменение размера большой подложки
     */
    scaleBigMount(){
        const mesh = this.notice.getObjectByName('nodeNoticeBigMount');
        mesh.scale.set(this.width, this.height, 1);
        mesh.updateWorldMatrix();
    }

    /**
     * Изменение размера задней подложки
     */
    scaleBackBody(){
        const top = this.notice.getObjectByName('backTop');
        const topBody = top.getObjectByName('backBodyTop');
        topBody.scale.set(this.width - C.nodeMenu.backRadius * 2, 1, 1);
        topBody.position.setX(this.width/2);
        const topRightCorner = top.getObjectByName('backCornerTopRight');
        topRightCorner.position.setX(this.width - C.nodeMenu.backRadius);

        const body = this.notice.getObjectByName('backBody');
        body.scale.set( this.width, this.height - C.nodeMenu.backRadius * 2, 1);
        body.position.set(this.width/2, -this.height/2, body.position.z);

        const bottom = this.notice.getObjectByName('backBottom');
        bottom.position.setY(-this.height);
        const bottomBody = bottom.getObjectByName('backBodyBottom');
        bottomBody.scale.set(this.width - C.nodeMenu.backRadius * 2, 1, 1);
        bottomBody.position.setX(this.width/2);
        const bottomRightCorner = bottom.getObjectByName('backCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.nodeMenu.backRadius);
    }

    /**
     * Изменение размера передней подложки
     */
    scaleFrontBody() {
        const front = this.notice.getObjectByName('frontMount');
        front.position.set(C.nodeMenu.borderSize, -C.nodeMenu.borderSize, front.position.z);
        const topBody = front.getObjectByName('frontBodyTop');
        topBody.scale.set(this.width - C.nodeMenu.backRadius * 2, 1, 1);
        topBody.position.setX((this.width - C.nodeMenu.borderSize * 2) / 2);

        const topRightCorner = front.getObjectByName('frontCornerTopRight');
        topRightCorner.position.setX(this.width - C.nodeMenu.backRadius - C.nodeMenu.borderSize);

        const bodyHeight = this.height - C.nodeMenu.backRadius * 2;
        const body = this.notice.getObjectByName('frontBody');
        body.scale.set(this.width - C.nodeMenu.borderSize * 2, bodyHeight, 1);
        body.position.set(
            (this.width - C.nodeMenu.borderSize * 2) / 2,
            -bodyHeight / 2 - C.nodeMenu.backRadius + C.nodeMenu.borderSize,
            body.position.z
        );

        const bottom = front.getObjectByName('frontBottom');
        bottom.position.set(0, -this.height + C.nodeMenu.borderSize * 2, bottom.position.z);

        const bottomBody = bottom.getObjectByName('frontBodyBottom');
        bottomBody.scale.setX(this.width - C.nodeMenu.backRadius * 2);
        bottomBody.position.setX((this.width - C.nodeMenu.borderSize * 2) / 2);
        const bottomRightCorner = bottom.getObjectByName('frontCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.nodeMenu.backRadius - C.nodeMenu.borderSize);
    }

    /**
     * Установка позиции стрелки окна уведомлений
     */
    setArrowPosition(){
        const arrow = this.notice.getObjectByName('arrow')
        arrow.position.setX(this.width - C.nodeNotice.arrow.marginLeft);
    }

    /**
     * Настройка поля вывода сообщений
     */
    setupMessage(){
        const message = this.notice.getObjectByName('message');
        message.maxWidth = this.width - C.nodeNotice.message.marginLeft - C.nodeNotice.message.marginRight;
        message.position.set(C.nodeNotice.message.marginLeft, -C.nodeNotice.message.marginTop, Layers.nodeNotice.message);

        //область обрезания текста, текст не попавший в заданную рамку обрезается
        let clipRect;
        if(this.wrappedMessage){
            clipRect = [0, -(message.fontSize * message.lineHeight * 2), message.maxWidth, 0];
        } else {
            clipRect = [-Infinity, -Infinity, Infinity, Infinity];
        }
        message.clipRect = clipRect;
    }

    /**
     * Установка позиции для кнопки разворота сообщения
     */
    setUnwrapButtonPosition(){
        const unwrapButton = this.notice.getObjectByName('unwrapButton');
        unwrapButton.position.set(
            C.nodeNotice.unwrapButton.marginLeft,
            -this.height + C.nodeNotice.unwrapButton.marginBottom,
            Layers.nodeNotice.unwrapButton
        );
    }

    /**
     * Установка позиции окна уведомлений
     * @param posY {number}
     */
    setPosition(posY){
        this.notice.position.setY(posY - C.nodeNotice.marginTop);
    }

    /**
     * Возвращает 3д-объект окна уведомлений
     * @returns {Group}
     */
    get3dObject(){
        return this.notice;
    }

    /**
     * Подсветка при наведении на кнопку разворота сообщения
     */
    hoverUnwrapButton(){
        const unwrapButton = this.notice.getObjectByName('unwrapButton');
        unwrapButton.color = ThemeControl.theme.nodeNotice.unwrapButton.hoverColor;
    }

    /**
     * Снятие подсветки при наведении на кнопку разворота сообщения
     */
    unhoverUnwrapButton(){
        const unwrapButton = this.notice.getObjectByName('unwrapButton');
        unwrapButton.color = ThemeControl.theme.nodeNotice.unwrapButton.color;
    }

    /**
     * Метод разворота сообщения
     */
    unwrapMessage(){
        this.wrappedMessage = false;

    }

    /**
     * Метод сворачивания сообщения
     */
    wrapMessage(){
        this.wrappedMessage = true;

    }

    /**
     * Возврат состояние окна вывода сообщения. Свёрнуто или нет.
     * @returns {boolean|*}
     */
    isMessageWrapped(){
        return this.wrappedMessage;
    }

    /**
     * Метод обновления темы
     */
    updateTheme(){
        let m;

        m = this.notice.getObjectByName('backBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.nodeNotice.back.backgroundColor);

        m = this.notice.getObjectByName('frontBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.nodeNotice.front.backgroundColor);

        m = this.notice.getObjectByName('message');
        if(m) m.color = ThemeControl.theme.nodeNotice.message.fontColor;

        m = this.notice.getObjectByName('unwrapButton');
        if(m) m.color = ThemeControl.theme.nodeNotice.unwrapButton.color;
    }
}