/**
 * Модуль-вотчпоинт
 *
 *
 */

import * as THREE from 'three';
import C from "../../Constants";
import Assets3d from '../Assets3d';
import FBS from "../../FlowBuilderStore";
import ThemeControl from "../../../themes/ThemeControl";

export default class{
    constructor() {
        this.width = C.watchPoint.defaultWidth;
        this.height = C.watchPoint.defaultHeight;

        this.select = false;

        this.wpPosition = null;
        this.lineMarkPosition = null;               //Vector3 позиция маркера на линии

        this.line = null;                           //линия от ближайшей грани вотчпоинта к маркеру линии
        this.edgePositions = {                      //координаты точек на гранях вотчпоинта
            left: null,
            right: null,
            top: null,
            bottom: null
        };

        this.mesh = this.createWindow();
        this.scaleWatchPoint();
        this.calcEdgePositions();
    }

    createWindow() {
        const group = new THREE.Group();
        group.name = 'watchPoint';

        //большая подложка. используется для интерактивности ноды(выделение, перемещение и т.д.)
        const bigMount = Assets3d.bigMount.clone();
        bigMount.name = 'watchPointBigMount';
        group.add(bigMount);

        //подложка
        const shield = Assets3d.getWatchPointShield().clone();
        group.add(shield);

        //верхняя панель
        group.add(Assets3d.getWatchPointControlPanelTop().clone());

        //нижняя панель
        group.add(Assets3d.getWatchPointControlPanelBottom().clone());

        //закрепляем за каждым дочерним объектом на текущий экземпляр класса, что бы из сцены получить к нему доступ
        group.traverse(o => o.userData.class = this);
        group.visible = false;
        group.position.setZ(C.layers.watchPoint.self);

        return group;
    }

    show(lineMarkPosition){

        if(!this.wpPosition){
            this.lineMarkPosition = lineMarkPosition;
            this.wpPosition = this.mesh.position;
            //TODO найти место для вотчпоинта
            const p = lineMarkPosition;
            this.wpPosition.set(p.x, p.y, this.wpPosition.z);
            this.line = this.createLine();
        }
        this.mesh.visible = true;
        this.line.visible = true;
        this.updateLine();
        FBS.sceneControl.addObjectsToScene([this.mesh, this.line]);
    }

    createLine(){
        const material = new THREE.LineBasicMaterial({color: 0x0000ff});
        const points = [new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 0 )];
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const mesh = new THREE.Line( geometry, material );
        mesh.name = 'watchPointLine';

