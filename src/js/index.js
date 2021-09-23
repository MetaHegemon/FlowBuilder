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
import LineControl from './../js/lib/interactive/LineControl';
import FBS from './lib/FlowBuilderStore';

const mainWindow = new MainWindow();
mainWindow.createWindow(document.documentElement.clientWidth, document.documentElement.clientHeight);
document.body.append(mainWindow.getWindow());

FBS.sceneControl = new SceneControl(mainWindow.getCanvas());
FBS.scene = FBS.sceneControl.getScene();
FBS.camera = FBS.sceneControl.getCamera();
FBS.renderer = FBS.sceneControl.getRenderer();
FBS.canvas = FBS.sceneControl.getCanvas();
FBS.renderLoops = FBS.sceneControl.getRenderLoops();

FBS.lineControl = new LineControl();

FBS.nodeControl = new NodeControl();
FBS.nodeControl.buildNodes(flowData.nodes);
FBS.sceneControl.addObjectsToScene(FBS.nodeControl.getMNodes());

new Interactive();

//3
FBS.sceneControl.run();