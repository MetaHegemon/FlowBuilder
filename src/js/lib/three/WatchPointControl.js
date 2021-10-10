/**
 * Модуль управления несколькими вотчпоинтами
 *
 */


class WatchPointControl{
    constructor() {

        //список имён элементов вотчпоинта, за который вотчпоинт можно таскать
        this.moveableElements = [
            'watchPointFrontCornerTopLeft', 'watchPointFrontCornerTopRight',
            'watchPointFrontBodyTop', 'watchPointFrontHeader'
        ];
    }

    isItMoveableElement(name) {
        for(let i = 0; i < this.moveableElements.length; i += 1){
            if(this.moveableElements[i] === name){
                return true;
            }
        }
        return false;
    }
}

const watchPointControl = new WatchPointControl();

export default watchPointControl;