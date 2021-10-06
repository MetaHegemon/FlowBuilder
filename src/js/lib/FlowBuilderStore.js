import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Dom from './webElements/Dom';
import SceneControl from "./three/SceneControl";
import LineControl from './interactive/LineControl';
import NodeControl from './three/NodeControl';
import NodeAssets from './three/NodeAssets';


//TODO possibly remove node and line controls
export default {
    nodeAssets: new NodeAssets(),
    tween: TWEEN,
    dom:     new Dom(),
    sceneControl:   new SceneControl(),
    lineControl:    new LineControl(),
    nodeControl:    new NodeControl()
}