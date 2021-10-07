/*
Класс управления редактированием заголовка ноды
 */

import ThemeControl from './../../themes/ThemeControl';
import FBS from "../FlowBuilderStore";
import * as THREE from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import C from './../Constants';

export default class {
    constructor(){
        this.active = false;
        this.textMesh = null;                  //ссылка на редактируемый 3д-объект
        this.handler = (e) => this.onKeyUp(e);
        this.originTextStore = null;           //буфер сохранения старого значения в заголовке
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
        ];              //список допустимых кодов-букв
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
        ];              //список допустимых кодов-цифр
        this.symbolsCode = [
            "NumpadAdd",
            "NumpadSubtract",
            "NumpadMultiply",
            "NumpadDivide",
            "Minus",
            "Equal",
            "Space"
        ];              //список допустимых кодов-символов
        this.allCode = [...this.lettersCode, ...this.numbersCode, ...this.symbolsCode]; //полный список допустимых знаков
        this.caret = '|';                      //символ каретки
        this.tween = null;                     //ссылка на класс аниматора мигания каретки, для остановки по требованию
    }

    /**
     * Включение редактирования текста
     * @param textMesh {Text}
     */
    enable(textMesh) {
        this.active = true;
        this.textMesh = textMesh;
        this.originTextStore = this.textMesh.text;
        textMesh.text += this.caret;
        //включение анимации каретки
        this.switchOnAnimate(this.textMesh);

        document.addEventListener('keyup', this.handler, false);
    }

    /**
     * Включение анимации каретки
     * @param textMesh
     */
    switchOnAnimate(textMesh){
        let range;
        const color = new THREE.Color().setStyle(textMesh.color);
        const defaultHex = color.getHex();

        const end = {r: color.r, g: color.g, b: color.b};

        //каретка мигает от цвета фона сцены к цвету заголовка
        color.setStyle(ThemeControl.theme.scene.backgroundColor);
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

    /**
     * Обработчик нажатия клавиши
     * @param e
     */
    onKeyUp(e){
        if(e.code === 'Backspace'){
            //удаление последнего символа
            this.textMesh.text = this.textMesh.text.substr(0, this.textMesh.text.length - 2) + this.caret;
        } else if(e.code === 'Enter'){
            //применение новой записи
            this.accept();
        } else if(e.code === 'Escape'){
            //отмена редактирования с возвратом оригинального текста
            this.textMesh.text = this.originTextStore;
            this.disable();
        } else if (this.checkKeyCodeOnAllow(e.code)){
            //ввод теста с проверкой допустимых символов
            this.textMesh.text = this.textMesh.text.substr(0, this.textMesh.text.length - 1) + e.key + this.caret;
        }
    }

    /**
     * Применение введённого текста
     */
    accept(){
        if(this.textMesh.text === this.caret){
            //возврат оригинального текста, если последним символом остаётся каретка
            this.returnOriginText();
        } else {
            //применение введённого текста
            this.removeCaret();
            this.disable();
        }
    }

    /**
     * Проверка введённого значения на допустимость
     * @param code - символ
     * @returns {boolean}
     */
    checkKeyCodeOnAllow(code){
        return this.allCode.some(c=>{
            return code === c;
        });
    }

    /**
     * Удаление каретки
     */
    removeCaret(){
        this.textMesh.text = this.textMesh.text.substr(0, this.textMesh.text.length - 1);
    }

    /**
     * Завершение редактирования заголовка
     */
    disable(){
        this.tween.stop();
        this.textMesh.colorRanges = null;
        this.tween = null;
        this.active = false;
        this.textMesh = null;
        document.removeEventListener('keyup', this.handler, false);
    }

    /**
     * Возврат оригинального текста с анимацией ошибки
     */
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