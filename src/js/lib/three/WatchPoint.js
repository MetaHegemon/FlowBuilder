/**
 * Модуль управления вотч поинтом
 *
 *
 */

import * as THREE from 'three';
import C from "../Constants";
import NodeAssets from './NodeAssets';
import FBS from "../FlowBuilderStore";

export default class{
    constructor() {
        this.width = C.watchPoint.defaultWidth;
        this.height = C.watchPoint.defaultHeight;

        this.wpPosition = null;

        this.mesh = this.createWindow();
        this.scaleWatchPoint();


    }

    createWindow() {
        const group = new THREE.Group();
        group.name = 'watchPoint';

        //
        //большая подложка. используется для интерактивности ноды(выделение, перемещение и т.д.)
        const bigMount = NodeAssets.bigMount.clone();
        bigMount.name = 'watchPointBigMount';
        group.add(bigMount);

        //подложка
        const shield = NodeAssets.getWatchPointShield().clone();
        group.add(shield);

        //верхняя панель
        group.add(NodeAssets.getWatchPointControlPanelTop().clone());

        //нижняя панель
        group.add(NodeAssets.getWatchPointControlPanelBottom().clone());

        //закрепляем за каждым дочерним объектом класс ноды, что бы из сцены получить к нему доступ
        group.traverse(o => o.userData.nodeClass = this);
        group.visible = false;
        group.position.setZ(C.layers.watchPoint.self);

        return group;
    }

    show(lineMarkPosition){
        FBS.sceneControl.addObjectsToScene([this.mesh]);
        if(!this.wpPosition){
            this.wpPosition = this.mesh.position;
            //TODO найти место для вотчпоинта
            const p = lineMarkPosition;
            this.wpPosition.set(p.x, p.y, this.wpPosition.z);
        }
        this.mesh.visible = true;
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

        const closeButton = controlPanel.getObjectByName('iconCross');
        closeButton.position.set(this.width - C.watchPoint.closeButton.marginRight, -C.watchPoint.closeButton.marginTop, closeButton.position.z);
    }

    scaleControlPanelBottom(){
        const controlPanel = this.mesh.getObjectByName('watchPointControlPanelBottom');
        controlPanel.position.setY(-this.height + C.watchPoint.backRadius + C.watchPoint.bottomControlPanelHeight);
        const cornerResize = controlPanel.getObjectByName('iconCornerResize');
        cornerResize.position.set(
            this.width - C.watchPoint.cornerResize.marginRight,
            - C.watchPoint.bottomControlPanelHeight - C.watchPoint.backRadius + C.watchPoint.cornerResize.marginBottom,
            cornerResize.position.z
        );

        const copyButton = controlPanel.getObjectByName('copyButton');
        copyButton.position.set(C.watchPoint.copyButton.leftMargin, -C.watchPoint.copyButton.topMargin, C.layers.watchPoint.copyButton);
        const exportButton = controlPanel.getObjectByName('exportButton');
        exportButton.position.set(C.watchPoint.exportButton.leftMargin, -C.watchPoint.exportButton.topMargin, C.layers.watchPoint.exportButton);
    }

}