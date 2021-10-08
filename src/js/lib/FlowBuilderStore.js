/**
 * Модель для быстрого доступа к постоянным модулям системы
 */

import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Dom from './webElements/Dom';
import SceneControl from "./three/SceneControl";

export default {
    tween: TWEEN,
    dom:     new Dom(),
    sceneControl:   new SceneControl(),
}