/**
 * Модуль-вотчпоинт
 *
 *
 */

import * as THREE from 'three';
import C from "../../../Constants";
import Layers from '../../../Layers';
import Assets3d from './Assets3d';
import FBS from "../../../FlowBuilderStore";
import ThemeControl from "../../../../themes/ThemeControl";

export default class{
    constructor() {
        this.width = C.watchPoint.defaultWidth;
        this.height = C.watchPoint.defaultHeight;

        this.wpPosition = null;
        this.lineMarkPosition = null;               //Vector3 позиция маркера на линии

        this.line = null;                           //линия от ближайшей грани вотчпоинта к маркеру линии
        this.edgePositions = {                      //координаты точек на гранях вотчпоинта
            left: null,
            right: null,
            top: null,
            bottom: null
        };

        this.mesh = this.create();
        this.scaleWatchPoint();
        this.calcEdgePositions();
    }

    /**
     * Создаёт 3д-объект вотчпоинта
     * @returns {Group}
     */
    create() {
        const group = new THREE.Group();
        group.name = 'watchPoint';

        //большая подложка. используется для интерактивности ноды(выделение, перемещение и т.д.)
        const bigMount = Assets3d.bigMount.clone();
        bigMount.name = 'watchPointBigMount';
        bigMount.position.setZ(Layers.watchPoint.bigMount);
        group.add(bigMount);

        //подложка
        const shield = Assets3d.getShield().clone();
        group.add(shield);

        //верхняя панель
        group.add(Assets3d.getControlPanelTop().clone());

        //нижняя панель
        group.add(Assets3d.getControlPanelBottom().clone());

        //group.add(Assets3d.)

        //закрепляем за каждым дочерним объектом на текущий экземпляр класса, что бы из сцены получить к нему доступ
        group.traverse(o => o.userData.instance = this);
        group.position.setZ(Layers.watchPoint.self);

        return group;
    }

    /**
     * Добавляет вотчпоинт на сцену
     * @param lineMarkPosition {THREE.Vector3}
     */
    show(lineMarkPosition){
        if(!this.wpPosition){
            this.lineMarkPosition = lineMarkPosition;
            //TODO найти место для вотчпоинта
            this.wpPosition = this.mesh.position;
            this.wpPosition.setX(lineMarkPosition.x);
            this.wpPosition.setY(lineMarkPosition.y);

            this.line = this.createLine();
        }
        this.updateLine();
        FBS.sceneControl.addObjectsToScene([this.mesh, this.line]);
    }

    /**
     * Создаёт линию
     * @returns {Line}
     */
    createLine(){
        const material = new THREE.LineBasicMaterial({color: 0x0000ff});
        const points = [new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 0 )];
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const mesh = new THREE.Line( geometry, material );
        mesh.name = 'watchPointLine';

