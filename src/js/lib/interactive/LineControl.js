import * as THREE from 'three';
import Line from '../three/Line';

export default class{
    constructor() {
        this.active = false;
        this.scene = null;
        this.line = null;
    }

    enable(connector) {
        this.active = true;
        this.line = new Line();
        this.line.setConnector1(connector);
        const mesh = this.line.getLineMesh();
        this.scene.add(mesh);
    }

    disable(){
        this.active = false;
        this.scene.remove(this.line.getLineMesh());
    }

    connect(connector2){
        this.active = false;
        let pos1, pos2;
        const connector1 = this.line.getConnector1();
        const port1 = connector1.userData.port;
        const port2 = connector2.userData.port;
        //set output connector as first
        if(port1.userData.direction === 'output'){
            this.line.setConnector1(connector1);
            this.line.setConnector2(connector2);
            pos1 = this.getPositionOfConnector(connector1);
            pos2 = this.getPositionOfConnector(connector2);
        } else {
            this.line.setConnector1(connector2);
            this.line.setConnector2(connector1);
            pos1 = this.getPositionOfConnector(connector2);
            pos2 = this.getPositionOfConnector(connector1);
        }
        this.line.setPos1(pos1.x, pos1.y);
        this.line.setPos2(pos2.x, pos2.y);
        this.line.updateLine();

/*
        this.line.setConnector2(connector2);
        const connector1 = this.line.getConnector1();
        const pos1 = this.getPositionOfConnector(connector1);
        const pos2 = this.getPositionOfConnector(connector2);
        const port1 = connector1.userData.port;
        const port2 = connector2.userData.port;

        const port1 = connector1.userData.port;
        const port2 = connector2.userData.port;

        this.line.setPos1(pos1.x, pos1.y);
        this.line.setPos2(pos2.x, pos2.y);
        this.line.updateLine();*/

        port1.userData.lines.push(Line);
        port2.userData.lines.push(Line);
    }

    canBeConnected(connector2){
        let result = false;
        const connector1 = this.line.getConnector1()
        const node1 = connector1.userData.superParent;
        const node2 = connector2.userData.superParent;
        const port1 = connector1.userData.port;
        const port2 = connector2.userData.port;

        if(node1 !== node2 && port1.userData.direction !== port2.userData.direction && port1.userData.data.type === port2.userData.data.type){
            result = true;
        }

        return result;
    }

    getPositionOfConnector(connector){
        const pos = new THREE.Vector3();
        connector.getWorldPosition(pos);
        return pos;
    }

    setScene(scene){
        this.scene = scene;
    }

    drawLineFromConnector(ex, ey){
        const connector1 = this.line.getConnector1();
        const port1 = connector1.userData.port;

        const pos = this.getPositionOfConnector(connector1);
        if(port1.userData.direction === 'input'){
            this.line.setPos1(ex, ey);
            this.line.setPos2(pos.x, pos.y);
            this.line.updateLine();
        } else {
            this.line.setPos1(pos.x, pos.y);
            this.line.setPos2(ex, ey);
            this.line.updateLine();
        }
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