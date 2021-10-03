import '../../../css/main_window.css';
import ThemeControl from './../../themes/ThemeControl';


export default class {
    constructor(){
        this.window = null;
        this.canvas = null;
    }

    createWindow (width, height){
        this.window = document.createElement('div', );
        this.window.classList.add('main-window');
        this.createCanvas(width, height);

        this.updateTheme();
        this.window.append(this.canvas);
    }

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