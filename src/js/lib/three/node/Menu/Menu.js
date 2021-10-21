import * as THREE from "three";
import C from "../../../Constants";
import Layers from '../../../Layers';
import ThemeControl from '../../../../themes/ThemeControl';
import Assets3d from './Assets3d';
import FBS from "../../../FlowBuilderStore";

import {Text} from "troika-three-text";

class Menu{
    constructor(){
        this.active = false;
        this.hovered = [];
        this.width = null;
        this.height = null;

        this.position = null;
        this.data = null;
        this.asyncCounter = 0;
        this.asyncOperations = 0;

        this.menu = this.create();
    }

    /**
     * Создание 3д-объекта меню
     * @returns {Group}
     */
    create() {
        const group = new THREE.Group();
        group.name = 'nodeMenu';

        //большая подложка. используется для интерактивности ноды(выделение, перемещение и т.д.)
        const bigMount = Assets3d.bigMount;
        bigMount.name = 'nodeMenuBigMount';
        bigMount.position.setZ(Layers.nodeMenu.bigMount);
        group.add(bigMount);

        //подложка
        const shield = Assets3d.getShield();
        group.add(shield);

        //контейнер для хранения кнопок
        const container = Assets3d.container;
        group.add(container);

        //закрепляем за каждым дочерним объектом на текущий экземпляр класса, что бы из сцены получить к нему доступ
        group.traverse(o => o.userData.instance = this);
        group.position.setZ(Layers.nodeMenu.self);

        return group;
    }

    /**
     * Отображение менюна сцене
     * @param pos {THREE.Vector3}
     * @param data {[Object: {name:{string}, type:{string:'regular'|'warning'}, callback:{function}}]} данные кнопок
     */
    show(pos, data){
        this.active = true;
        pos.x += C.nodeMenu.positionOffsetLeft;
        pos.y -= C.nodeMenu.positionOffsetTop;
        this.position = pos;
        this.data = data;
        //текст готовится асинхронно, ждём готовности всех кнопок, что бы посчитать ширину меню
        //счётчик операций
        this.asyncCounter = 0;
        //количество операций, которые нужно подождать
        this.asyncOperations = data.length;
        this.fillWithData(data, () => this.waitAsync());
    }

    /**
     * Заполняет контейнер меню кнопками
     * @param data {[Object: {name:{string}, type:{string:'regular'|'warning'}, callback:{function}}]} данные кнопок
     * @param callbackOnComplete {function} функция ожидания асинхронных операций
     */
    fillWithData(data, callbackOnComplete){
        const container = this.menu.getObjectByName('container');
        container.clear();
        this.disposeButtons(container.children);
        data.map((d) => {
            const button = Assets3d.createButton(d.name, callbackOnComplete);
            button.color = ThemeControl.theme.nodeMenu.button[d.type].color;
            button.userData.instance = this;
            button.userData.data = d;
            container.add(button);
            //что бы сработал ивент окончания построения текста, нужно запустить это
            button.sync();
        });
    }

    /**
     * Расчёт ширины меню
     */
    calcWidth(){
        const buttons = [];
        const container = this.menu.getObjectByName('container');
        //берём все текстовые меши
        container.children.map(b => {
            if(b instanceof Text) buttons.push(b);
        });

        //берём их bounding box
        const bbs = [];
        buttons.map(b => bbs.push(b.geometry.boundingBox));

        //считаем ширины
        const widths = [];
        bbs.map(b => widths.push(b.max.x - b.min.x));

        const maxButtonWidth = Math.max(...widths);

        this.width = maxButtonWidth + C.nodeMenu.paddingLeft + C.nodeMenu.paddingRight;
    }

    /**
     * Расчёт высоты меню
     */
    calcHeight(){
        this.height = this.data.length * C.nodeMenu.buttonHeight + C.nodeMenu.paddingTop + C.nodeMenu.paddingBottom;
    }

    /**
     * Изменение размера меню на основании посчитанной высоты и ширины
     */
    scale(){
        this.scaleBigMount();
        this.scaleBackBody();
        this.scaleFrontBody();
    }

    /**
     * Изменение размера большой подложки
     */
    scaleBigMount(){
        const mesh = this.menu.getObjectByName('nodeMenuBigMount');
        mesh.scale.set(this.width, this.height, 1);
        mesh.updateWorldMatrix();
    }

