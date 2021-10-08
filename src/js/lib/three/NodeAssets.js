/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */

import * as THREE from 'three';
import ThemeControl from './../../themes/ThemeControl';
import C from "../Constants";
import {Text} from "troika-three-text";
import MaterialControl from './MaterialControl';
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {Line2} from "three/examples/jsm/lines/Line2";

class NodeAssets{
    constructor() {
        //elements
        this.bigMount = this.createBigMount();

        //CONTROL
        this.title = this.createTitle();
        this.indicator = this.createIndicator();
        this.rightResizer = this.createRightResizer();

        //BACK
        this.backCornerTopLeft = this.createBackCornerTopLeft();
        this.backCornerTopRight = this.createBackCornerTopRight();
        this.backCornerBottomLeft = this.createBackCornerBottomLeft();
        this.backCornerBottomRight = this.createBackCornerBottomRight();
        this.backBody = this.createBackBody();
        this.backTopBody = this.createBackTopBody();
        this.backBottomBody = this.createBackBottomBody();

        //FRONT
        this.frontCornerTopLeft = this.createFrontCornerTopLeft();
        this.frontTopBody = this.createFrontTopBody();
        this.frontCornerTopRight = this.createFrontCornerTopRight();
        this.frontHeader = this.createFrontHeader();
        this.frontBody = this.createFrontBody();
        this.frontCornerBottomLeft = this.createFrontCornerBottomLeft();
        this.frontBottomBody = this.createFrontBottomBody();
        this.frontFooter = this.createFrontFooter();
        this.footerLabel = this.createFooterLabel();
        this.frontCornerBottomRight = this.createFrontCornerBottomRight();

        //MINI
        this.miniBack = this.createMiniBack();
        this.miniFrontTop = this.createMiniFrontTop();
        this.miniFrontBody = this.createMiniFrontBody();
        this.miniFrontBottom = this.createMiniFrontBottom();
        this.miniIndicatorMount = this.createMiniIndicatorMount();
        this.miniMenuButton = this.createMiniMenuButton();

        //CONTROL PANEL
        this.collapseButton = this.createCollapseButton();
        this.menuButton = this.createMenuButton();
        this.playButton = this.createPlayButton();

        //LINE
        this.line = this.createLine();
    }

    /**
     * Большая подложка. Используется в интерактивности ноды: для фиксации наведения поинтера на ноду
     * @returns {Mesh}
     */
    createBigMount() {
        const name = 'bigMount';
        const material = MaterialControl.getMaterial(name);

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

    createBackCornerTopLeft() {
        const name = 'backCornerTopLeft';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius;
        const shape = new THREE.Shape();
        shape.moveTo(radius, 0);
        shape.lineTo(radius, -radius);
        shape.lineTo(0, -radius);
        shape.quadraticCurveTo(0, 0, radius, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = 'backCornerTopLeft';

        return mesh;
    }

    createBackTopBody() {
        const name = 'backBodyTop';
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, C.nodeMesh.mount.roundCornerRadius), material);

        mesh.name = name;
        mesh.position.setY(-C.nodeMesh.mount.roundCornerRadius / 2);

        return mesh;
    }

    createBackCornerTopRight() {
        const name = 'backCornerTopRight';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius;
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(radius, 0, radius, -radius);
        shape.lineTo(0, -radius);
        shape.lineTo(0, 0);
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createBackBody() {
        const name = 'backBody';
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material);
        mesh.name = name;

        return mesh;
    }

    getBackBottom() {
        const group = new THREE.Group();
        group.add(this.backCornerBottomLeft);
        group.add(this.backBottomBody);
        group.add(this.backCornerBottomRight);

        group.name = 'backBottom';

        return group;
    }

    createBackCornerBottomLeft() {
        const name = 'backCornerBottomLeft';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius;
        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.lineTo(radius, 0);
        shape.quadraticCurveTo(0, 0, 0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createBackBottomBody() {
        const name = 'backBodyBottom';
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, C.nodeMesh.mount.roundCornerRadius), material);
        mesh.name = name;
        mesh.position.setY(C.nodeMesh.mount.roundCornerRadius / 2);

        return mesh;
    }

    createBackCornerBottomRight() {
        const name = 'backCornerBottomRight';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius;
        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.quadraticCurveTo(radius, 0, 0, 0);
        shape.lineTo(0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    //FRONT

    getFrontTop() {
        const group = new THREE.Group();
        group.add(this.frontCornerTopLeft);
        group.add(this.frontTopBody);
        group.add(this.frontCornerTopRight);
        group.add(this.frontHeader);

        group.name = 'frontTop';

        return group;
    }

    createFrontCornerTopLeft() {
        const name = 'frontCornerTopLeft';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const shape = new THREE.Shape();
        shape.moveTo(radius, 0);
        shape.lineTo(radius, -radius);
        shape.lineTo(0, -radius);
        shape.quadraticCurveTo(0, 0, radius, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createFrontTopBody() {
        const name = 'frontBodyTop';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, radius), material);

        mesh.name = name;
        mesh.position.setY(-radius / 2);

        return mesh;
    }

    createFrontCornerTopRight() {
        const name = 'frontCornerTopRight';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(radius, 0, radius, -radius);
        shape.lineTo(0, -radius);
        shape.lineTo(0, 0);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createFrontHeader() {
        const name = 'frontHeader';
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, C.nodeMesh.mount.front.headHeight), material);

        mesh.name = name;
        mesh.position.setY(-C.nodeMesh.mount.front.headHeight / 2 - C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.borderSize);

        return mesh;
    }

    createFrontBody() {
        const name = 'frontBody';
        const material = MaterialControl.getMaterial(name);

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material);
        mesh.name = name;

        return mesh;
    }

