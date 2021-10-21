/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */

import * as THREE from 'three';
import ThemeControl from './../../../../themes/ThemeControl';
import C from "../../../Constants";
import Layers from "../../../Layers";
import {Text} from "troika-three-text";
import MaterialControl from './../../MaterialControl';

class Assets3d{
    constructor() {
        //materials
        this.backMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.back.backgroundColor});
        this.frontMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.front.backgroundColor});
        this.frontTopMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.topControlPanel.backgroundColor});
        this.frontBottomMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.bottomControlPanel.backgroundColor});


        //elements
        this.bigMount = this.createBigMount();

        const br = C.watchPoint.backRadius;
        this.backCornerTopLeft = this.createCornerTopLeft('backCornerTopLeft', br, this.backMaterial);
        this.backCornerTopRight = this.createCornerTopRight('backCornerTopRight', br, this.backMaterial);
        this.backCornerBottomLeft = this.createCornerBottomLeft('backCornerBottomLeft', br, this.backMaterial)
        this.backCornerBottomRight = this.createCornerBottomRight('backCornerBottomRight', br, this.backMaterial);
        this.backBodyTop = this.createBodyTop('backBodyTop', br, this.backMaterial);
        this.backBodyBottom = this.createBodyBottom('backBodyBottom', br, this.backMaterial);
        this.backBody = this.createBody('backBody', this.backMaterial);

        const fr = C.watchPoint.backRadius - C.watchPoint.borderSize;
        this.frontCornerTopLeft = this.createCornerTopLeft('frontCornerTopLeft', fr, this.frontTopMaterial);
        this.frontCornerTopRight = this.createCornerTopRight('frontCornerTopRight', fr, this.frontTopMaterial);
        this.frontCornerBottomLeft = this.createCornerBottomLeft('frontCornerBottomLeft', fr, this.frontBottomMaterial);
        this.frontCornerBottomRight = this.createCornerBottomRight('frontCornerBottomRight', fr, this.frontBottomMaterial);
        this.frontBodyTop = this.createBodyTop('frontBodyTop', fr, this.frontTopMaterial);
        this.frontBodyBottom = this.createBodyBottom('frontBodyBottom', fr, this.frontBottomMaterial);

        this.frontHeader = this.createHeader('frontHeader', C.watchPoint.topControlPanelHeight, this.frontTopMaterial);
        this.frontFooter = this.createFooter('frontFooter', C.watchPoint.bottomControlPanelHeight, this.frontBottomMaterial);

        this.frontBody = this.createBody('frontBody', this.frontMaterial);

        this.copyButton = this.createWatchPointCopyButton();
        this.exportButton = this.createWatchPointExportButton();
        this.iconCornerResize = this.createWatchPointIconCornerResize();
        this.closeButton = this.createWatchPointCloseButton();
    }

    /**
     * Большая подложка. Используется в интерактивности ноды: для фиксации наведения поинтера на ноду
     * @returns {Mesh}
     */
    createBigMount() {
        const name = 'bigMount';
        const material = MaterialControl.getMaterial('transparent');

        const r = C.nodeMesh.bigMount.radius;
        const w = 1;
        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w - r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(w, -(w - r));
        shape.quadraticCurveTo(w, -w, w - r, -w);
        shape.lineTo(r, -w);
        shape.quadraticCurveTo(0, -w, 0, -(w - r));
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);
        shape.closePath();

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    //CORNERS

    createCornerTopLeft(name, radius, material) {
        const shape = new THREE.Shape();
        shape.moveTo(radius, 0);
        shape.lineTo(radius, -radius);
        shape.lineTo(0, -radius);
        shape.quadraticCurveTo(0, 0, radius, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createCornerTopRight(name, radius, material) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(radius, 0, radius, -radius);
        shape.lineTo(0, -radius);
        shape.lineTo(0, 0);
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createCornerBottomLeft(name, radius, material) {
        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.lineTo(radius, 0);
        shape.quadraticCurveTo(0, 0, 0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createCornerBottomRight(name, radius, material) {
        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.quadraticCurveTo(radius, 0, 0, 0);
        shape.lineTo(0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    //BODIES

    createBodyTop(name, height, material) {
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);

        mesh.name = name;
        mesh.position.setY(-height / 2);

        return mesh;
    }

    createBody(name, material) {
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material);
        mesh.name = name;

        return mesh;
    }

    createBodyBottom(name, height, material) {
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);
        mesh.name = name;
        mesh.position.setY(height/ 2);

        return mesh;
    }

    //HEADER

    createHeader(name, height, material) {
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);

        mesh.name = name;

        return mesh;
    }

    createFooter(name, height, material) {
        const mountFooter = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);

        mountFooter.name = name;

        return mountFooter;
    }

    //BUTTONS

    createWatchPointCloseButton(){
        const mesh = new Text();
        mesh.name = 'closeButton';
        mesh.text = '';
        mesh.font = C.fontPaths.awLight;
        mesh.fontSize = C.watchPoint.closeButton.fontSize;
        mesh.color = ThemeControl.theme.watchPoint.closeButton.fontColor;
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';

        return mesh;
    }

    createWatchPointIconCornerResize(){
        const group = new THREE.Group();
        group.name = 'iconCornerResize';

        const w = C.watchPoint.cornerResize.width;
        const h = C.watchPoint.cornerResize.height;

        const longLine = new Text();
        longLine.text = '';
        longLine.font = C.fontPaths.awLight;
        longLine.fontSize = C.watchPoint.cornerResize.fontSize;
        longLine.color = ThemeControl.theme.watchPoint.cornerResize.fontColor;
        longLine.anchorX = 'center';
        longLine.anchorY = 'middle';
        longLine.position.set(0, -h/6, Layers.watchPoint.iconCornerResize.text);
        longLine.scale.setX(1.15);
        group.add(longLine);

        const shortLine = new Text();
        shortLine.text = '';
        shortLine.font = C.fontPaths.awLight;
        shortLine.fontSize = C.watchPoint.cornerResize.fontSize;
        shortLine.color = ThemeControl.theme.watchPoint.cornerResize.fontColor;
        shortLine.anchorX = 'center';
        shortLine.anchorY = 'middle';
        shortLine.position.set(0,-h/3, Layers.watchPoint.iconCornerResize.text);
        shortLine.scale.setX(0.6);
        group.add(shortLine);

        //reactor
        const shape = new THREE.Shape();
        shape.moveTo(-w/2, h/2)
            .lineTo(w/2, h/2)
            .lineTo(-w/2, -h/2)
            .closePath();

        const reactor = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            //new THREE.MeshBasicMaterial({color: 'green', transparent: true, opacity: 0.5})
            MaterialControl.getMaterial('transparent')
        );

        reactor.rotateZ(Math.PI/4*3);
        reactor.name = 'cornerResizeReactor';
        reactor.position.setZ(Layers.watchPoint.iconCornerResize.reactor);
        group.add(reactor);

        group.rotateZ(Math.PI/4);
        return group;
    }

    createWatchPointCopyButton(){
        const mesh = new Text();
        mesh.text = 'Copy';
        mesh.name = 'copyButton';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.watchPoint.copyButton.fontSize;
        mesh.color = ThemeControl.theme.watchPoint.copyButton.fontColor;
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';

        return mesh;
    }

    createWatchPointExportButton(){
        const mesh = new Text();
        mesh.text = 'Export';
        mesh.name = 'exportButton';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.watchPoint.exportButton.fontSize;
        mesh.color = ThemeControl.theme.watchPoint.exportButton.fontColor;
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';

        return mesh;
    }

    //COMPILE

    getBackTop() {
        const group = new THREE.Group();
        group.add(this.backCornerTopLeft);
        group.add(this.backBodyTop);
        group.add(this.backCornerTopRight);

        group.name = 'backTop';

        return group;
    }

    getBackBottom() {
        const group = new THREE.Group();
        group.add(this.backCornerBottomLeft);
        group.add(this.backBodyBottom);
        group.add(this.backCornerBottomRight);

        group.name = 'backBottom';

        return group;
    }

    getBackMount() {
        const name = 'backMount';
        const group = new THREE.Group();
        group.add(this.getBackTop());
        group.add(this.backBody);
        group.add(this.getBackBottom());

        group.name = name;

        //для интерактивных компонентов следует клонировать материал(т.е. он не должен быть общим)
        group.traverse(o => {
            if (o.isMesh) o.material = o.material.clone();
        });

        group.position.setZ(Layers.watchPoint.back);

        return group;
    }

    getFrontTop() {
        const group = new THREE.Group();
        group.add(this.frontCornerTopLeft);
        group.add(this.frontBodyTop);
        group.add(this.frontCornerTopRight);
        group.add(this.frontHeader);

        group.name = 'frontTop';

        return group;
    }

    getFrontBottom() {
        const group = new THREE.Group();
        group.add(this.frontCornerBottomLeft);
        group.add(this.frontCornerBottomRight);
        group.add(this.frontBodyBottom);
        group.add(this.frontFooter);

        group.name = 'frontBottom';

        return group;
    }

    getFrontMount() {
        const name = 'frontMount';
        const group = new THREE.Group();

        group.add(this.getFrontTop());
        group.add(this.frontBody);
        group.add(this.getFrontBottom());

        group.name = name;

        group.position.setZ(Layers.watchPoint.front);

        return group;
    }

    getControlPanelTop(){
        const name = 'controlPanelTop';
        const group = new THREE.Group();

        group.add(this.closeButton.clone());

        group.name = name;
        group.position.setZ(Layers.watchPoint.controlPanelTop);

        return group;
    }

    getControlPanelBottom(){
        const name = 'controlPanelBottom';
        const group = new THREE.Group();

        group.add(this.iconCornerResize.clone());
        group.add(this.copyButton.clone());
        group.add(this.exportButton.clone());

        group.name = name;
        group.position.setZ(Layers.watchPoint.controlPanelBottom);

        return group;
    }

    getShield(){
        const group = new THREE.Group();
        group.name = 'mount';

        group.add(this.getBackMount());
        group.add(this.getFrontMount());

        return group;
    }
}

const assets3d = new Assets3d();

export default assets3d;