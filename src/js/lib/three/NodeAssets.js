import * as THREE from 'three';
import Theme from './../../themes/Theme';
import C from "../Constants";
import {Text} from "troika-three-text";
import FBS from './../FlowBuilderStore';

export default class{
    constructor() {
        this.defaultMaterial = new THREE.MeshBasicMaterial({color: 'green'});
        this.defaultTransparentMaterial = new THREE.MeshBasicMaterial({
            color: 'red', transparent: true, opacity: 0, side: THREE.DoubleSide});

        this.bigMount = this.getBigMount();

        //REGULAR
        this.backMountTop = this.getBackTop();
        this.backMountBody = this.getBackBody();
        this.backMountBottom = this.getBackBottom();
        this.frontMountTop = this.getFrontTop();
        this.frontMountBody = this.getFrontBody();
        this.frontMountBottom = this.getFrontBottom();

        //MINI
        this.miniBack = this.getMiniBack();
        this.miniFrontTop = this.getMiniFrontTop();
        this.miniFrontBody = this.getMiniFrontBody();
        this.miniFrontBottom = this.getMiniFrontBottom();
        this.miniIndicatorMount = this.getMiniIndicatorMount();
        this.miniMenuButton = this.getMiniMenuButton();
    }

    getBigMount(){
        const r = C.nodeMesh.bigMount.radius;
        const w = 1;
        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w-r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(w, -(w-r));
        shape.quadraticCurveTo(w, -w, w-r, -w);
        shape.lineTo(r, -w);
        shape.quadraticCurveTo(0, -w, 0, -(w-r));
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);
        shape.closePath();

