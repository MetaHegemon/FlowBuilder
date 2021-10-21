/**
 * Модуль управления уведомлениями
 */

import FBS from "../../../FlowBuilderStore";


//for jsDoc
import Notice from "./Notice";

class NoticeControl {
    constructor() {
        this.hovered = [];                          //контейнер для хранения всех подсвеченных объектов
    }

    onPointerDown(e){
        if (e.buttons === 1) {

        }
    }

    onPointerMove(e, intersects){
        const firstObject = intersects[1].object;
        if(!firstObject) return null;
        if(e.buttons === 0) //без нажатия
        {
            if (firstObject.name === 'unwrapButton') {
                const cNotice = firstObject.userData.instance;
                cNotice.hoverUnwrapButton();
                this.hovered.push(firstObject);
                FBS.dom.setCursor('pointer');
            } else {
                FBS.dom.resetCursor();
            }
        }
    }

    onPointerUp(e, intersects){
        const firstObject = intersects[1].object;
        if(!firstObject) return null;
        if (e.button === 0) {
            //обработка нажатия на разные элементы сцены
            if (firstObject.name === 'unwrapButton') {
                const cNotice = firstObject.userData.instance;
                this.onUnwrapButtonClick(cNotice);
            }
        }
    }

    /**
     * Снятие подсветки со всех объектов, кроме аргумента
     * @param exceptObject - 3д-объект, который надо исключить
     */
    unhoverObjects(exceptObject){
        for(let i = 0; i < this.hovered.length; i += 1) {
            if (this.hovered[i] === exceptObject) continue;
            if (this.hovered[i].name === 'unwrapButton') {
                const cNotice = this.hovered[i].userData.instance;
                cNotice.unhoverUnwrapButton();
            }
            this.hovered.splice(i, 1);
            i -= 1;
        }
    }

    /**
     *
     * @param cNotice {Notice}
     */
    onUnwrapButtonClick(cNotice){
        if(cNotice.wrappedMessage){
            cNotice.unwrapMessage();
        } else {
            cNotice.wrapMessage();
        }

    }
}

const noticeControl = new NoticeControl();

export default noticeControl;