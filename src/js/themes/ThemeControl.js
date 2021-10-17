/**
 * Модуль управления темами
 *
 */

import C from './../lib/Constants';
import light from './light';
import dark from "./dark";

class ThemeControl {
    constructor(themeName){
        this.theme = this.getCurrentTheme(themeName);
    }

    /**
     * Выдаёт объект темы по имени
     * @param themeName {String}
     * @returns {Object}
     */
    getCurrentTheme(themeName) {
        let result = light;
        if(themeName === 'light'){
            result = light;
        } else if(themeName === 'dark'){
            result = dark;
        }

        return result;
    }

    /**
     * Переключение темы
     */
    switch(){
        if(this.theme === light){
            this.theme = dark;
        } else {
            this.theme = light;
        }
    }

    /**
     * Обновление темы
     * @param dom
     * @param sceneControl
     * @param nodeControl
     * @param lineControl
     * @param nodeMenu
     */
    update(dom, sceneControl, nodeControl, lineControl, nodeMenu){
        dom.updateTheme();
        sceneControl.updateTheme();
        nodeControl.updateTheme();

        //т.к. цвет линии по умолчанию - это цвет порта, ноды нужно обновить до линий
        lineControl.updateTheme();

        nodeMenu.updateTheme();
    }
}

const themesControl = new ThemeControl(C.defaultTheme);

export default themesControl;