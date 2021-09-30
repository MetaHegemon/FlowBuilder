import * as THREE from 'three';
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {Line2} from "three/examples/jsm/lines/Line2";
import C from './../Constants';
import FBS from "../FlowBuilderStore";

export default class {
    constructor(){
        this.cPort1 = null;
        this.cPort2 = null;
        this.selected = false;

        this.pos1 = new THREE.Vector2();
        this.pos2 = new THREE.Vector2();

        this.isPort1Collapsed = false;
        this.isPort2Collapsed = false;

        this.watchPoint = null;

        this.geometry = new LineGeometry();
        this.mesh = this.create();

    }

    create(){
        this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
        const material = new LineMaterial({
            color: FBS.theme.line.colorOnActive,
            linewidth: C.lines.lineWidth
        });

        const mesh = new Line2(this.geometry, material);
        mesh.name = 'line';
        mesh.userData.class = this;

        return mesh;
    }

    connect(cPort2){
        let pos1, pos2;

        //set output connector as first
        if(this.cPort1.direction === 'output'){
            this.setCPort1(this.cPort1);
            this.setCPort2(cPort2);
            pos1 = this.cPort1.getConnectorPos();
            pos2 = this.cPort2.getConnectorPos();

            this.setColor(this.cPort1.getColor());
        } else {
            this.setCPort2(this.cPort1);
            this.setCPort1(cPort2);

            pos1 = this.cPort1.getConnectorPos();
            pos2 = this.cPort2.getConnectorPos();

            this.setColor(this.cPort2.getColor());
        }
        this.setPos1(pos1.x, pos1.y);
        this.setPos2(pos2.x, pos2.y);
        this.updateLine();

        this.cPort1.cLines.push(this);
        this.cPort2.cLines.push(this);

        this.createWatchPoint();
    }

    createWatchPoint(){
        const group = new THREE.Group();
        group.name = 'watchPoint';

        const pointer = new THREE.Mesh(
            new THREE.CircleBufferGeometry(8, 32),
            new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
        );
        pointer.name = 'watchPointPointer';
        pointer.userData.class = this;

        group.add(pointer);

        const bigCircle = new THREE.Mesh(
            new THREE.CircleBufferGeometry(6, 32),
            new THREE.MeshBasicMaterial()
        );
        bigCircle.name = 'watchPointBig';
        bigCircle.material.color = this.mesh.material.color;
        bigCircle.userData.class = this;

        group.add(bigCircle);

        const smallCircle = new THREE.Mesh(
            new THREE.CircleBufferGeometry(3, 32),
            new THREE.MeshBasicMaterial({color: FBS.theme.scene.backgroundColor})
        );
        smallCircle.name = 'watchPointSmall';
        smallCircle.userData.class = this;

        group.add(smallCircle);

        group.userData.class = this;

        this.watchPoint = group;

        this.updateWatchPointPosition()

        this.mesh.parent.add(this.watchPoint);
    }

    getPositionForWatchPoint(){
        //TODO may be optimized
        const pos = {x: 0, y: 0, z: 0};

        const progress = C.lines.segments/100 * C.lines.watchPointPosition; //point on line
        const instanceStart = this.mesh.geometry.getAttribute('instanceStart').data;
        const points = instanceStart.array;

        pos.x = points[progress * instanceStart.stride];
        pos.y = points[progress * instanceStart.stride + 1];
        pos.z = points[progress * instanceStart.stride + 2];

        return pos;
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
        return this.mesh;
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
    //TODO удалить все объявления переменных
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

        this.mesh.geometry = geometry;

        this.updateWatchPointPosition();
    }

    updateWatchPointPosition(){
        if(!this.watchPoint) return null;

        const pos = this.getPositionForWatchPoint();
        this.watchPoint.position.set(pos.x, pos.y, pos.z);
    }

    collapsedPort1(){
        if(this.selected){
            this.unselect();
        }
        this.isPort1Collapsed = true;
        this.setColor(FBS.theme.node.portTypes.pseudo.connectorColor);

    }

    collapsedPort2(){
        if(this.selected){
            this.unselect();
        }
        this.isPort2Collapsed = true;
        this.setColor(FBS.theme.node.portTypes.pseudo.connectorColor);
    }

    unCollapsedPort1(){
        this.isPort1Collapsed = false;
        if(!this.isPort2Collapsed){
            this.resetColor();
            //this.cPort1.resetConnectorColor();
        }
    }

    unCollapsedPort2(){
        this.isPort2Collapsed = false;
        if(!this.isPort1Collapsed){
            this.resetColor();
            //this.cPort2.resetConnectorColor();
        }

    }

    setColor(colorStyle){
        this.mesh.material.color.setStyle(colorStyle);
    }

    resetColor(){
        this.mesh.material.color.setStyle(this.cPort1.getColor());
    }

    select(){
        if(!this.selected) {
            this.selected = true;
            this.mesh.material.color.setStyle(FBS.theme.line.selectedColor);
            this.cPort1.selectConnector();
            this.cPort2.selectConnector();
        }
    }

    unselect(){
        clog("unsel");
        if(this.selected) {
            this.selected = false;
            this.mesh.material.color.setStyle(this.cPort1.getColor());
            this.cPort1.unselectConnector();
            this.cPort2.unselectConnector();
        }
    }

    remove(){
        FBS.sceneControl.removeFromScene(this.mesh);
        if(this.cPort1) this.cPort1.unselectConnector();
        if(this.cPort1) this.cPort1.removeCLine(this);
        if(this.cPort2) this.cPort2.unselectConnector();
        if(this.cPort2) this.cPort2.removeCLine(this);
        //TODO need dispose
    }

    updateTheme(){
        if(this.selected){
            this.setColor(FBS.theme.line.selectedColor);
            this.cPort1.selectConnector();
            this.cPort2.selectConnector();
        } else {
            if(this.isPort1Collapsed || this.isPort2Collapsed){
                this.setColor(FBS.theme.node.portTypes.pseudo.connectorColor);
            } else {
                this.setColor(this.cPort1.getColor());
            }
        }
    }
}