    /**
     * Изменение размера задней подложки
     */
    scaleBackBody(){
        const top = this.menu.getObjectByName('backTop');
        const topBody = top.getObjectByName('backBodyTop');
        topBody.scale.set(this.width - C.nodeMenu.backRadius * 2, 1, 1);
        topBody.position.setX(this.width/2);
        const topRightCorner = top.getObjectByName('backCornerTopRight');
        topRightCorner.position.setX(this.width - C.nodeMenu.backRadius);

        const body = this.menu.getObjectByName('backBody');
        body.scale.set( this.width, this.height - C.nodeMenu.backRadius * 2, 1);
        body.position.set(this.width/2, -this.height/2, body.position.z);

        const bottom = this.menu.getObjectByName('backBottom');
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
    scaleFrontBody(){
        const front = this.menu.getObjectByName('frontMount');
        front.position.set(C.nodeMenu.borderSize, -C.nodeMenu.borderSize, front.position.z);
        const topBody = front.getObjectByName('frontBodyTop');
        topBody.scale.set(this.width - C.nodeMenu.backRadius * 2, 1, 1);
        topBody.position.setX((this.width - C.nodeMenu.borderSize*2) / 2);

        const topRightCorner = front.getObjectByName('frontCornerTopRight');
        topRightCorner.position.setX(this.width - C.nodeMenu.backRadius - C.nodeMenu.borderSize);

        const bodyHeight = this.height - C.nodeMenu.backRadius * 2;
        const body = this.menu.getObjectByName('frontBody');
        body.scale.set(this.width - C.nodeMenu.borderSize * 2, bodyHeight, 1);
        body.position.set(
            (this.width - C.nodeMenu.borderSize*2)/2,
            -bodyHeight/2 - C.nodeMenu.backRadius + C.nodeMenu.borderSize,
            body.position.z
        );

        const bottom = front.getObjectByName('frontBottom');
        bottom.position.set(0, -this.height + C.nodeMenu.borderSize*2, bottom.position.z);

        const bottomBody = bottom.getObjectByName('frontBodyBottom');
        bottomBody.scale.setX(this.width - C.nodeMenu.backRadius * 2);
        bottomBody.position.setX((this.width - C.nodeMenu.borderSize*2)/2);
        const bottomRightCorner = bottom.getObjectByName('frontCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.nodeMenu.backRadius - C.nodeMenu.borderSize);
    }

    /**
     * Расставляет кнопки на свои места
     */
    setButtonsPosition(){
        const container = this.menu.getObjectByName('container');
        container.position.setZ(Layers.nodeMenu.container);
        let currentPosY = -C.nodeMenu.paddingTop - C.nodeMenu.buttonHeight/2;
        container.children.map(b => {
            b.position.set(C.nodeMenu.paddingLeft, currentPosY, b.position.z);
            currentPosY -= C.nodeMenu.buttonHeight;
        });
    }

    /**
     * Функция ожидания асинхронных операций. Позавершению подготовки текста кнопок этот метод добавляет меню на сцену
     */
    waitAsync(){
        this.asyncCounter += 1;
        if(this.asyncOperations === this.asyncCounter){
            this.calcWidth();
            this.calcHeight();
            this.scale();
            this.setButtonsPosition();
            this.menu.position.set(this.position.x, this.position.y, this.menu.position.z);
            FBS.sceneControl.addObjectsToScene([this.menu]);
        }
    }

    /**
     * Удаляет меню со сцены
     */
    hide(){
        this.active = false;
        const container = this.menu.getObjectByName('container');
        container.clear();
        this.disposeButtons(container.children);
        this.menu.removeFromParent();
    }

    /**
     * Очистка памяти после удаления кнопок
     * @param buttons {[Text]}
     */
    disposeButtons(buttons){
        buttons.map(b => {
            b.material.dispose();
            b.dispose();
        });
    }

    onPointerDown(){

    }

    onPointerMove(e, intersects){
        const firstObject = intersects[1].object;

        if(firstObject.userData.type === 'button'){
            this.hoverButton(firstObject);
            this.hovered.push(firstObject);
            FBS.dom.setCursor('pointer');
        } else {
            this.unhoverAll();
        }
    }

    onPointerUp(e, intersects){
        const firstObject = intersects[1].object;

        if(firstObject.userData.type === 'button'){
            firstObject.userData.data.callback();
        }
    }

    hoverButton(button){
        button.color = ThemeControl.theme.nodeMenu.button[button.userData.data.type].hoverColor;
    }

    unhoverButton(button){
        button.color = ThemeControl.theme.nodeMenu.button[button.userData.data.type].color;
    }

    unhoverAll(){
        this.hovered.map(o => this.unhoverButton(o));
    }

    /**
     * Обновляет тему элемента
     */
    updateTheme() {
        let m;
        m = this.menu.getObjectByName('backBody');
        if (m) m.material.color.setStyle(ThemeControl.theme.nodeMenu.back.backgroundColor);

        m = this.menu.getObjectByName('frontBody');
        if (m) m.material.color.setStyle(ThemeControl.theme.nodeMenu.front.backgroundColor);

        m = this.menu.getObjectByName('container');
        if (m) {
            m.children.map(b => {
                b.font = ThemeControl.theme.fontPaths.mainMedium;
                b.color = ThemeControl.theme.nodeMenu.button[b.userData.data.type].color;
            });
        }
    }
}

const menu = new Menu();

export default menu;