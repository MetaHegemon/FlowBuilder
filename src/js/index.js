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

//1
const mainWindow = new MainWindow();
mainWindow.createWindow(document.documentElement.clientWidth, document.documentElement.clientHeight);
document.body.append(mainWindow.getWindow());

//2

//2.1
const flowData = {
    nodes: [
        {
            name: 'Math.E',
            code: 'function(){return Math.E;}',
            inputs: [],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float'
                }
            ],
            position: {
                x: -200,
                y: -200
            }
        },
        {
            name: 'Math.PI',
            code: 'function(){return Math.PI;}',
            inputs: [],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float'
                }
            ],
            position: {
                x: -200,
                y: 200
            }
        },
        {
            name: 'addition',
            code: 'function(x,y){return x+y;}',
            inputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float'
                },
                {
                    id: 1,
                    name: 'float',
                    type: 'float'
                }
            ],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float'
                }
            ],
            position: {
                x: 0,
                y: 0
            }
        },
        {
            name: 'Math.floor',
            code: 'function(x){return Math.floor(x);}',
            inputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float'
                },
                {
                    id: 1,
                    name: 'float',
                    type: 'float'
                }
            ],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float'
                }
            ],
            position: {
                x: 200,
                y: 0
            }
        },
    ]
};

const sceneControl = new SceneControl(mainWindow.getCanvas());


const nodeControl = new NodeControl();
nodeControl.setData(flowData.nodes);
nodeControl.buildNodes();
const nodes = nodeControl.getNodes();

sceneControl.addObjectsToScene(nodes);



//3
sceneControl.run();