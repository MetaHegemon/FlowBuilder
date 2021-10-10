/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */
//TODO add 'Node' to node component names
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
        this.footerLabel = this.createFooterLabel();

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

        //ICONS
        this.icons = {
            cross: this.createIconCross(),
            cornerResize: this.createIcontCornerResize()
        }

        //LINE
        this.line = this.createLine();

        //WATCH POINT
        this.watchPoint = {
            backCornerTopLeft: this.createCornerTopLeft('watchPointBackCornerTopLeft', C.watchPoint.backRadius),
            backCornerTopRight: this.createCornerTopRight('watchPointBackCornerTopRight', C.watchPoint.backRadius),
            backCornerBottomLeft: this.createCornerBottomLeft('watchPointBackCornerBottomLeft', C.watchPoint.backRadius),
            backCornerBottomRight: this.createCornerBottomRight('watchPointBackCornerBottomRight', C.watchPoint.backRadius),
            backBodyTop: this.createBodyTop('watchPointBackBodyTop', C.watchPoint.backRadius),
            backBodyBottom: this.createBodyBottom('watchPointBackBodyBottom', C.watchPoint.backRadius),
            backBody: this.createBody('watchPointBackBody'),

            frontCornerTopLeft: this.createCornerTopLeft('watchPointFrontCornerTopLeft', C.watchPoint.backRadius - C.watchPoint.borderSize),
            frontCornerTopRight: this.createCornerTopRight('watchPointFrontCornerTopRight', C.watchPoint.backRadius - C.watchPoint.borderSize),
            frontCornerBottomLeft: this.createCornerBottomLeft('watchPointFrontCornerBottomLeft', C.watchPoint.backRadius - C.watchPoint.borderSize),
            frontCornerBottomRight: this.createCornerBottomRight('watchPointFrontCornerBottomRight', C.watchPoint.backRadius - C.watchPoint.borderSize),
            frontBodyTop: this.createBodyTop('watchPointFrontBodyTop', C.watchPoint.backRadius - C.watchPoint.borderSize),
            frontBodyBottom: this.createBodyBottom('watchPointFrontBodyBottom', C.watchPoint.backRadius - C.watchPoint.borderSize),

            frontHeader: this.createHeader('watchPointFrontHeader', C.watchPoint.topControlPanelHeight),
            frontFooter: this.createFooter('watchPointFrontFooter', C.watchPoint.bottomControlPanelHeight),

            frontBody: this.createBody('watchPointFrontBody'),

            copyButton: this.createWatchPointCopyButton(),
            exportButton: this.createWatchPointExportButton()
        };
    }

    /**
     * Большая подложка. Используется в интерактивности ноды: для фиксации наведения поинтера на ноду
     * @returns {Mesh}
     */
    createBigMount() {
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
        group.add(this.footerLabel);
        group.add(this.frontCornerBottomRight);

        group.name = 'frontBottom';

        return group;
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

    //ICONS

    createIconCross(){
        const mesh = new Text();
        mesh.name = 'iconCross';
        mesh.text = '';
        mesh.font = C.fontPaths.awLight;
        mesh.fontSize = C.watchPoint.closeButton.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';

        return mesh;
    }

    createIcontCornerResize(){
        const group = new THREE.Group();
        group.name = 'iconCornerResize';
        const material = MaterialControl.getMaterial(group.name);

        const w = C.watchPoint.cornerResize.width;
        const h = C.watchPoint.cornerResize.height;

        const longLine = new Text();
        longLine.text = '';
        longLine.font = C.fontPaths.awLight;
        longLine.fontSize = C.watchPoint.cornerResize.fontSize;
        longLine.material = material;
        longLine.anchorX = 'center';
        longLine.anchorY = 'middle';
        longLine.position.setY(-h/6);
        longLine.scale.setX(1.15);
        group.add(longLine);

        const shortLine = new Text();
        shortLine.text = '';
        shortLine.font = C.fontPaths.awLight;
        shortLine.fontSize = C.watchPoint.cornerResize.fontSize;
        shortLine.material = material;
        shortLine.anchorX = 'center';
        shortLine.anchorY = 'middle';
        shortLine.position.setY(-h/3);
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
        reactor.name = group.name;
        group.add(reactor);

        group.position.setZ(10);
        group.rotateZ(Math.PI/4);
        return group;
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
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
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

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(w, h), material);
        mesh.name = name;

        if (direction === 'output') {
            mesh.position.setX(w / 2);
        } else {
            mesh.position.setX(-w / 2);
        }

        mesh.position.setZ(C.layers.port.magnet);

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
        mesh.position.setZ(C.layers.port.connector);

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
        mesh.position.set(
            direction === 'input' ? posX : -posX,
            -C.nodeMesh.port.label.topMargin,
            C.layers.port.label
        );

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
        mesh.position.setZ(C.layers.port.markMount)
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
        mesh.position.set(
            C.nodeMesh.port.mark.width / 2 + C.nodeMesh.port.mark.label.leftMargin,
            C.nodeMesh.port.mark.label.topMargin,
            C.layers.port.markLabel
        );

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

        group.position.setZ(C.layers.port.self);

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
    createLineMarkPointerCircle(){
        const name = 'lineMarkPointer';
        const material = MaterialControl.getMaterial(name);
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.mark.pointerRadius, 32),
            material
        );
        mesh.name = name;
        mesh.position.setZ(C.layers.lineMark.pointer);

        return mesh;
    }

    createLineMarkBigCircle(){
        const name = 'lineMarkBig';
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.mark.bigCircleRadius, 32),
            MaterialControl.getMaterial('default').clone()
        );
        mesh.name = name;
        mesh.position.setZ(C.layers.lineMark.big);

        return mesh;
    }

    createLineMarkSmallCircle(){
        const name = 'lineMarkSmall';
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.mark.smallCircleRadius, 32),
            MaterialControl.getMaterial(name)
        );
        mesh.name = name;
        mesh.position.setZ(C.layers.lineMark.small);

        return mesh;
    }

    getLineMark(){
        const group = new THREE.Group();
        group.name = 'lineMark';

        group.add(this.createLineMarkPointerCircle());
        group.add(this.createLineMarkBigCircle());
        group.add(this.createLineMarkSmallCircle());

        return group;
    }

    //WATCH POINT

    createWatchPointCopyButton(){
        const mesh = new Text();
        mesh.text = 'Copy';
        mesh.name = 'copyButton';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.watchPoint.copyButton.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
        mesh.position.set(
            C.watchPoint.copyButton.leftMargin,
            C.watchPoint.copyButton.topMargin,
            C.layers.watchPoint.copyButton
        );

        return mesh;
    }

    createWatchPointExportButton(){
        const mesh = new Text();
        mesh.text = 'Export';
        mesh.name = 'exportButton';
        mesh.font = ThemeControl.theme.fontPaths.mainMedium;
        mesh.fontSize = C.watchPoint.exportButton.fontSize;
        mesh.material = MaterialControl.getMaterial(mesh.name);
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
        mesh.position.set(
            C.watchPoint.exportButton.leftMargin,
            C.watchPoint.exportButton.topMargin,
            C.layers.watchPoint.exportButton
        );

        return mesh;
    }

    getWatchPointBackTop() {
        const group = new THREE.Group();
        group.add(this.watchPoint.backCornerTopLeft);
        group.add(this.watchPoint.backBodyTop);
        group.add(this.watchPoint.backCornerTopRight);

        group.name = 'watchPointBackTop';

        return group;
    }

    getWatchPointBackBottom() {
        const group = new THREE.Group();
        group.add(this.watchPoint.backCornerBottomLeft);
        group.add(this.watchPoint.backBodyBottom);
        group.add(this.watchPoint.backCornerBottomRight);

        group.name = 'watchPointBackBottom';

        return group;
    }

    getWatchPointBackMount() {
        const name = 'watchPointBackMount';
        const group = new THREE.Group();
        group.add(this.getWatchPointBackTop());
        group.add(this.watchPoint.backBody);
        group.add(this.getWatchPointBackBottom());

        group.name = name;

        //для интерактивных компонентов следует клонировать материал(т.е. он не должен быть общим)
        const material = MaterialControl.getMaterial(name).clone();
        group.traverse(o => {
            if (o.isMesh) o.material = material;
        });

        group.position.setZ(C.layers.watchPoint.back);

        return group;
    }

    getWatchPointFrontTop() {
        const group = new THREE.Group();
        group.add(this.watchPoint.frontCornerTopLeft);
        group.add(this.watchPoint.frontBodyTop);
        group.add(this.watchPoint.frontCornerTopRight);
        group.add(this.watchPoint.frontHeader);

        group.name = 'watchPointFrontTop';

        return group;
    }

    getWatchPointFrontBottom() {
        const group = new THREE.Group();
        group.add(this.watchPoint.frontCornerBottomLeft);
        group.add(this.watchPoint.frontCornerBottomRight);
        group.add(this.watchPoint.frontBodyBottom);
        group.add(this.watchPoint.frontFooter);

        group.name = 'watchPointFrontBottom';

        return group;
    }

    getWatchPointFrontMount() {
        const name = 'watchPointFrontMount';
        const group = new THREE.Group();

        group.add(this.getWatchPointFrontTop());
        group.add(this.watchPoint.frontBody);
        group.add(this.getWatchPointFrontBottom());

        group.name = name;

        group.position.setZ(C.layers.watchPoint.front);

        return group;
    }

    getWatchPointControlPanelTop(){
        const name = 'watchPointControlPanelTop';
        const group = new THREE.Group();

        const iconCross = this.icons.cross.clone();
        iconCross.position.setZ(C.layers.watchPoint.iconCross);
        group.add(this.icons.cross.clone());

        group.name = name;
        group.position.setZ(C.layers.watchPoint.controlPanelTop);

        return group;
    }

    getWatchPointControlPanelBottom(){
        const name = 'watchPointControlPanelBottom';
        const group = new THREE.Group();

        const iconCornerResize = this.icons.cornerResize.clone();
        iconCornerResize.position.setZ(C.layers.watchPoint.iconCornerResize);
        group.add(iconCornerResize);

        const copyButton = this.watchPoint.copyButton.clone();
        copyButton.position.setZ(C.layers.watchPoint.copyButton);
        group.add(copyButton);

        const exportButton = this.watchPoint.exportButton.clone();
        exportButton.position.setZ(C.layers.watchPoint.exportButton);
        group.add(exportButton);

        group.name = name;
        group.position.setZ(C.layers.watchPoint.controlPanelBottom);

        return group;
    }

    getWatchPointShield(){
        const group = new THREE.Group();
        group.name = 'watchPointMount';

        group.add(this.getWatchPointBackMount());
        group.add(this.getWatchPointFrontMount());

        return group;
    }

}

const nodeAssets = new NodeAssets();

export default nodeAssets;