        const name = 'bigMount';
        const material = FBS.materialControl.getMaterial(name, false)
        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            material
        );
        mesh.name = name;

        return mesh;
    }

    //----------------------------------------------BACK------------------------------------------------

    //BACK MOUNT TOP

    getBackTop(){
        const group = new THREE.Group();
        group.add(this.createBackCornerTopLeft());
        group.add(this.createBackTopBody());
        group.add(this.createBackCornerTopRight());

        group.name = 'backMountTop';

        return group;
    }

    createBackCornerTopLeft(){
        const radius = C.nodeMesh.mount.roundCornerRadius;

        const cornerTopLeftShape = new THREE.Shape();
        cornerTopLeftShape.moveTo(radius, 0);
        cornerTopLeftShape.lineTo(radius, -radius);
        cornerTopLeftShape.lineTo(0, -radius);
        cornerTopLeftShape.quadraticCurveTo(0, 0, radius, 0);
        const cornerTopLeft = new THREE.Mesh(
            new THREE.ShapeGeometry( cornerTopLeftShape ),
            this.defaultMaterial
        );
        cornerTopLeft.name = 'backMountCornerTopLeft';

        return cornerTopLeft;
    }

    createBackTopBody(){
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, C.nodeMesh.mount.roundCornerRadius),
            this.defaultMaterial
        );

        mesh.name = 'backMountBodyTop';

        mesh.position.setY(-C.nodeMesh.mount.roundCornerRadius/2);

        return mesh;
    }

    createBackCornerTopRight() {
        const radius = C.nodeMesh.mount.roundCornerRadius;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(radius, 0, radius, -radius);
        shape.lineTo(0, -radius);
        shape.lineTo(0, 0);
        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            this.defaultMaterial
        );
        mesh.name = 'backMountCornerTopRight';

        return mesh;
    }

    //BACK MOUNT BODY

    getBackBody(){
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, 1),
            this.defaultMaterial
        );

        mesh.name = 'backMountBody';

        return mesh;
    }

    //BACK MOUNT BOTTOM

    getBackBottom(){
        const group = new THREE.Group();
        group.add(this.createBackCornerBottomLeft());
        group.add(this.createBackBottomBody());
        group.add(this.createBackCornerBottomRight());

        group.name = 'backMountBottom';

        return group;
    }

    createBackCornerBottomLeft(){
        const radius = C.nodeMesh.mount.roundCornerRadius;

        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.lineTo(radius, 0);
        shape.quadraticCurveTo(0, 0, 0, radius);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );
        mesh.name = 'backMountCornerBottomLeft';

        return mesh;
    }

    createBackBottomBody(){
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, C.nodeMesh.mount.roundCornerRadius),
            this.defaultMaterial
        );

        mesh.name = 'backMountBodyBottom';
        mesh.position.setY(C.nodeMesh.mount.roundCornerRadius/2);
        return mesh;
    }

    createBackCornerBottomRight(){
        const radius = C.nodeMesh.mount.roundCornerRadius;

        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo( radius, radius);
        shape.quadraticCurveTo(radius, 0, 0, 0);
        shape.lineTo( 0, radius);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );
        mesh.name = 'backMountCornerBottomRight';

        return mesh;
    }

    //----------------------------------------------FRONT------------------------------------------------

    //FRONT MOUNT TOP

    getFrontTop(){
        const group = new THREE.Group();
        group.add(this.createFrontCornerTopLeft());
        group.add(this.createFrontTopBody());
        group.add(this.createFrontCornerTopRight());
        group.add(this.createFrontHeader());

        group.name = 'frontMountTop';

        return group;
    }

    createFrontCornerTopLeft(){
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;

        const cornerTopLeftShape = new THREE.Shape();
        cornerTopLeftShape.moveTo(radius, 0);
        cornerTopLeftShape.lineTo(radius, -radius);
        cornerTopLeftShape.lineTo(0, -radius);
        cornerTopLeftShape.quadraticCurveTo(0, 0, radius, 0);
        const cornerTopLeft = new THREE.Mesh(
            new THREE.ShapeGeometry( cornerTopLeftShape ),
            this.defaultMaterial
        );
        cornerTopLeft.name = 'frontMountCornerTopLeft';

        return cornerTopLeft;
    }

    createFrontTopBody(){
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, radius),
            this.defaultMaterial
        );

        mesh.name = 'frontMountBodyTop';

        mesh.position.setY(-radius/2);

        return mesh;
    }

    createFrontCornerTopRight() {
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(radius, 0, radius, -radius);
        shape.lineTo(0, -radius);
        shape.lineTo(0, 0);
        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            this.defaultMaterial
        );
        mesh.name = 'frontMountCornerTopRight';

        return mesh;
    }

    createFrontHeader(){
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, C.nodeMesh.mount.front.headHeight),
            this.defaultMaterial
        );

        mesh.name = 'frontMountHeader';

        mesh.position.setY(-C.nodeMesh.mount.front.headHeight/2 - C.nodeMesh.mount.roundCornerRadius + C.nodeMesh.mount.borderSize);

        return mesh;
    }

    //FRONT MOUNT BODY

    getFrontBody(){
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, 1),
            this.defaultMaterial
        );

        mesh.name = 'frontMountBody';

        return mesh;
    }

    //FRONT MOUNT BOTTOM

    getFrontBottom(){
        const group = new THREE.Group();
        group.add(this.createFrontCornerBottomLeft());
        group.add(this.createFrontBottomBody());
        group.add(this.createFrontFooter());
        group.add(this.createFooterLabel());
        group.add(this.createFrontCornerBottomRight());

        group.name = 'frontMountBottom';

        return group;
    }

    createFrontFooter(){
        const mountFooter = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, C.nodeMesh.footer.height),
            this.defaultMaterial
        );

        mountFooter.name = 'frontMountFooter';

        return mountFooter;
    }

    createFooterLabel(){
        const footerLabel = new Text();
        footerLabel.name = 'footerLabel';
        footerLabel.text = 'Learn more';
        footerLabel.font = Theme.theme.fontPaths.mainNormal;
        footerLabel.fontSize = C.nodeMesh.footer.label.fontSize;
        footerLabel.color = Theme.theme.node.footer.label.color;
        footerLabel.letterSpacing = C.nodeMesh.footer.label.letterSpacing;
        footerLabel.anchorX = 'left';
        footerLabel.anchorY = 'bottom';
        footerLabel.position.set(C.nodeMesh.footer.label.leftMargin, C.nodeMesh.footer.label.bottomMargin, C.layers.footerLabel);

        return footerLabel;
    }

    createFrontCornerBottomLeft(){
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;

        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo(radius, radius);
        shape.lineTo(radius, 0);
        shape.quadraticCurveTo(0, 0, 0, radius);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );
        mesh.name = 'frontMountCornerBottomLeft';

        return mesh;
    }

    createFrontBottomBody(){
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1, radius),
            this.defaultMaterial
        );

        mesh.name = 'frontMountBodyBottom';
        mesh.position.setY(radius/2);
        return mesh;
    }

    createFrontCornerBottomRight(){
        const radius = C.nodeMesh.mount.roundCornerRadius - C.nodeMesh.mount.borderSize;

        const shape = new THREE.Shape();
        shape.moveTo(0, radius);
        shape.lineTo( radius, radius);
        shape.quadraticCurveTo(radius, 0, 0, 0);
        shape.lineTo( 0, radius);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );
        mesh.name = 'frontMountCornerBottomRight';

        return mesh;
    }

    //MINI NODE

    getMiniBack(){
        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.width;
        const h = C.miniNodeMesh.height;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w-r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(w, -(h-r));
        shape.quadraticCurveTo(w, -h, w-r, -h);
        shape.lineTo(r, -h);
        shape.quadraticCurveTo(0, -h, 0, -(h-r));
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);
        shape.closePath();

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );
        mesh.name = 'miniBackMount';

        return mesh;
    }

    getMiniFrontTop(){
        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.width;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w-r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );
        mesh.position.set(0,0, 0);
        mesh.name = 'miniFrontTop';

        return mesh;
    }

    getMiniFrontBody(){
        const w = C.miniNodeMesh.width - C.miniNodeMesh.borderSize*2;
        const h = C.miniNodeMesh.height - C.miniNodeMesh.roundCornerRadius * 2 - C.miniNodeMesh.footerHeight;
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(w, h),
            this.defaultMaterial
        );

        mesh.name = 'miniFrontBody';
        mesh.position.set(C.miniNodeMesh.width/2, -h/2 - C.miniNodeMesh.roundCornerRadius, 0);

        return mesh;
    }

    getMiniFrontBottom(){
        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.width - C.miniNodeMesh.borderSize*2;
        const h = C.miniNodeMesh.footerHeight;

        const shape = new THREE.Shape();
        shape.lineTo(w, 0);
        shape.lineTo(w, -h);
        shape.quadraticCurveTo(w, -h-r, w-r, -h-r);
        shape.lineTo(r, -h-r);
        shape.quadraticCurveTo(0, -h-r, 0, -h);
        shape.lineTo(0, 0);

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );

        mesh.name = 'miniFrontBottom';
        mesh.position.set(
            C.miniNodeMesh.borderSize,
            -C.miniNodeMesh.height + C.miniNodeMesh.borderSize + r + h,
            0
        );

        return mesh;
    }

    getMiniIndicatorMount(){
        const r = C.miniNodeMesh.roundCornerRadius;
        const w = C.miniNodeMesh.indicatorMountWidth;
        const h = C.miniNodeMesh.indicatorMountHeight;

        const shape = new THREE.Shape();
        shape.moveTo(r, 0);
        shape.lineTo(w-r, 0);
        shape.quadraticCurveTo(w, 0, w, -r);
        shape.lineTo(w, -(h-r));
        shape.quadraticCurveTo(w, -h, w-r, -h);
        shape.lineTo(r, -h);
        shape.quadraticCurveTo(0, -h, 0, -(h-r));
        shape.lineTo(0, -r);
        shape.quadraticCurveTo(0, 0, r, 0);
        shape.closePath();

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry( shape ),
            this.defaultMaterial
        );

        mesh.position.set((C.miniNodeMesh.width - w)/2, -(C.miniNodeMesh.height - h)/2, 0);
        mesh.name = 'miniIndicatorMount';

        return mesh;
    }

    getMiniMenuButton(){
        const mesh = new Text();
        mesh.name = 'miniMenuButton';
        mesh.text = '';
        mesh.font = C.fontPaths.awSolid;
        mesh.fontSize = C.miniNodeMesh.menuButtonFontSize;
        mesh.color = Theme.theme.node.header.menu.fontColor;
        mesh.letterSpacing = 0.0001;
        mesh.anchorX = 'center';
        mesh.anchorY = 'middle';
        mesh.position.set(
            C.miniNodeMesh.width/2,
            -C.miniNodeMesh.height + (C.miniNodeMesh.footerHeight + C.miniNodeMesh.roundCornerRadius)/ 2,
            C.layers.footerLabel
        );

        return mesh;
    }
}