        return mesh;
    }

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

    hide(){
        this.mesh.removeFromParent();
        this.line.removeFromParent();
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

    scaleWatchPoint(){
        this.scaleBigMount();
        this.scaleBackBody();
        this.scaleFrontBody();
        this.scaleControlPanelTop();
        this.scaleControlPanelBottom();
    }

    scaleBigMount(w, h){
        const mesh = this.mesh.getObjectByName('watchPointBigMount');
        mesh.scale.set(w ? w : this.width, h ? h : this.height, 1);
        mesh.updateWorldMatrix();
    }

    scaleBackBody(){
        const top = this.mesh.getObjectByName('watchPointBackTop');
        const topBody = top.getObjectByName('watchPointBackBodyTop');
        topBody.scale.set(this.width - C.watchPoint.backRadius * 2, 1, 1);
        topBody.position.setX(this.width/2);
        const topRightCorner = top.getObjectByName('watchPointBackCornerTopRight');
        topRightCorner.position.setX(this.width - C.watchPoint.backRadius);

        const body = this.mesh.getObjectByName('watchPointBackBody');
        body.scale.set( this.width, this.height - C.watchPoint.backRadius * 2, 1);
        body.position.set(this.width/2, -this.height/2, body.position.z);

        const bottom = this.mesh.getObjectByName('watchPointBackBottom');
        bottom.position.setY(-this.height);
        const bottomBody = bottom.getObjectByName('watchPointBackBodyBottom');
        bottomBody.scale.set(this.width - C.watchPoint.backRadius * 2, 1, 1);
        bottomBody.position.setX(this.width/2);
        const bottomRightCorner = bottom.getObjectByName('watchPointBackCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.watchPoint.backRadius);
    }

    scaleFrontBody(){
        const front = this.mesh.getObjectByName('watchPointFrontMount');
        front.position.set(C.watchPoint.borderSize, -C.watchPoint.borderSize, front.position.z);
        const topBody = front.getObjectByName('watchPointFrontBodyTop');
        topBody.scale.set(this.width - C.watchPoint.backRadius * 2, 1, 1);
        topBody.position.setX((this.width - C.watchPoint.borderSize*2) / 2);

        const topRightCorner = front.getObjectByName('watchPointFrontCornerTopRight');
        topRightCorner.position.setX(this.width - C.watchPoint.backRadius - C.watchPoint.borderSize);
        const header = front.getObjectByName('watchPointFrontHeader');
        header.scale.setX(this.width - C.watchPoint.borderSize * 2);
        header.position.set(
            (this.width - C.watchPoint.borderSize*2)/2,
            -C.watchPoint.topControlPanelHeight / 2 - C.watchPoint.backRadius + C.watchPoint.borderSize,
            header.position.z);

        const bodyHeight = this.height - C.watchPoint.backRadius * 2 - C.watchPoint.topControlPanelHeight - C.watchPoint.bottomControlPanelHeight;
        const body = this.mesh.getObjectByName('watchPointFrontBody');
        body.scale.set(this.width - C.watchPoint.borderSize * 2, bodyHeight, 1);
        body.position.set(
            (this.width - C.watchPoint.borderSize*2)/2,
            -bodyHeight/2 - C.watchPoint.topControlPanelHeight - C.watchPoint.backRadius + C.watchPoint.borderSize,
            body.position.z
        );

        const bottom = front.getObjectByName('watchPointFrontBottom');
        bottom.position.set(0, -this.height + C.watchPoint.borderSize*2, bottom.position.z);
        const frontFooter = bottom.getObjectByName('watchPointFrontFooter');
        frontFooter.scale.setX(this.width - C.watchPoint.borderSize * 2);
        frontFooter.position.set(
            (this.width - C.watchPoint.borderSize*2)/2,
            C.watchPoint.bottomControlPanelHeight/2 + C.watchPoint.backRadius - C.watchPoint.borderSize,
            frontFooter.position.z
        );
        const bottomBody = bottom.getObjectByName('watchPointFrontBodyBottom');
        bottomBody.scale.setX(this.width - C.watchPoint.backRadius * 2);
        bottomBody.position.setX((this.width - C.watchPoint.borderSize*2)/2);
        const bottomRightCorner = bottom.getObjectByName('watchPointFrontCornerBottomRight');
        bottomRightCorner.position.setX(this.width - C.watchPoint.backRadius - C.watchPoint.borderSize);
    }

    scaleControlPanelTop(){
        const controlPanel = this.mesh.getObjectByName('watchPointControlPanelTop');

        const closeButton = controlPanel.getObjectByName('closeButton');
        closeButton.position.set(this.width - C.watchPoint.closeButton.marginRight, -C.watchPoint.closeButton.marginTop, closeButton.position.z);
    }

    scaleControlPanelBottom(){
        const controlPanel = this.mesh.getObjectByName('watchPointControlPanelBottom');
        controlPanel.position.setY(-this.height + C.watchPoint.backRadius + C.watchPoint.bottomControlPanelHeight);
        const cornerResize = controlPanel.getObjectByName('iconCornerResize');
        cornerResize.position.set(
            this.width - C.watchPoint.cornerResize.marginRight,
            - C.watchPoint.bottomControlPanelHeight - C.watchPoint.backRadius + C.watchPoint.cornerResize.marginBottom,
            C.layers.watchPoint.iconCornerResize.self
        );

        const copyButton = controlPanel.getObjectByName('copyButton');
        copyButton.position.set(C.watchPoint.copyButton.leftMargin, -C.watchPoint.copyButton.topMargin, C.layers.watchPoint.copyButton);
        const exportButton = controlPanel.getObjectByName('exportButton');
        exportButton.position.set(C.watchPoint.exportButton.leftMargin, -C.watchPoint.exportButton.topMargin, C.layers.watchPoint.exportButton);
    }

    calcEdgePositions(){
        const localLeft = new THREE.Vector3(0, -this.height/2, C.layers.watchPoint.self);
        const localRight = new THREE.Vector3(this.width, -this.height/2, C.layers.watchPoint.self);
        const localTop = new THREE.Vector3(this.width/2, 0, C.layers.watchPoint.self);
        const localBottom = new THREE.Vector3(this.width/2, -this.height, C.layers.watchPoint.self);

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

    updateTheme(){

    }
}