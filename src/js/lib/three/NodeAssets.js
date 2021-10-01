import * as THREE from 'three';
import Theme from './../../themes/Theme';
import C from "../Constants";
import {Text} from "troika-three-text";

export default class{
    constructor() {
        this.defaultMaterial = new THREE.MeshBasicMaterial({color: 'green'});

        this.backMountTop = this.getBackTop();

        this.backMountBody = this.getBackBody();

        this.backMountBottom = this.getBackBottom();

        this.frontMountTop = this.getFrontTop();

        this.frontMountBody = this.getFrontBody();

        this.frontMountBottom = this.getFrontBottom();
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


}