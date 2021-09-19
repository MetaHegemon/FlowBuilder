import '../../../css/main_window.css';
import C from './../Constants';

export default class {
    constructor(){
        this.window = null;
        this.canvas = null;
    }

    createWindow (width, height){
        this.window = document.createElement('div', );
        this.window.classList.add('main-window');
        this.window.style.backgroundColor = C.scene.backgroundColor;

        this.createCanvas(width, height);

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
}