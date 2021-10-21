/**
 * Модуль создания и выдачи 3д объектов или их компонентов
 *
 * Элементарные компоненты предсоздаются, а более крупные узлы собираются из элементарных по запросу
 *
 */
import * as THREE from 'three';
import C from "../../Constants";
import Layers from "../../Layers";
import MaterialControl from './../MaterialControl';
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {Line2} from "three/examples/jsm/lines/Line2";

class Assets3d{
    constructor() {

        this.line = {
            thin: this.createThinLine(),
            fat: this.createFatLine()
        }
    }

    //LINE

    createThinLine() {
        const geometry = new LineGeometry();
        const material = MaterialControl.getThinLineMaterial();

        const mesh = new Line2(geometry, material);
        mesh.name = 'thinLine';
        mesh.position.setZ(Layers.line.thin);

        return mesh;
    }

    createFatLine() {
        const geometry = new LineGeometry();
        const material = MaterialControl.getFatLineMaterial();

        const mesh = new Line2(geometry, material);
        mesh.name = 'fatLine';
        mesh.position.setZ(Layers.line.fat);

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
        mesh.position.setZ(Layers.lineMark.pointer);

        return mesh;
    }

    createLineMarkBigCircle(){
        const name = 'lineMarkBig';
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.mark.bigCircleRadius, 32),
            MaterialControl.getMaterial('default').clone()
        );
        mesh.name = name;
        mesh.position.setZ(Layers.lineMark.big);

        return mesh;
    }

    createLineMarkSmallCircle(){
        const name = 'lineMarkSmall';
        const mesh = new THREE.Mesh(
            new THREE.CircleBufferGeometry(C.lines.mark.smallCircleRadius, 32),
            MaterialControl.getMaterial(name)
        );
        mesh.name = name;
        mesh.position.setZ(Layers.lineMark.small);

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
}

const assets3d = new Assets3d();

export default assets3d;