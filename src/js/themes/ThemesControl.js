import FBS from './../lib/FlowBuilderStore';
import light from './light';
import dark from "./dark";

export default class {
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
        FBS.theme = this.theme;
        this.update();
    }

    update(){
        FBS.dom.updateTheme();
        FBS.sceneControl.updateTheme();
        FBS.nodeControl.updateTheme();

        //update for line must be after nodes
        FBS.lineControl.updateTheme();
    }
}