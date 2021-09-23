//1.create window element

//2.preloader: {
    //2.1read data
    //2.2load assets
    //2.3create scene
    //2.4fill scene by objects
    //2.5setup events
//}

//3.show

window.clog = console.log.bind(console);

import '../css/main.css';
import MainWindow from './lib/webElements/MainWindow';
import SceneControl from "./lib/three/SceneControl";
import NodeControl from "./lib/three/NodeControl";
import Interactive from "./lib/interactive/Interactive";
import flowData from './InputData';
import FBS from './lib/FlowBuilderStore';

const mainWindow = new MainWindow();
mainWindow.createWindow(document.documentElement.clientWidth, document.documentElement.clientHeight);
document.body.append(mainWindow.getWindow());

const sceneControl = new SceneControl(mainWindow.getCanvas());
FBS.scene = sceneControl.getScene();
FBS.camera = sceneControl.getCamera();
FBS.renderer = sceneControl.getRenderer();
FBS.canvas = sceneControl.getCanvas();
FBS.renderLoops = sceneControl.getRenderLoops();

const nodeControl = new NodeControl();
nodeControl.buildNodes(flowData.nodes);
const nodes = nodeControl.getNodes();
sceneControl.addObjectsToScene(nodes);

new Interactive();

//3
sceneControl.run();