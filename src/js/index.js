window.clog = console.log.bind(console);

import '../css/main.css';
import NodeControl from "./lib/three/node/NodeControl";
import FBS from './lib/FlowBuilderStore';
import Interactive from "./lib/interactive/Interactive";
import flowData from './InputData';

//
FBS.dom.createWindow(document.documentElement.clientWidth, document.documentElement.clientHeight);
document.body.append(FBS.dom.getWindow());
FBS.sceneControl.setScene();

NodeControl.init();
NodeControl.buildNodes(flowData.nodes);
FBS.sceneControl.addObjectsToScene(NodeControl.get3dObjects());

Interactive.init()

FBS.sceneControl.run();