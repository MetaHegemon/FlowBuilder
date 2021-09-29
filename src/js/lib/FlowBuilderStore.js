import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Dom from './webElements/Dom';
import ThemesControl from "./../themes/ThemesControl";
import SceneControl from "./three/SceneControl";
import LineControl from './interactive/LineControl';
import NodeControl from './three/NodeControl';
import AnimationControl from "./three/AnimationControl";


//TODO possibly remove node and line controls
export default {
    tween: TWEEN,
    themesControl:  new ThemesControl('light'),
    animationControl: new AnimationControl(),
    dom:     new Dom(),
    sceneControl:   new SceneControl(),
    lineControl:    new LineControl(),
    nodeControl:    new NodeControl(),
    theme:          null
}