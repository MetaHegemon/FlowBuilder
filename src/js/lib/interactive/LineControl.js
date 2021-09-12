import * as THREE from 'three';
import {Line2} from 'three/examples/jsm/lines/Line2';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial';

export default class{
    constructor() {
        this.active = false;
        this.scene = null;
        this.direction = null;
        this.geometry = new LineGeometry();
        this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
        this.material = new LineMaterial({color: 0x2a2a2a, linewidth: 0.002});
        this.line = new Line2(this.geometry, this.material);

        this.connector1 = null;
        this.connector1Pos = new THREE.Vector3();
        this.connector2 = null;
        this.connector2Pos = new THREE.Vector3();



        this.lineData = null;
    }

    enable(connector) {
        clog(connector);
        this.active = true;
        this.connector1 = connector;
        this.connector1.getWorldPosition(this.connector1Pos);
        this.scene.add(this.line);
    }

    disable(){
        this.active = false;
        this.scene.remove(this.line);
        this.line.geometry = new LineGeometry();
    }

    setScene(scene){
        this.scene = scene;
    }

    drawLineFromConnector(ex, ey){
        if(this.connector1.userData.direction === 'input'){
            this.updateLine(ex, ey, this.connector1Pos.x, this.connector1Pos.y);
        } else {
            this.updateLine(this.connector1Pos.x, this.connector1Pos.y, ex, ey);
        }
    }
    // выстраивает кривую линию
    updateLine(sx, sy, ex, ey) {

        console.log('makeCurve');
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

    // создает линии из точки входа и выхода объекта
    makeLines(b) { //по окончании
        console.log('makeLines');
        let sx = 0
        let sy = 0
        for (let i = 0; i < b.out.length; i++) {
            let a = b.out[i]
            if (a.l !== null) {
                a.l.dispose()
                a.l = null
            }
            if (a.c !== 0) {
                this.getOutPosition(b, i)
                sx = this._p[0]
                sy = this._p[1]
                let o = this.objects.get(a.c)
                this.getInPosition(o, a.n)

                a.l = this.makeCurve(sx, sy, this._p[0], this._p[1])
            }
        }
    }

    // обновляет линии
    refreshLines(b) {
        this.makeLines(b)
        for (let i = 0; i < b.in.length; i++) {
            let a = b.in[i]
            if (a.c !== 0) {
                this.makeLines(this.objects.get(a.c))
            }
        }
    }
}