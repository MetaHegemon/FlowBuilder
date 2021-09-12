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
        const port = connector.userData.port;
        const lines = port.userData.lines;
        if(port.userData.direction === 'input' && lines.length > 0){
            this.line = port.userData.lines[0];
            this.line.setConnector2(null);
            port.userData.lines = [];
        } else {
            this.line = new Line();
            this.line.setConnector1(connector);
            this.line.forgetConnectors();
        }
        const mesh = this.line.getLineMesh();
        this.scene.add(mesh);
    }

    disable(){
        this.active = false;
        this.scene.remove(this.line.getLineMesh());
    }

    removeLineForInputPort(port){
        if(port.userData.direction === 'input'){
            for(let i = 0; i < port.userData.lines.length; i += 1) {
                this.scene.remove(port.userData.lines[i].getLineMesh());
            }
            port.userData.lines = [];
        }
    }

    getPositionOfConnector(connector){
        const pos = new THREE.Vector3();
        connector.getWorldPosition(pos);
        return pos;
    }

    setScene(scene){
        this.scene = scene;
    }

    drawLineFromPos(ex, ey){
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

    // обновляет линии
    refreshLines(object) {
        const inPorts = object.userData.inPorts;
        const outPorts = object.userData.outPorts;
        const ports = [...inPorts, ...outPorts];

        for(let i = 0; i < ports.length; i += 1){
            const connector = ports[i].userData.connector;
            const pos = new THREE.Vector3();
            connector.getWorldPosition(pos);
            const lines = ports[i].userData.lines;
            for(let j = 0; j < lines.length; j += 1){
                if(ports[i].userData.direction === 'output'){
                    lines[j].setPos1(pos.x, pos.y);
                    lines[j].updateLine();
                } else {
                    lines[j].setPos2(pos.x, pos.y);
                    lines[j].updateLine();
                }
            }
        }
    }

    canBeConnected(connector2){
        let result = false;
        const connector1 = this.line.getConnector1()
        const node1 = connector1.userData.superParent;
        const node2 = connector2.userData.superParent;
        const port1 = connector1.userData.port;
        const port2 = connector2.userData.port;

        if(
            node1 !== node2 &&
            port1.userData.direction !== port2.userData.direction &&
            port1.userData.data.type === port2.userData.data.type &&
            !(port2.userData.direction === 'input' && port2.userData.lines.length > 0)
        ){
            result = true;
        }

        return result;
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

        port1.userData.lines.push(this.line);
        port2.userData.lines.push(this.line);

        this.line.saveConnectors();
    }
}