    getFrontBottom() {
        const group = new THREE.Group();
        group.add(this.frontCornerBottomLeft);
        group.add(this.frontBottomBody);
        group.add(this.frontFooter);
        group.add(this.footerLabel);
        group.add(this.frontCornerBottomRight);

        group.name = 'frontBottom';

        return group;
    }

    createFrontFooter() {
        const name = 'frontFooter';
        const material = MaterialControl.getMaterial(name);

        const mountFooter = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, C.nodeMesh.footer.height), material);

        mountFooter.name = name;

        return mountFooter;
    }

    createFooterLabel() {
        const mesh = new Text();
        mesh.name = 'footerLabel';
        mesh.text = 'Learn more';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.footer.label.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.letterSpacing = C.nodeMesh.footer.label.letterSpacing;
        mesh.anchorX = 'left';
        mesh.anchorY = 'bottom';
        mesh.position.set(C.nodeMesh.footer.label.leftMargin, C.nodeMesh.footer.label.bottomMargin, C.layers.footerLabel);

        return mesh;
    }

    createFrontCornerBottomLeft() {
        const name = 'frontCornerBottomLeft';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.lineTo(radius, 0);
        shape.quadraticCurveTo(0, 0, 0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    createFrontBottomBody() {
        const name = 'frontBodyBottom';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, radius), material);

        mesh.name = name;
        mesh.position.setY(radius / 2);

        return mesh;
    }

    createFrontCornerBottomRight() {
        const name = 'frontCornerBottomRight';
        const material = MaterialControl.getMaterial(name);

        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;

        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.quadraticCurveTo(radius, 0, 0, 0);
        shape.lineTo(0, radius);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = name;

        return mesh;
    }

    getFrontMount() {
        const group = new THREE.Group();
        group.add(this.getFrontTop());
        group.add(this.frontBody);
        group.add(this.getFrontBottom());

        group.name = 'frontMount';

        group.position.set(C.nodeMesh.mount.borderSize, -C.nodeMesh.mount.borderSize, C.layers.frontMount);

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

        group.position.set(0, -C.nodeMesh.header.height / 2, C.layers.header);

        return group;
    }

    //SHIELD
    getRegularShield(options) {
        const group = new THREE.Group();

        group.add(this.getBackMount());
        group.add(this.getFrontMount());
        group.add(this.rightResizer);
        group.add(this.getControlPanel(options.withCollapseButton));

        group.name = 'regularMount';

        return group;
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

        return group;
    }

    createTitle() {
        const mesh = new Text();
        mesh.name = 'title';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.nodeMesh.title.fontSize;
        mesh.color = ThemeControl.theme.node.title.fontColor;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'left';
        mesh.anchorY = 'bottom';
        mesh.position.set(C.nodeMesh.title.leftMargin, C.nodeMesh.title.bottomMargin, 0);

        return mesh;
    }

    createIndicator() {
        const mesh = new Text();
        mesh.name = 'indicator';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.indicator.fontSize;
        mesh.color = ThemeControl.theme.node.indicator.fontColor;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'right';
        mesh.anchorY = 'bottom';
        mesh.position.setZ(C.layers.indicator);

        return mesh;
    }

    createRightResizer() {
        const name = 'rightResizer';
        const material = MaterialControl.getMaterial(name);
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(C.nodeMesh.rightResizer.width, 1), material);
        mesh.name = name;

        return mesh;
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
            C.layers.footerLabel
        );

        return mesh;
    }

    //PORT
    createPortConnectorMagnet(direction) {
        const name = 'connectorMagnet';
        const material = MaterialControl.getMaterial(name);

        const w = C.nodeMesh.port.magnet.width;
        const h = C.nodeMesh.port.height;

        const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(w, h), material);
        mesh.name = name;

        if (direction === 'output') {
            mesh.position.setX(w / 2);
        } else {
            mesh.position.setX(-w / 2);
        }

        mesh.position.setZ(-1); //TODO USE LAYERS

        return mesh;
    }

    createPortConnector(type, direction) {
        const material = MaterialControl.getPortConnectorMaterial(type);

        const w = C.nodeMesh.port.connector.width;
        const h = C.nodeMesh.port.connector.height;
        const r = C.nodeMesh.port.connector.cornerRadius;

        const shape = new THREE.Shape()
            .moveTo(0, h / 2 - r)
            .lineTo(0, -h / 2 + r)
            .quadraticCurveTo(0, -h / 2, r, -h / 2)
            .lineTo(w, -h / 2)
            .lineTo(w, h / 2)
            .lineTo(r, h / 2)
            .quadraticCurveTo(0, h / 2, 0, h / 2 - r);

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = 'connector';

        if (direction === 'output') {
            mesh.rotateZ(Math.PI);
            mesh.position.setX(w);
        } else {
            mesh.position.setX(-w);
        }

        return mesh;
    }

    createPortLabel(name, type, direction, mark) {
        const mesh = new Text();
        mesh.text = name;
        mesh.name = 'portLabelText';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.port.label.fontSize;
        mesh.material = MaterialControl.getPortLabelMaterial(type);
        mesh.anchorX = direction === 'input' ? 'left' : 'right';
        mesh.anchorY = 'bottom';
        mesh.letterSpacing = C.nodeMesh.port.label.letterSpacing;

        const posX = mark ? C.nodeMesh.port.label.leftMargin : C.nodeMesh.port.label.pseudoLeftMargin;
        mesh.position.set(direction === 'input' ? posX : -posX, -C.nodeMesh.port.label.topMargin, 0);

        return mesh;
    }

    createPortMarkMount(type) {
        const material = MaterialControl.getPortMarkMountMaterial(type);
        const w = C.nodeMesh.port.mark.width;
        const h = C.nodeMesh.port.mark.height;
        const r = C.nodeMesh.port.mark.cornerRadius;

        const shape = new THREE.Shape()
            .moveTo(0, h / 2 - r)
            .quadraticCurveTo(0, h / 2, r, h / 2)
            .lineTo(w - r, h / 2)
            .quadraticCurveTo(w, h / 2, w, h / 2 - r)
            .lineTo(w, -h / 2 + r)
            .quadraticCurveTo(w, -h / 2, w - r, -h / 2)
            .lineTo(r, -h / 2, 0, -h / 2 + r)
            .quadraticCurveTo(0, -h / 2, 0, -h / 2 + r)
            .lineTo(0, h / 2 - r);
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        mesh.name = 'mark';

        return mesh;
    }

    createPortMarkLabel(type, text) {
        const mesh = new Text();
        mesh.text = text;
        mesh.name = 'markLabel';
        mesh.font = ThemeControl.theme.fontPaths.mainNormal;
        mesh.fontSize = C.nodeMesh.port.mark.fontSize;
        mesh.material = MaterialControl.getPortMarkLabelMaterial(type);
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
        mesh.position.set(C.nodeMesh.port.mark.width / 2 + C.nodeMesh.port.mark.label.leftMargin, C.nodeMesh.port.mark.label.topMargin, 0);

        return mesh;
    }

    getPortMark(type, direction, mark) {
        const markObject = new THREE.Group();

        markObject.add(this.createPortMarkMount(type));
        markObject.add(this.createPortMarkLabel(type, mark));

        const posX = direction === 'input' ? C.nodeMesh.port.mark.leftMargin : -C.nodeMesh.port.mark.leftMargin - C.nodeMesh.port.mark.width
        const posY = C.nodeMesh.port.height / 2 - C.nodeMesh.port.mark.topMargin;
        markObject.position.set(posX, posY, 0);

        return markObject;
    }

    getPort(name, type, direction, mark) {
        const group = new THREE.Group();
        group.name = 'port';

        group.add(this.createPortConnectorMagnet(direction));

        group.add(this.createPortConnector(type, direction));

        if (mark) {
            group.add(this.getPortMark(type, direction, mark));
        }

        group.add(this.createPortLabel(name, type, direction, mark));

        return group;
    }

    //LINE

    createLine() {
        const geometry = new LineGeometry();
        geometry.setPositions([0, 0, 0, 0, 0, 0]);
        const material = new LineMaterial({
            color: ThemeControl.theme.line.colorOnActive,
            linewidth: C.lines.lineWidth
        });

        const mesh = new Line2(geometry, material);
        mesh.name = 'line';

        return mesh;
    }

    /**
     * Объект для расширения области наведения поинтером
     */
    createWatchPointPointerCircle(){
        const name = 'watchPointPointer';
        const material = MaterialControl.getMaterial(name);
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.watchPoint.pointerRadius, 32),
            material
        );
        mesh.name = name;
        mesh.position.setZ(C.layers.watchPoint.pointer);

        return mesh;
    }

    createWatchPointBigCircle(){
        const name = 'watchPointBig';
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.watchPoint.bigCircleRadius, 32),
            MaterialControl.getMaterial('default').clone()
        );
        mesh.name = name;
        mesh.position.setZ(C.layers.watchPoint.big);

        return mesh;
    }

    createWatchPointSmallCircle(){
        const name = 'watchPointSmall';
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.watchPoint.smallCircleRadius, 32),
            MaterialControl.getMaterial(name)
        );
        mesh.name = name;
        mesh.position.setZ(C.layers.watchPoint.small);

        return mesh;
    }

    getWatchPoint(){
        const group = new THREE.Group();
        group.name = 'watchPoint';

        group.add(this.createWatchPointPointerCircle());
        group.add(this.createWatchPointBigCircle());
        group.add(this.createWatchPointSmallCircle());

        return group;
    }
}

const nodeAssets = new NodeAssets();

export default nodeAssets;