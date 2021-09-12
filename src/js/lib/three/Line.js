import * as THREE from 'three';
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {Line2} from "three/examples/jsm/lines/Line2";
import C from './../Constants';

export default class {
    constructor(){
        this.geometry = new LineGeometry();
        this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
        this.material = new LineMaterial({
            color: C.nodeMesh.line.color,
            linewidth: 0.002
        });
        this.line = new Line2(this.geometry, this.material);
        this.line.userData.originColor = C.nodeMesh.line.color;
        this.line.userData.selectedColor = C.nodeMesh.line.selectedColor;
        this.line.name = 'line';
        this.line.userData.selected = false;

        this.connector1 = null;
        this.connector2 = null;
        this.pos1 = new THREE.Vector2();
        this.pos2 = new THREE.Vector2();
    }

    setConnector1(connector){
        this.connector1 = connector;
    }

    setConnector2(connector){
        this.connector2 = connector;
    }

    getConnector1(){
        return this.connector1;
    }

    getConnector2(){
        return this.connector2;
    }

    getLineMesh(){
        return this.line;
    }

    setPos1(x, y){
        this.pos1.x = x;
        this.pos1.y = y;
    }

    setPos2(x, y){
        this.pos2.x = x;
        this.pos2.y = y;
    }

    // выстраивает кривую линию
    updateLine() {
        const sx = this.pos1.x;
        const sy = this.pos1.y;
        const ex = this.pos2.x;
        const ey = this.pos2.y;

        let p = []

        let dx = Math.max(Math.abs(ex - sx), 0.1)

        let a = [sx + dx * 0.5, sy]
        let b = [ex - dx * 0.5, ey]

        let steps = 50

        p.push(sx, sy, 0)
        for (let i = 1; i < steps; i++) {
            let t = i / steps
            let x1 = sx + (a[0] - sx) * t
            let y1 = sy + (a[1] - sy) * t
            let x2 = a[0] + (b[0] - a[0]) * t
            let y2 = a[1] + (b[1] - a[1]) * t
            let x3 = b[0] + (ex - b[0]) * t
            let y3 = b[1] + (ey - b[1]) * t

            let x4 = x1 + (x2 - x1) * t
            let y4 = y1 + (y2 - y1) * t
            let x5 = x2 + (x3 - x2) * t
            let y5 = y2 + (y3 - y2) * t

            let x6 = x4 + (x5 - x4) * t
            let y6 = y4 + (y5 - y4) * t

            p.push(x6, y6, 0);
        }
        p.push(ex, ey, 0);

        const geometry = new LineGeometry()
        geometry.setPositions(p);
        this.line.geometry = geometry;
    }

    saveConnectors(){
        this.line.userData.connector1 = this.connector1;
        this.line.userData.connector2 = this.connector2;
    }

    forgetConnectors(){
        this.line.userData.connector1 = null;
        this.line.userData.connector2 = null;
    }
}