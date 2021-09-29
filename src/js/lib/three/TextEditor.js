import FBS from "../FlowBuilderStore";
import * as THREE from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import C from './../Constants';

export default class {
    constructor(){
        this.active = false;
        this.textMesh = null;
        this.handler = (e) => this.onKeyUp(e);
        this.originTextStore = null;
        this.lettersCode = [
            "KeyQ",
            "KeyW",
            "KeyE",
            "KeyR",
            "KeyT",
            "KeyY",
            "KeyU",
            "KeyI",
            "KeyO",
            "KeyP",
            "BracketLeft",
            "BracketRight",
            "KeyA",
            "KeyS",
            "KeyD",
            "KeyF",
            "KeyG",
            "KeyH",
            "KeyJ",
            "KeyK",
            "KeyL",
            "Semicolon",
            "Quote",
            "Backslash",
            "KeyZ",
            "KeyX",
            "KeyC",
            "KeyV",
            "KeyB",
            "KeyN",
            "KeyM",
            "Comma",
            "Period",
            "Slash",
            "Backquote"
        ];
        this.numbersCode = [
            "Digit0",
            "Digit1",
            "Digit2",
            "Digit3",
            "Digit4",
            "Digit5",
            "Digit6",
            "Digit7",
            "Digit8",
            "Digit9",
            "Numpad0",
            "Numpad1",
            "Numpad2",
            "Numpad3",
            "Numpad4",
            "Numpad5",
            "Numpad6",
            "Numpad7",
            "Numpad8",
            "Numpad9"
        ];
        this.symbolsCode = [
            "NumpadAdd",
            "NumpadSubtract",
            "NumpadMultiply",
            "NumpadDivide",
            "Minus",
            "Equal",
            "Space"
        ];
        this.allCode = [...this.lettersCode, ...this.numbersCode, ...this.symbolsCode];
        this.caret = 'I';
        this.tween = null;
    }

    enable(textMesh) {
        this.active = true;
        this.textMesh = textMesh;
        this.originTextStore = this.textMesh.text;
        textMesh.text += this.caret;
        this.switchOnAnimate(this.textMesh);

        document.addEventListener('keyup', this.handler, false);
    }

    switchOnAnimate(textMesh){
        let range;
        const color = new THREE.Color().setStyle(textMesh.color);
        const defaultHex = color.getHex();

        const end = {r: color.r, g: color.g, b: color.b};

        color.setStyle(FBS.theme.scene.backgroundColor);
        const start = {r: color.r, g: color.g, b: color.b};

        this.tween = new TWEEN.Tween(start)
            .to(end, C.animation.caretBlinkingTime)
            .repeat(Infinity)
            .yoyo(true)
            .onUpdate(function () {
                color.r = start.r;
                color.g = start.g;
                color.b = start.b;

                const caretIndex = textMesh.text.length-1;
                range = {};
                range[0] = defaultHex;
                range[caretIndex] = color.getHex();
                textMesh.colorRanges = range;
            })
            .start();
    }

    onKeyUp(e){
        if(e.code === 'Backspace'){
            this.textMesh.text = this.textMesh.text.substr(0, this.textMesh.text.length - 2) + this.caret;
        } else if(e.code === 'Enter'){
            if(this.textMesh.text === this.caret){
                this.returnOriginText();
            } else {
                this.textMesh.text = this.textMesh.text.substr(0, this.textMesh.text.length - 1);
                this.disable();
            }
        } else if(e.code === 'Escape'){
            this.textMesh.text = this.originTextStore;
            this.disable();
        } else if (this.checkKeyCodeOnAllow(e.code)){
            this.textMesh.text = this.textMesh.text.substr(0, this.textMesh.text.length - 1) + e.key + this.caret;
        }
    }

    checkKeyCodeOnAllow(code){
        return this.allCode.some(c=>{
            return code === c;
        });
    }

    disable(){
        this.tween.stop();
        this.textMesh.colorRanges = null;
        this.tween = null;
        this.active = false;
        this.textMesh = null;
        document.removeEventListener('keyup', this.handler, false);
    }

    returnOriginText(){
        this.tween.stop();
        this.textMesh.colorRanges = null;
        const _this = this;
        this.textMesh.text = this.originTextStore;

        const color = new THREE.Color().setStyle(this.textMesh.color);
        const start = {r: color.r, g: color.g, b: color.b};

        const end = {r: 1, g: 0, b: 0};

        new TWEEN.Tween(start)
            .to(end, C.animation.failEditingTextTime)
            .repeat(1)
            .yoyo(true)
            .easing( FBS.tween.Easing.Bounce.Out )
            .onUpdate(function () {
                color.r = start.r;
                color.g = start.g;
                color.b = start.b;

                _this.textMesh.color = '#'+color.getHexString();
            })
            .onComplete(()=>{
                _this.disable();
            })
            .start();
    }
}