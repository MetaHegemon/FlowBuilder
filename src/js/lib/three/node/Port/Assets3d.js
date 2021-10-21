/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */
//TODO add 'Node' to node component names
import * as THREE from 'three';
import ThemeControl from './../../../../themes/ThemeControl';
import C from "../../../Constants";
import Layers from '../../../Layers';
import {Text} from "troika-three-text";
import MaterialControl from './../../MaterialControl';

class Assets3d{
    constructor() {

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

        mesh.position.setZ(Layers.port.magnet);

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
        mesh.position.setZ(Layers.port.connector);

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
            Layers.port.label
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
        mesh.position.setZ(Layers.port.markMount)
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
            Layers.port.markLabel
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

        group.position.setZ(Layers.port.self);

        return group;
    }
}

const assets3d = new Assets3d();

export default assets3d;