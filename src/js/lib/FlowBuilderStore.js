/**
 * Модель для быстрого доступа к постоянным модулям системы
 */

import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Dom from './webElements/Dom';
import SceneControl from "./three/SceneControl";
import NodeAssets from './three/NodeAssets';


//TODO possibly remove node and line controls
export default {
    nodeAssets: new NodeAssets(),
    tween: TWEEN,
    dom:     new Dom(),
    sceneControl:   new SceneControl(),
}