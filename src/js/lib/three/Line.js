import * as THREE from 'three';
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {Line2} from "three/examples/jsm/lines/Line2";
import C from './../Constants';

export default class {
    constructor(){
        this.geometry = new LineGeometry();
        this.mLine = this.create();

        this.cPort1 = null;
        this.cPort2 = null;

        this.pos1 = new THREE.Vector2();
        this.pos2 = new THREE.Vector2();

        this.isPort1Collapsed = false;
        this.isPort2Collapsed = false;
    }

    create(){
        this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
        const material = new LineMaterial({
            color: C.nodeMesh.line.color,
            linewidth: C.lines.lineWidth
        });
        const mLine = new Line2(this.geometry, material);
        mLine.name = 'line';
        mLine.userData.selected = false;

        mLine.userData.class = this;

        return mLine;
    }

    select = () => {
        this.mLine.userData.selected = true;
        this.mLine.material.color.setStyle(C.nodeMesh.line.selectedColor);
    }

    unselect = () => {
        this.mLine.userData.selected = false;
        this.mLine.material.color.setStyle(C.nodeMesh.line.color);
    }

    setCPort1(cPort){
        this.cPort1 = cPort;
    }

    setCPort2(cPort){
        this.cPort2 = cPort;
    }

    getCPort1(){
        return this.cPort1;
    }

    getCPort2(){
        return this.cPort2;
    }

    getMLine(){
        return this.mLine;
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

        let p = [];

        let dx = Math.max(Math.abs(ex - sx), 0.1);

        let a = [sx + dx * 0.5, sy];
        let b = [ex - dx * 0.5, ey];

        let steps = C.lines.segments;

        p.push(sx, sy, 0);
        for (let i = 1; i < steps; i++) {
            let t = i / steps;
            let x1 = sx + (a[0] - sx) * t;
            let y1 = sy + (a[1] - sy) * t;
            let x2 = a[0] + (b[0] - a[0]) * t;
            let y2 = a[1] + (b[1] - a[1]) * t;
            let x3 = b[0] + (ex - b[0]) * t;
            let y3 = b[1] + (ey - b[1]) * t;

            let x4 = x1 + (x2 - x1) * t;
            let y4 = y1 + (y2 - y1) * t;
            let x5 = x2 + (x3 - x2) * t;
            let y5 = y2 + (y3 - y2) * t;

            let x6 = x4 + (x5 - x4) * t;
            let y6 = y4 + (y5 - y4) * t;

            p.push(x6, y6, 0);
        }
        p.push(ex, ey, 0);

        const geometry = new LineGeometry();
        geometry.setPositions(p);
        this.mLine.geometry = geometry;
    }

    collapsedPort1(){
        this.isPort1Collapsed = true;
        this.setColor(C.nodeMesh.portTypes.pseudo.connectorColor);
    }

    collapsedPort2(){
        this.isPort2Collapsed = true;
        this.setColor(C.nodeMesh.portTypes.pseudo.connectorColor);
    }

    unCollapsedPort1(){
        this.isPort1Collapsed = false;
        if(!this.isPort2Collapsed){
            this.resetColor();
        }
    }

    unCollapsedPort2(){
        this.isPort2Collapsed = false;
        if(!this.isPort1Collapsed){
            this.resetColor();
        }
    }

    setColor(colorStyle){
        this.mLine.material.color.setStyle(colorStyle);
    }

    resetColor(){
        this.mLine.material.color.setStyle(this.cPort1.getColor());
    }


}