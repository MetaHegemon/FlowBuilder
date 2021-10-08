/**
 * Модуль для работы с DOM и html-элементами
 */
import '../../../css/main_window.css';
import ThemeControl from './../../themes/ThemeControl';


export default class {
    constructor(){
        this.window = null;     //ссылка на html контейнер для канваса
        this.canvas = null;     //ссылка на канвас для рендеринга
    }

    /**
     * Создание контейнера для рендера threejs
     * @param width {number}
     * @param height {number}
     */
    createWindow (width, height){
        this.window = document.createElement('div', );
        this.window.classList.add('main-window');
        this.createCanvas(width, height);

        this.updateTheme();
        this.window.append(this.canvas);
    }

    /**
     * Создание канваса для рендера
     * @param width {number}
     * @param height {number}
     */
    createCanvas (width, height){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
    }

    getWindow (){
        return this.window;
    }

    getCanvas (){
        return this.canvas;
    }

    updateTheme(){
        this.window.style.backgroundColor = ThemeControl.theme.scene.backgroundColor;
    }
}