/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */

import * as THREE from 'three';
import ThemeControl from './../../../../themes/ThemeControl';
import C from "./../../../Constants";
import Layers from './../../../Layers';
import {Text} from "troika-three-text";
import MaterialControl from './../../MaterialControl';

class Assets3d{
    constructor() {
        //materials
        const backMaterial = new THREE.MeshBasicMaterial({
            color: ThemeControl.theme.nodeNotice.back.backgroundColor
        });
        const frontMaterial = new THREE.MeshBasicMaterial({
            color: ThemeControl.theme.nodeNotice.front.backgroundColor
        });

        //elements
        this.bigMount = this.createBigMount();

        this.message = this.createMessage();
        this.unwrapButton = this.createUnwrapButton();

        const br = C.nodeNotice.backRadius;
        this.backCornerTopLeft = this.createCornerTopLeft('backCornerTopLeft', br, backMaterial);
        this.backCornerTopRight = this.createCornerTopRight('backCornerTopRight', br, backMaterial);
        this.backCornerBottomLeft = this.createCornerBottomLeft('backCornerBottomLeft', br, backMaterial);
        this.backCornerBottomRight = this.createCornerBottomRight('backCornerBottomRight', br, backMaterial);
        this.backBodyTop = this.createBodyTop('backBodyTop', br, backMaterial);
        this.backBodyBottom = this.createBodyBottom('backBodyBottom', br, backMaterial);
        this.backBody = this.createBody('backBody', backMaterial);

        const fr = C.nodeNotice.backRadius - C.nodeNotice.borderSize;
        this.frontCornerTopLeft = this.createCornerTopLeft('frontCornerTopLeft', fr, frontMaterial);
        this.frontCornerTopRight = this.createCornerTopRight('frontCornerTopRight', fr, frontMaterial);
        this.frontCornerBottomLeft = this.createCornerBottomLeft('frontCornerBottomLeft', fr, frontMaterial);
        this.frontCornerBottomRight = this.createCornerBottomRight('frontCornerBottomRight', fr, frontMaterial);
        this.frontBodyTop = this.createBodyTop('frontBodyTop', fr, frontMaterial);
        this.frontBodyBottom = this.createBodyBottom('frontBodyBottom', fr, frontMaterial);
        this.frontBody = this.createBody('frontBody', frontMaterial);

        this.backArrow = this.createArrowBack('backArrow', backMaterial);
        this.frontArrow = this.createArrowFront('frontArrow', frontMaterial);
    }

    /**
     * Большая подложка. Используется в интерактивности ноды: для фиксации наведения поинтера на ноду
     * @returns {Mesh}
     */
    createBigMount(){
        const name = 'nodeNoticeBigMount';
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
        mesh.position.setZ(Layers.nodeNotice.bigMount);

        return mesh;
    }

    createMessage(){
        const mesh = new Text();
        mesh.text = '';
        mesh.name = 'message';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.nodeNotice.message.fontSize;
        mesh.anchorX = 'left';
        mesh.anchorY = 'top';
        mesh.lineHeight = C.nodeNotice.message.lineHeight;

        return mesh;
    }

    createUnwrapButton(){
        const mesh = new Text();
        mesh.text = '';
        mesh.name = 'unwrapButton';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.nodeNotice.unwrapButton.fontSize;
        mesh.anchorX = 'left';
        mesh.anchorY = 'bottom';

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

    //ARROW
    createArrowBack(name, material){
        const width = C.nodeNotice.arrow.back.width;
        const height = C.nodeNotice.arrow.back.height;

        const shape = new THREE.Shape();
        shape.moveTo( 0, 0 );
        shape.quadraticCurveTo(width * 0.1388, 0, width * 0.2777, height * 0.3571);
        shape.lineTo(width * 0.4166, height * 0.7142);
        shape.quadraticCurveTo(width * 0.5, height, width * 0.5833, height * 0.7142);
        shape.lineTo(width * 0.7222, height * 0.3571);
        shape.quadraticCurveTo(width * 0.8611, 0, width, 0);
        shape.lineTo(width, 0);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            material
            );
        mesh.name = name;

        mesh.position.set(0, 0, Layers.nodeNotice.arrow.back);

        return mesh;
    }

    createArrowFront(name, material){

        const width = C.nodeNotice.arrow.front.width;
        const height = C.nodeNotice.arrow.front.height;

        const shape = new THREE.Shape();
        shape.moveTo( 0, 0 );
        shape.quadraticCurveTo(width * 0.1388, 0, width * 0.2777, height * 0.3571);
        shape.lineTo(width * 0.5, height);
        shape.lineTo(width * 0.7222, height * 0.3571);
        shape.quadraticCurveTo(width * 0.8611, 0, width, 0);
        shape.lineTo(width, 0);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            material
        );
        mesh.name = name;
        mesh.position.set((C.nodeNotice.arrow.back.width - C.nodeNotice.arrow.front.width)/2, -C.nodeNotice.borderSize, Layers.nodeNotice.arrow.front);

        return mesh;
    }

    //COMPILE

    getArrow(){
        const group = new THREE.Group();
        group.add(this.backArrow);
        group.add(this.frontArrow);

        group.name = 'arrow';

        group.position.setZ(Layers.nodeNotice.arrow.self);

        return group;
    }

    getContainer(){
        const group = new THREE.Group();
        group.add(this.message);
        group.add(this.unwrapButton);
        group.name = 'container';

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

    getFrontMount() {
        const name = 'frontMount';
        const group = new THREE.Group();

        group.add(this.getFrontTop());
        group.add(this.frontBody);
        group.add(this.getFrontBottom());

        group.name = name;

        group.position.setZ(Layers.nodeNotice.front);

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

        group.position.setZ(Layers.nodeNotice.back);

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
        group.add(this.getArrow());

        return group;
    }
}

const assets3d = new Assets3d();

export default assets3d;