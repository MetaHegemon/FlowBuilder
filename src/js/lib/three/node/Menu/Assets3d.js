/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */

import * as THREE from 'three';
import ThemeControl from './../../../../themes/ThemeControl';
import C from "./../../../Constants";
import {Text} from "troika-three-text";
import MaterialControl from './../../MaterialControl';

class NodeMenuAssets {
    constructor() {
        //materials
        this.backMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.nodeMenu.back.backgroundColor});
        this.frontMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.nodeMenu.front.backgroundColor});
        this.buttonMaterial = new THREE.MeshBasicMaterial({color: ThemeControl.theme.nodeMenu.button.fontColor});

        //elements
        this.bigMount = this.createBigMount();

        this.container = this.createContainer();

        const br = C.nodeMenu.backRadius;
        this.backCornerTopLeft = this.createCornerTopLeft('backCornerTopLeft', br, this.backMaterial);
        this.backCornerTopRight = this.createCornerTopRight('backCornerTopRight', br, this.backMaterial);
        this.backCornerBottomLeft = this.createCornerBottomLeft('backCornerBottomLeft', br, this.backMaterial);
        this.backCornerBottomRight = this.createCornerBottomRight('backCornerBottomRight', br, this.backMaterial);
        this.backBodyTop = this.createBodyTop('backBodyTop', br, this.backMaterial);
        this.backBodyBottom = this.createBodyBottom('backBodyBottom', br, this.backMaterial);
        this.backBody = this.createBody('backBody', this.backMaterial);

        const fr = C.nodeMenu.backRadius - C.nodeMenu.borderSize;
        this.frontCornerTopLeft = this.createCornerTopLeft('frontCornerTopLeft', fr, this.frontMaterial);
        this.frontCornerTopRight = this.createCornerTopRight('frontCornerTopRight', fr, this.frontMaterial);
        this.frontCornerBottomLeft = this.createCornerBottomLeft('frontCornerBottomLeft', fr, this.frontMaterial);
        this.frontCornerBottomRight = this.createCornerBottomRight('frontCornerBottomRight', fr, this.frontMaterial);
        this.frontBodyTop = this.createBodyTop('frontBodyTop', fr, this.frontMaterial);
        this.frontBodyBottom = this.createBodyBottom('frontBodyBottom', fr, this.frontMaterial);
        this.frontBody = this.createBody('frontBody', this.frontMaterial);
    }

    /**
     * Большая подложка. Используется в интерактивности ноды: для фиксации наведения поинтера на ноду
     * @returns {Mesh}
     */
    createBigMount(){
        const name = 'nodeMenuBigMount';
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

    createContainer(){
        const group = new THREE.Group();
        group.name = 'container';

        return group;
    }

    createButton(text, callbackOnComplete){
        const mesh = new Text();
        mesh.text = text;
        mesh.name = text;
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.nodeMenu.fontSize;
        mesh.anchorX = 'left';
        mesh.anchorY = 'middle';
        mesh.addEventListener('synccomplete', callbackOnComplete);
        mesh.userData.type = 'button';

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

    //COMPILE

    getBackBottom() {
        const group = new THREE.Group();
        group.add(this.backCornerBottomLeft);
        group.add(this.backBodyBottom);
        group.add(this.backCornerBottomRight);

        group.name = 'backBottom';

        return group;
    }

    getFrontMount() {
        const name = 'frontMount';
        const group = new THREE.Group();

        group.add(this.getFrontTop());
        group.add(this.frontBody);
        group.add(this.getFrontBottom());

        group.name = name;

        group.position.setZ(C.layers.nodeMenu.front);

        return group;
    }

    getFrontTop() {
        const group = new THREE.Group();
        group.add(this.frontCornerTopLeft);
        group.add(this.frontBodyTop);
        group.add(this.frontCornerTopRight);

        group.name = 'frontTop';

        return group;
    }

    getFrontBottom() {
        const group = new THREE.Group();
        group.add(this.frontCornerBottomLeft);
        group.add(this.frontCornerBottomRight);
        group.add(this.frontBodyBottom);

        group.name = 'frontBottom';

        return group;
    }

    getBackMount() {
        const name = 'backMount';
        const group = new THREE.Group();
        group.add(this.getBackTop());
        group.add(this.backBody);
        group.add(this.getBackBottom());

        group.name = name;

        group.position.setZ(C.layers.nodeMenu.back);

        return group;
    }

    getBackTop() {
        const group = new THREE.Group();
        group.add(this.backCornerTopLeft);
        group.add(this.backBodyTop);
        group.add(this.backCornerTopRight);

        group.name = 'backTop';

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

const nodeMenuAssets = new NodeMenuAssets();

export default nodeMenuAssets;