/**
 * Модуль управления несколькими вотчпоинтами
 *
 */
import {Object3D} from "three";

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

    /**
     *
     * @param objects {[Object3D]}
     */
    refreshLines(objects){
        objects.map(o => {
            const instance = o.userData.class;
            instance.updateLine();
        });
    }

    /**
     *
     * @param objects {[Object3D]}
     */
    recalculateEdgePositions(objects){
        objects.map(o => {
            const instance = o.userData.class;
            instance.calcEdgePositions();
        });
    }
}

const watchPointControl = new WatchPointControl();

export default watchPointControl;