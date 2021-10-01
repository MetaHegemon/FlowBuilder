window.clog = console.log.bind(console);

import '../css/main.css';
import Theme from './themes/Theme';
import FBS from './lib/FlowBuilderStore';
import Interactive from "./lib/interactive/Interactive";
import flowData from './InputData';


FBS.dom.createWindow(document.documentElement.clientWidth, document.documentElement.clientHeight);
document.body.append(FBS.dom.getWindow());
FBS.sceneControl.setScene();


FBS.nodeControl.buildNodes(flowData.nodes);
FBS.sceneControl.addObjectsToScene(FBS.nodeControl.getMNodes());

new Interactive();

FBS.sceneControl.run();