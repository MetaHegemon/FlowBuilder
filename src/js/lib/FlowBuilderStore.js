import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Dom from './webElements/Dom';
import SceneControl from "./three/SceneControl";
import LineControl from './interactive/LineControl';
import NodeControl from './three/NodeControl';
import AnimationControl from "./three/AnimationControl";
import NodeAssets from './three/NodeAssets';
import MaterialControl from "./three/MaterialControl";


//TODO possibly remove node and line controls
export default {
    nodeAssets: new NodeAssets(),
    materialControl: new MaterialControl(),
    tween: TWEEN,
    animationControl: new AnimationControl(),
    dom:     new Dom(),
    sceneControl:   new SceneControl(),
    lineControl:    new LineControl(),
    nodeControl:    new NodeControl()
}