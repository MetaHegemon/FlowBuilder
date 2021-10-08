import NodeControl from './../lib/three/NodeControl';
import LineControl from "../lib/three/LineControl";
import C from './../lib/Constants';
import light from './light';
import dark from "./dark";

class ThemeControl {
    constructor(themeName){
        this.theme = this.getCurrentTheme(themeName);
    }

    getCurrentTheme(themeName) {
        let result = light;
        if(themeName === 'light'){
            result = light;
        } else if(themeName === 'dark'){
            result = dark;
        }

        return result;
    }

    switch(){
        if(this.theme === light){
            this.theme = dark;
        } else {
            this.theme = light;
        }
    }

    update(FBS){
        FBS.dom.updateTheme();
        FBS.sceneControl.updateTheme();
        NodeControl.updateTheme();

        //update for line must be after nodes
        LineControl.updateTheme();
    }
}

const themesControl = new ThemeControl(C.defaultTheme);

export default themesControl;