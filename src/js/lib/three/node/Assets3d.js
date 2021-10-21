/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */
//TODO add 'Node' to node component names
import * as THREE from 'three';
import ThemeControl from './../../../themes/ThemeControl';
import C from "../../Constants";
import Layers from '../../Layers';
import {Text} from "troika-three-text";
import MaterialControl from './../MaterialControl';

class Assets3d{
    constructor() {
        //elements
        this.bigMount = this.createBigMount();

        //CONTROL
        this.title = this.createTitle();
        this.indicator = this.createIndicator();
        this.widthResizer = this.createWidthResizer();

        //BACK
        this.backCornerTopLeft = this.createCornerTopLeft('backCornerTopLeft', C.nodeMesh.mount.roundCornerRadius);
        this.backCornerTopRight = this.createCornerTopRight('backCornerTopRight', C.nodeMesh.mount.roundCornerRadius);
        this.backCornerBottomLeft = this.createCornerBottomLeft('backCornerBottomLeft', C.nodeMesh.mount.roundCornerRadius);
        this.backCornerBottomRight = this.createCornerBottomRight('backCornerBottomRight', C.nodeMesh.mount.roundCornerRadius);

        this.backTopBody = this.createBodyTop( 'backBodyTop', C.nodeMesh.mount.roundCornerRadius);
        this.backBodyBottom = this.createBodyBottom('backBodyBottom', C.nodeMesh.mount.roundCornerRadius);

        this.backBody = this.createBody('backBody');

        //FRONT
        this.frontCornerTopLeft = this.createCornerTopLeft('frontCornerTopLeft', C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
        this.frontCornerTopRight = this.createCornerTopRight('frontCornerTopRight', C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
        this.frontCornerBottomLeft = this.createCornerBottomLeft('frontCornerBottomLeft', C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
        this.frontCornerBottomRight = this.createCornerBottomRight('frontCornerBottomRight', C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);

        this.frontBodyTop = this.createBodyTop('frontBodyTop', C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);
        this.frontBodyBottom = this.createBodyBottom('frontBodyBottom', C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize);

        this.frontBody = this.createBody('frontBody');

        this.frontHeader = this.createHeader('frontHeader', C.nodeMesh.mount.front.headHeight);
        this.frontFooter = this.createFooter('frontFooter', C.nodeMesh.footer.height);
        this.learnMoreButton = this.createLearnMoreButton();
        this.noticeButton = this.createNoticeButton();

        //MINI
        this.miniBack = this.createMiniBack();
        this.miniFrontTop = this.createMiniFrontTop();
        this.miniFrontBody = this.createMiniFrontBody();
        this.miniFrontBottom = this.createMiniFrontBottom();
        this.miniIndicatorMount = this.createMiniIndicatorMount();
        this.miniMenuButton = this.createMiniMenuButton();

        //CONTROL PANEL //TODO переименовать в иконки и юзать с клонированием
        this.collapseButton = this.createCollapseButton();
        this.menuButton = this.createMenuButton();
        this.playButton = this.createPlayButton();
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

    //BACK

    getBackMount() {
        const group = new THREE.Group();
        group.add(this.getBackTop());
        group.add(this.backBody);
        group.add(this.getBackBottom());

        group.name = 'backMount';

        //для интерактивных компонентов следует клонировать материал(т.е. он не должен быть общим)
        const material = MaterialControl.getMaterial('backMount').clone();
        group.traverse(o => {
            if (o.isMesh) o.material = material;
        });
        group.position.setZ(Layers.node.backMount);

        return group;
    }

    getBackTop() {
        const group = new THREE.Group();
        group.add(this.backCornerTopLeft);
        group.add(this.backTopBody);
        group.add(this.backCornerTopRight);

        group.name = 'backTop';

        return group;
    }

    //CORNERS

    createCornerTopLeft(name, radius) {
        const material = MaterialControl.getMaterial(name);

        const shape = new THREE.Shape();
        shape.moveTo(radius, 0);
        shape.lineTo(radius, -radius);
        shape.lineTo(0, -radius);
        shape.quadraticCurveTo(0, 0, radius, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createCornerTopRight(name, radius) {
        const material = MaterialControl.getMaterial(name);

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(radius, 0, radius, -radius);
        shape.lineTo(0, -radius);
        shape.lineTo(0, 0);
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createCornerBottomLeft(name, radius) {
        const material = MaterialControl.getMaterial(name);

        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.lineTo(radius, 0);
        shape.quadraticCurveTo(0, 0, 0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createCornerBottomRight(name, radius) {
        const material = MaterialControl.getMaterial(name);

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

    createBodyTop(name, height) {
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);

        mesh.name = name;
        mesh.position.setY(-height / 2);

        return mesh;
    }

    createBody(name) {
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material);
        mesh.name = name;

        return mesh;
    }

    getBackBottom() {
        const group = new THREE.Group();
        group.add(this.backCornerBottomLeft);
        group.add(this.backBodyBottom);
        group.add(this.backCornerBottomRight);

        group.name = 'backBottom';

        return group;
    }

    createBodyBottom(name, height) {
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);
        mesh.name = name;
        mesh.position.setY(height/ 2);

        return mesh;
    }

    //HEADER

    createHeader(name, height, ) {
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);

        mesh.name = name;

        return mesh;
    }

    createFooter(name, height) {
        const material = MaterialControl.getMaterial(name);

        const mountFooter = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, height), material);

        mountFooter.name = name;

        return mountFooter;
    }

    //FRONT

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
        group.add(this.frontBodyBottom);
        group.add(this.frontFooter);
        group.add(this.learnMoreButton);
        group.add(this.noticeButton);
        group.add(this.frontCornerBottomRight);

        group.name = 'frontBottom';

        return group;
    }

    createLearnMoreButton() {
        const mesh = new Text();
        mesh.name = 'learnMoreButton';
        mesh.text = 'Learn more';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.footer.learnMoreButton.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.letterSpacing = C.nodeMesh.footer.learnMoreButton.letterSpacing;
        mesh.anchorX = 'left';
        mesh.anchorY = 'bottom';
        mesh.position.set(C.nodeMesh.footer.learnMoreButton.leftMargin, C.nodeMesh.footer.learnMoreButton.bottomMargin, Layers.node.learnMoreButton);

        return mesh;
    }

    createNoticeButton(){
        const mesh = new Text();
        mesh.name = 'noticeButton';
        mesh.text = 'Error';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.footer.noticeButton.fontSize;
        mesh.color = ThemeControl.theme.node.footer.noticeButton.color;
        mesh.anchorX = 'right';
        mesh.anchorY = 'bottom';
        mesh.position.setY(C.nodeMesh.footer.noticeButton.bottomMargin);
        mesh.position.setZ(Layers.node.noticeButton);
        //mesh.layers.set(2);
        mesh.layers.disable(0);
        //mesh.layers.enable(1);
        console.log(mesh);

        return mesh;
    }

    getFrontMount() {
        const group = new THREE.Group();
        group.add(this.getFrontTop());
        group.add(this.frontBody);
        group.add(this.getFrontBottom());

        group.name = 'frontMount';

        group.position.set(C.nodeMesh.mount.borderSize, -C.nodeMesh.mount.borderSize, Layers.node.frontMount);

        return group;
    }

    //CONTROL PANEL

    createCollapseButton() {
        const mesh = new Text();
        mesh.name = 'collapseButton';
        mesh.text = '';
        mesh.font = C.fontPaths.awSolid;
        mesh.fontSize = C.nodeMesh.header.collapse.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 8;
        mesh.anchorY = -9.4;
        mesh.textAlign = 'center';
        mesh.rotateZ(Math.PI);
        mesh.position.set(C.nodeMesh.header.collapse.leftMargin, C.nodeMesh.header.height / 2 - C.nodeMesh.header.collapse.topMargin, 0);

        return mesh;
    }

    createPlayButton() {
        const mesh = new Text();
        mesh.name = 'playButton';
        mesh.text = '';
        mesh.font = C.fontPaths.awSolid;
        mesh.fontSize = C.nodeMesh.header.play.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'right';
        mesh.anchorY = 'top';
        mesh.position.setY(C.nodeMesh.header.height / 2 - C.nodeMesh.header.play.topMargin);

        return mesh;
    }

    createMenuButton() {
        const mesh = new Text();
        mesh.name = 'menuButton';
        mesh.text = '';
        mesh.font = C.fontPaths.awSolid;
        mesh.fontSize = C.nodeMesh.header.menu.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'right';
        mesh.anchorY = 'top';
        mesh.name = 'menuButton';
        mesh.position.setY(C.nodeMesh.header.height / 2 - C.nodeMesh.header.menu.topMargin);

        return mesh;
    }

    getControlPanel(withCollapseButton) {
        const group = new THREE.Group();
        group.name = 'controlPanel';

        if (withCollapseButton) group.add(this.collapseButton);
        group.add(this.playButton);
        group.add(this.menuButton);

        group.position.set(0, -C.nodeMesh.header.height / 2, Layers.node.header);

        return group;
    }

    //SHIELD

    createTitle() {
        const mesh = new Text();
        mesh.name = 'title';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.nodeMesh.title.fontSize;
        mesh.color = ThemeControl.theme.node.title.fontColor;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'left';
        mesh.anchorY = 'bottom';
        mesh.position.set(C.nodeMesh.title.leftMargin, C.nodeMesh.title.bottomMargin, Layers.node.title);

        return mesh;
    }

    createIndicator() {
        const mesh = new Text();
        mesh.name = 'indicator';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.indicator.fontSize;
        mesh.color = ThemeControl.theme.node.indicator.fontColor;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
        mesh.position.setZ(Layers.node.indicator);

        return mesh;
    }

    createWidthResizer() {
        const name = 'nodeWidthResizer';
        const material = MaterialControl.getMaterial(name);
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(C.nodeMesh.widthResizer.width, 1), material);
        mesh.name = name;
        mesh.position.setZ(Layers.node.widthResizer);

        return mesh;
    }

    getRegularShield(options) {
        const group = new THREE.Group();

        group.add(this.getBackMount());
        group.add(this.getFrontMount());
        group.add(this.widthResizer);
        group.add(this.getControlPanel(options.withCollapseButton));
        group.position.setZ(Layers.node.self);

        group.name = 'regularMount';

        return group;
    }

    //MINI

    createMiniBack() {
        const name = 'miniBackMount';
        const material = MaterialControl.getMaterial(name);

        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.width;
        const h = C.miniNodeMesh.height;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w - r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(w, -(h - r));
        shape.quadraticCurveTo(w, -h, w - r, -h);
        shape.lineTo(r, -h);
        shape.quadraticCurveTo(0, -h, 0, -(h - r));
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);
        shape.closePath();

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createMiniFrontTop() {
        const name = 'miniFrontTop';
        const material = MaterialControl.getMaterial(name);

        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.width;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w - r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createMiniFrontBody() {
        const name = 'miniFrontBody';
        const material = MaterialControl.getMaterial(name);

        const w = C.miniNodeMesh.width - C.miniNodeMesh.borderSize * 2;
        const h = C.miniNodeMesh.height - C.miniNodeMesh.roundCornerRadius * 2 - C.miniNodeMesh.footerHeight;
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(w, h), material);

        mesh.name = name;
        mesh.position.set(C.miniNodeMesh.width / 2, -h / 2 - C.miniNodeMesh.roundCornerRadius, 0);

        return mesh;
    }

    createMiniFrontBottom() {
        const name = 'miniFrontBottom';
        const material = MaterialControl.getMaterial(name);

        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.width - C.miniNodeMesh.borderSize * 2;
        const h = C.miniNodeMesh.footerHeight;

        const shape = new THREE.Shape();
        shape.lineTo(w, 0);
        shape.lineTo(w, -h);
        shape.quadraticCurveTo(w, -h - r, w - r, -h - r);
        shape.lineTo(r, -h - r);
        shape.quadraticCurveTo(0, -h - r, 0, -h);
        shape.lineTo(0, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);

        mesh.name = name;
        mesh.position.set(
            C.miniNodeMesh.borderSize,
            -C.miniNodeMesh.height + C.miniNodeMesh.borderSize + r + h,
            0
        );

        return mesh;
    }

    createMiniIndicatorMount() {
        const name = 'miniIndicatorMount';
        const material = MaterialControl.getMaterial(name);

        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.indicatorMountWidth;
        const h = C.miniNodeMesh.indicatorMountHeight;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w - r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(w, -(h - r));
        shape.quadraticCurveTo(w, -h, w - r, -h);
        shape.lineTo(r, -h);
        shape.quadraticCurveTo(0, -h, 0, -(h - r));
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);
        shape.closePath();

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);

        mesh.position.set((C.miniNodeMesh.width - w) / 2, -(C.miniNodeMesh.height - h) / 2, 0);
        mesh.name = name;

        return mesh;
    }

    createMiniMenuButton() {
        const mesh = new Text();
        mesh.name = 'miniMenuButton';
        mesh.text = '';
        mesh.font = C.fontPaths.awSolid;
        mesh.fontSize = C.miniNodeMesh.menuButtonFontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.letterSpacing = 0.0001;
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
        mesh.position.set(
            C.miniNodeMesh.width / 2,
            -C.miniNodeMesh.height + (C.miniNodeMesh.footerHeight + C.miniNodeMesh.roundCornerRadius) / 2,
            Layers.node.miniMenuButton
        );

        return mesh;
    }

    getMiniShield() {
        const group = new THREE.Group();
        group.add(this.miniBack);
        group.add(this.miniFrontTop);
        group.add(this.miniFrontBody);
        group.add(this.miniFrontBottom);
        group.add(this.miniIndicatorMount);
        group.add(this.miniMenuButton);

        group.name = 'miniMount';

        group.visible = false;
        group.scale.set(0, 0, 1);
        group.position.setZ(Layers.node.self);

        return group;
    }
}

const assets3d = new Assets3d();

export default assets3d;