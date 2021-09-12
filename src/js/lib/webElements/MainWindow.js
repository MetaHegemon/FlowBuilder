import '../../../css/main_window.css';

export class MainWindow{
    constructor(){
        this.window = null;
        this.canvas = null;
    }

    createWindow (width, height){
        this.window = document.createElement('div', );
        this.window.classList.add('main-window');
        this.window.style.width = '100%';
        this.window.style.height = '100%';

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