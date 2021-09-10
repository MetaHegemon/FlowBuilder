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
import {MainWindow} from './lib/webElements/MainWindow';
import {SceneControl} from "./lib/three/SceneControl";
import {NodeControl} from "./lib/three/NodeControl";
import {Interactive} from "./lib/Interactive";
import flowData from './InputData';


const mainWindow = new MainWindow();
mainWindow.createWindow(document.documentElement.clientWidth, document.documentElement.clientHeight);
document.body.append(mainWindow.getWindow());



const nodeControl = new NodeControl();
nodeControl.setData(flowData.nodes);
nodeControl.buildNodes();
const nodes = nodeControl.getNodes();

const sceneControl = new SceneControl(mainWindow.getCanvas());
sceneControl.addObjectsToScene(nodes);

const interactive = new Interactive();
interactive.setSceneComponents(mainWindow.getCanvas(), sceneControl.getCamera(), sceneControl.getScene(), sceneControl.getControls());
interactive.setEvents();


//3
sceneControl.run();