        return mesh;
    }

    /**
     * Обновляет координаты линии
     */
    updateLine(){
        //ищем ближайшую точку на грани
        const distances = {
            l: this.lineMarkPosition.distanceTo(this.edgePositions.left),
            r: this.lineMarkPosition.distanceTo(this.edgePositions.right),
            t: this.lineMarkPosition.distanceTo(this.edgePositions.top),
            b: this.lineMarkPosition.distanceTo(this.edgePositions.bottom)
        }

        const shortest = Math.min(distances.l, distances.r, distances.t, distances.b);
        let endPoint;
        if(shortest === distances.l){
            endPoint = this.edgePositions.left;
        } else if(shortest === distances.r){
            endPoint = this.edgePositions.right;
        } else if(shortest === distances.t){
            endPoint = this.edgePositions.top;
        } else if(shortest === distances.b){
            endPoint = this.edgePositions.bottom;
        }

        this.line.geometry.setFromPoints([this.lineMarkPosition, endPoint]);
    }

    /**
     * Убирает вотчпоинт и линию во сцены
     */
    hide(){
        this.mesh.removeFromParent();
        this.line.removeFromParent();
    }

    /**
     * Удаляет вотчпоинт и линию со сцены и освобождает память
     */
    remove(){
        this.hide();

        this.mesh.traverse(o => {
            if(o.geometry) o.geometry.dispose();
            if(o.material) o.material.dispose();
            o = null;
        });
        this.mesh = null;

        this.line.geometry.dispose();
        this.line.material.dispose();
        this.line = null;
    }

    /**
     * Задаём ширину 3д-объекта
     * @param value {number}
     */
    setWidth(value){
        this.width = value;
    }

    /**
     * Задаём высоту 3д-объекта
     * @param value {number}
     */
    setHeight(value){
        this.height = value;
    }

    /**
     * Изменение размеров окна вотчпоинта
     */
    scaleWatchPoint(){
        this.scaleBigMount();
        this.scaleBackBody();
        this.scaleFrontBody();
        this.scaleControlPanelTop();
        this.scaleControlPanelBottom();
    }

    /**
     * Изменяет размер большой подложки
     * @param w
     * @param h
     */
    scaleBigMount(w, h){
        const mesh = this.mesh.getObjectByName('watchPointBigMount');
        mesh.scale.set(w ? w : this.width, h ? h : this.height, 1);
        mesh.updateWorldMatrix();
    }

    /**
     * Изменяет размер задней подложки
     */
    scaleBackBody(){
        const top = this.mesh.getObjectByName('backTop');
        const topBody = top.getObjectByName('backBodyTop');
        topBody.scale.set(this.width - C.watchPoint.backRadius * 2, 1, 1);
        topBody.position.setX(this.width/2);
        const topRightCorner = top.getObjectByName('backCornerTopRight');
        topRightCorner.position.setX(this.width - C.watchPoint.backRadius);

        const body = this.mesh.getObjectByName('backBody');
        body.scale.set( this.width, this.height - C.watchPoint.backRadius * 2, 1);
        body.position.set(this.width/2, -this.height/2, body.position.z);

        const bottom = this.mesh.getObjectByName('backBottom');
        bottom.position.setY(-this.height);
        const bottomBody = bottom.getObjectByName('backBodyBottom');
        bottomBody.scale.set(this.width - C.watchPoint.backRadius * 2, 1, 1);
        bottomBody.position.setX(this.width/2);
        const bottomRightCorner = bottom.getObjectByName('backCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.watchPoint.backRadius);
    }

    /**
     * Изменяет размер передней подложки
     */
    scaleFrontBody(){
        const front = this.mesh.getObjectByName('frontMount');
        front.position.set(C.watchPoint.borderSize, -C.watchPoint.borderSize, front.position.z);
        const topBody = front.getObjectByName('frontBodyTop');
        topBody.scale.set(this.width - C.watchPoint.backRadius * 2, 1, 1);
        topBody.position.setX((this.width - C.watchPoint.borderSize*2) / 2);

        const topRightCorner = front.getObjectByName('frontCornerTopRight');
        topRightCorner.position.setX(this.width - C.watchPoint.backRadius - C.watchPoint.borderSize);
        const header = front.getObjectByName('frontHeader');
        header.scale.setX(this.width - C.watchPoint.borderSize * 2);
        header.position.set(
            (this.width - C.watchPoint.borderSize*2)/2,
            -C.watchPoint.topControlPanelHeight / 2 - C.watchPoint.backRadius + C.watchPoint.borderSize,
            header.position.z);

        const bodyHeight = this.height - C.watchPoint.backRadius * 2 - C.watchPoint.topControlPanelHeight - C.watchPoint.bottomControlPanelHeight;
        const body = this.mesh.getObjectByName('frontBody');
        body.scale.set(this.width - C.watchPoint.borderSize * 2, bodyHeight, 1);
        body.position.set(
            (this.width - C.watchPoint.borderSize*2)/2,
            -bodyHeight/2 - C.watchPoint.topControlPanelHeight - C.watchPoint.backRadius + C.watchPoint.borderSize,
            body.position.z
        );

        const bottom = front.getObjectByName('frontBottom');
        bottom.position.set(0, -this.height + C.watchPoint.borderSize*2, bottom.position.z);
        const frontFooter = bottom.getObjectByName('frontFooter');
        frontFooter.scale.setX(this.width - C.watchPoint.borderSize * 2);
        frontFooter.position.set(
            (this.width - C.watchPoint.borderSize*2)/2,
            C.watchPoint.bottomControlPanelHeight/2 + C.watchPoint.backRadius - C.watchPoint.borderSize,
            frontFooter.position.z
        );
        const bottomBody = bottom.getObjectByName('frontBodyBottom');
        bottomBody.scale.setX(this.width - C.watchPoint.backRadius * 2);
        bottomBody.position.setX((this.width - C.watchPoint.borderSize*2)/2);
        const bottomRightCorner = bottom.getObjectByName('frontCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.watchPoint.backRadius - C.watchPoint.borderSize);
    }

    /**
     * Изменяет размер верхней панели инструментов
     */
    scaleControlPanelTop(){
        const controlPanel = this.mesh.getObjectByName('controlPanelTop');
        const closeButton = controlPanel.getObjectByName('closeButton');
        closeButton.position.set(this.width - C.watchPoint.closeButton.marginRight, -C.watchPoint.closeButton.marginTop, closeButton.position.z);
    }

    /**
     * Изменяет размер нижней панели инструментов
     */
    scaleControlPanelBottom(){
        const controlPanel = this.mesh.getObjectByName('controlPanelBottom');
        controlPanel.position.setY(-this.height + C.watchPoint.backRadius + C.watchPoint.bottomControlPanelHeight);
        const cornerResize = controlPanel.getObjectByName('iconCornerResize');
        cornerResize.position.set(
            this.width - C.watchPoint.cornerResize.marginRight,
            - C.watchPoint.bottomControlPanelHeight - C.watchPoint.backRadius + C.watchPoint.cornerResize.marginBottom,
            Layers.watchPoint.iconCornerResize.self
        );

        const copyButton = controlPanel.getObjectByName('copyButton');
        copyButton.position.set(C.watchPoint.copyButton.leftMargin, -C.watchPoint.copyButton.topMargin, Layers.watchPoint.copyButton);
        const exportButton = controlPanel.getObjectByName('exportButton');
        exportButton.position.set(C.watchPoint.exportButton.leftMargin, -C.watchPoint.exportButton.topMargin, Layers.watchPoint.exportButton);
    }

    /**
     * Находит координаты на гранях вотчпоинта
     */
    calcEdgePositions(){
        const localLeft = new THREE.Vector3(0, -this.height/2, Layers.watchPoint.self);
        const localRight = new THREE.Vector3(this.width, -this.height/2, Layers.watchPoint.self);
        const localTop = new THREE.Vector3(this.width/2, 0, Layers.watchPoint.self);
        const localBottom = new THREE.Vector3(this.width/2, -this.height, Layers.watchPoint.self);

        this.edgePositions.left = this.mesh.localToWorld(localLeft);
        this.edgePositions.right = this.mesh.localToWorld(localRight);
        this.edgePositions.top = this.mesh.localToWorld(localTop);
        this.edgePositions.bottom = this.mesh.localToWorld(localBottom);
    }

    /**
     * Подсветка интерактивных элементов
     * @param name {String}
     */
    hoverElementByName(name) {
        const button = this.mesh.getObjectByName(name);
        button.material.color.setStyle(ThemeControl.theme.watchPoint[name].hoverColor);
    }

    /**
     * Выключение подсветки интерактивных элементов
     * @param name {String}
     */
    unhoverElementByName(name) {
        const button = this.mesh.getObjectByName(name);
        button.material.color.setStyle(ThemeControl.theme.watchPoint[name].fontColor);
    }

    get3dObject(){
        return this.mesh;
    }

    /**
     * Обновляет тему элемента
     */
    updateTheme(){
        let m = this.mesh.getObjectByName('backBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.watchPoint.back.backgroundColor);

        m = this.mesh.getObjectByName('frontBody');
        if(m) m.material.color.setStyle(ThemeControl.theme.watchPoint.front.backgroundColor);

        m = this.mesh.getObjectByName('frontBodyTop');
        if(m) m.material.color.setStyle(ThemeControl.theme.watchPoint.topControlPanel.backgroundColor);

        m = this.mesh.getObjectByName('frontBodyBottom');
        if(m) m.material.color.setStyle(ThemeControl.theme.watchPoint.bottomControlPanel.backgroundColor);

        m = this.mesh.getObjectByName('copyButton');
        if(m) m.color = ThemeControl.theme.watchPoint.copyButton.fontColor;

        m = this.mesh.getObjectByName('exportButton');
        if(m) m.color = ThemeControl.theme.watchPoint.exportButton.fontColor;

        m = this.mesh.getObjectByName('iconCornerResize');
        if(m) m.color = ThemeControl.theme.watchPoint.cornerResize.fontColor;

        m = this.mesh.getObjectByName('closeButton');
        if(m) m.color = ThemeControl.theme.watchPoint.closeButton.fontColor;
    }
}
