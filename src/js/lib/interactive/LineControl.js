import Line from '../three/Line';

export default class{
    constructor() {
        this.active = false;
        this.scene = null;
        this.cLine = null;
    }

    enable(mConnector) {
        this.active = true;
        const cPort1 = mConnector.userData.portClass;
        const lines = cPort1.cLines;
        if(cPort1.direction === 'input' && lines.length > 0){
            this.cLine = cPort1.cLines[0];
            this.cLine.setCPort2(null);
            cPort1.cLines = [];
        } else {
            this.cLine = new Line();
            this.cLine.setCPort1(cPort1);
        }
        const mesh = this.cLine.getMLine();

        this.cLine.setColor(cPort1.getColor());
        this.scene.add(mesh);
    }

    disable(){
        this.active = false;
        this.scene.remove(this.cLine.getMLine());
    }

    setScene(scene){
        this.scene = scene;
    }

    drawLineFromPos(ex, ey){
        const cPort1 = this.cLine.getCPort1();
        const pos = cPort1.getConnectorPos();

        if(cPort1.direction === 'input'){
            this.cLine.setPos1(ex, ey);
            this.cLine.setPos2(pos.x, pos.y);
            this.cLine.updateLine();
        } else {
            this.cLine.setPos1(pos.x, pos.y);
            this.cLine.setPos2(ex, ey);
            this.cLine.updateLine();
        }
    }

    // обновляет линии
    refreshLines(mNode) {
        const cNode = mNode.userData.nodeClass;
        const cPorts = cNode.getAllCPorts();

        for(let i = 0; i < cPorts.length; i += 1){
            const pos = cPorts[i].getConnectorPos();
            const cLines = cPorts[i].cLines;
            for(let j = 0; j < cLines.length; j += 1){
                if(cPorts[i].direction === 'output'){
                    cLines[j].setPos1(pos.x, pos.y);
                    cLines[j].updateLine();
                } else {
                    cLines[j].setPos2(pos.x, pos.y);
                    cLines[j].updateLine();
                }
            }
        }
    }

    canBeConnected(mConnector2){
        let result = false;
        const cPort1 = this.cLine.getCPort1();
        const cPort2 = mConnector2.userData.portClass;

        const cNode1 = cPort1.getCNode();
        const cNode2 = cPort2.getCNode();

        if(
            cNode1 !== cNode2 &&
            cPort1.direction !== cPort2.direction &&
            cPort1.data.type === cPort2.data.type &&
            !(cPort2.direction === 'input' && cPort2.cLines.length > 0)
        ){
            result = true;
        }

        return result;
    }

    canBeSelected(mLine){
        let result = true;
        const cLine = mLine.userData.class;
        if(cLine.isPort1Collapsed || cLine.isPort2Collapsed){
            result = false;
        }
        return result;
    }

    connect(mConnector2){
        this.active = false;
        let pos1, pos2;
        const cPort1 = this.cLine.getCPort1();
        const cPort2 = mConnector2.userData.portClass;

        //set output connector as first
        if(cPort1.direction === 'output'){
            this.cLine.setCPort1(cPort1);
            this.cLine.setCPort2(cPort2);
            pos1 = cPort1.getConnectorPos();
            pos2 = cPort2.getConnectorPos();
        } else {
            this.cLine.setCPort1(cPort2);
            this.cLine.setCPort2(cPort1);
            pos1 = cPort2.getConnectorPos();
            pos2 = cPort1.getConnectorPos();
        }
        this.cLine.setPos1(pos1.x, pos1.y);
        this.cLine.setPos2(pos2.x, pos2.y);
        this.cLine.updateLine();

        cPort1.cLines.push(this.cLine);
        cPort2.cLines.push(this.cLine);
    }
}