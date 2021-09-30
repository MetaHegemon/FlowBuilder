import Line from '../three/Line';
import FBS from './../FlowBuilderStore';

export default class{
    constructor() {
        this.active = false;
        this.cLine = null;
        this.allCLines = [];
    }

    enable(mConnector) {
        this.active = true;
        const cPort1 = mConnector.userData.portClass;
        const lines = cPort1.cLines;
        if(cPort1.direction === 'input' && lines.length > 0){
            this.cLine = cPort1.cLines[0];
            this.cLine.removeWatchPoint();
            this.cLine.setCPort2(null);
            cPort1.cLines = [];
        } else {
            this.cLine = new Line();
            this.cLine.setCPort1(cPort1);
        }
        const mesh = this.cLine.getMLine();

        this.cLine.setColor(FBS.theme.line.colorOnActive);

        FBS.sceneControl.addObjectsToScene([mesh]);
    }

    disable(){
        this.active = false;
        this.remove([this.cLine]);
    }

    removeFromCLinesList(cLine){
        for(let i = 0; i < this.allCLines.length; i += 1){
            if(this.allCLines[i] === cLine){
                this.allCLines.splice(i, 1);
                break;
            }
        }
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
    refreshLines(mNodes) {
        mNodes.map(mNode=> {
            const cNode = mNode.userData.nodeClass;
            const cPorts = cNode.getAllVisibleCPorts();

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
        });
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
            cPort2.connectorActive &&
            cPort2.type !== 'pseudo' &&
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
        this.cLine.connect(mConnector2.userData.portClass);
        this.allCLines.push(this.cLine);
    }

    updateTheme(){
        this.allCLines.map(cLine=>{
            cLine.updateTheme();
        });
    }

    remove(cLines){
        cLines.map(cL => {
            cL.remove();
            this.removeFromCLinesList(cL);
        });
    }
}