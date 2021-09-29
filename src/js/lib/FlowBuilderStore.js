import Dom from './webElements/Dom';
import ThemesControl from "./../themes/ThemesControl";
import SceneControl from "./three/SceneControl";
import LineControl from './interactive/LineControl';
import NodeControl from './three/NodeControl';

export default {
    themesControl:  new ThemesControl('light'),
    dom:     new Dom(),
    sceneControl:   new SceneControl(),
    lineControl:    new LineControl(),
    nodeControl:    new NodeControl(),
    theme:          null
}