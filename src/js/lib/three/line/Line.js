/**
 * Модуль линии
 */

import * as THREE from 'three';
import C from '../../Constants';
import ThemeControl from '../../../themes/ThemeControl';
import Assets3d from '../Assets3d';
import FBS from "../../FlowBuilderStore";
import WatchPoint from "./WatchPoint";

export default class {
    constructor(){
        //не удалять! расчёт постоянной ширины линии
        //this.frustumSize = C.three.zoom.default;

        this.cPort1 = null;                                 //ссылка на класс первого порта, первый порт всегда выходной порт
        this.cPort2 = null;                                 //ссылка на класс второго порта - всегда входной
        this.selected = false;                              //флаг выбора линии
        this.updateLineBuffer = this.getUpdateLineBuffer(); //буфер для хранения переменных при обновлении линии, для экономии памяти

        this.pos1 = new THREE.Vector2();
        this.pos2 = new THREE.Vector2();

        this.isPort1Collapsed = false;      //флаг состояния порта1
        this.isPort2Collapsed = false;      //флаг состояния порта2
                                            //через них один порт может узнать, что со вторым
        this.lineMark = null;               //ссылка на 3д-объект метки

        this.watchPoint = null;             //ссылка на класс-вотчпоинт этой линии

        this.fatLine = null;           //дубликат основной линии, но жирный и для интерактивности

        this.thinLine = this.createThinLine();
        this.updateResolution();

        this.setEvents();
    }

    /**
     * Создание буфера линии, для хранения расчётов данных
     * @returns {{a: *[], b: *[], sx: number, sy: number, steps: number, p: *[], vectors: *[], ex: number, ey: number, dx: number, t: number, y1: number, x1: number, y2: number, x2: number, y3: number, x3: number, y4: number, x4: number, y5: number, x5: number, y6: number, x6: number}}
     */
    getUpdateLineBuffer(){
        const buffer = {
            sx: 0,
            sy: 0,
            ex: 0,
            ey: 0,
            p: [],
            dx: 0,
            a: [],
            b: [],
            steps: C.lines.segments,
            t: 0,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            x3: 0,
            y3: 0,
            x4: 0,
            y4: 0,
            x5: 0,
            y5: 0,
            x6: 0,
            y6: 0,
            vectors: []
        };
        for(let i = 0; i < C.lines.segments; i += 1){
            buffer.vectors.push(new THREE.Vector3());
        }

        return buffer;
    }

    setEvents(){
        //обработчик события изменения разрешения вьюпорта. обновляет разрешение материала. для линий это необходимо
        FBS.dom.canvas.addEventListener('renderResize', () => this.updateResolution());

        //не удалять! расчёт постоянной ширины линии
        //FBS.dom.canvas.addEventListener('zoomChange', e => this.listenZoom(e.detail.frustumSize));
    }

    //не удалять! расчёт постоянной ширины линии. пока не используется
    /**
     * Проверяем значение зума
     * @param frustumSize {number}
     */
    listenZoom(frustumSize){
        this.frustumSize = frustumSize;
        this.updateResolution()
    }

    createFatLine(){
        const mesh = Assets3d.line.fat.clone();
        mesh.geometry = mesh.geometry.clone();
        mesh.material = mesh.material.clone();

        //запись в 3д-объект ссылки на класс
        mesh.userData.instance = this;

        return mesh;
    }

    /**
     * Создание 3д-объекта линии
     * @returns {Object}
     */
    createThinLine(){
        const mesh = Assets3d.line.thin.clone();
        mesh.geometry = mesh.geometry.clone();
        mesh.material = mesh.material.clone();

        //запись в 3д-объект ссылки на класс
        mesh.userData.instance = this;

        return mesh;
    }

    /**
     * Обновление разрешения материала линий
     * Если этого не делать, то на широком экране линии растягиваются в ширь
     */
    updateResolution(){
        this.updateThinLineResolution();
        this.updateFatLineResolution();
    }

    /**
     * Обновление разрешения для тонкой линии
     */
    updateThinLineResolution(){
        //не удалять! Расчёт постоянной ширины линии, пригодится
        /*this.thinLine.material.resolution.set(
            FBS.dom.canvas.width * (this.frustumSize/C.three.zoom.default),
            FBS.dom.canvas.height * (this.frustumSize/C.three.zoom.default)
        );*/
        this.thinLine.material.resolution.set(FBS.dom.canvas.width, FBS.dom.canvas.height);
    }

    /**
     * Обновление разрешения для толстой линии
     */
    updateFatLineResolution(){
        if(this.fatLine) this.fatLine.material.resolution.set(FBS.dom.canvas.width, FBS.dom.canvas.height);
    }

    /**
     * Соединение линии со вторым портом
     * @param cPort2
     */
    connect(cPort2){
        let pos1, pos2;

        //устанавливаем выходной порт как первый
        if(this.cPort1.direction === 'output'){
            this.setCPort1(this.cPort1);
            this.setCPort2(cPort2);
            pos1 = this.cPort1.getConnectorPos();
            pos2 = this.cPort2.getConnectorPos();

            this.setColor(this.cPort1.getColor());
        } else {
            this.setCPort2(this.cPort1);
            this.setCPort1(cPort2);

            pos1 = this.cPort1.getConnectorPos();
            pos2 = this.cPort2.getConnectorPos();

            this.setColor(this.cPort2.getColor());
        }
        this.setPos1(pos1.x, pos1.y);
        this.setPos2(pos2.x, pos2.y);
        this.updateLine();

        //линия добавляется в списки линий в портах
        this.cPort1.cLines.push(this);
        this.cPort2.cLines.push(this);

        //создание маркера на линии
        this.lineMark = this.createLineMark();
        this.updateLineMarkPosition()
        this.thinLine.parent.add(this.lineMark);

        //добавление толстой линии
        this.fatLine = this.createFatLine();
        this.updateFatLineResolution();
        this.thinLine.parent.add(this.fatLine);

        this.updateFatLine();
    }

    /**
     * Установка первого порта для линии
     * @param cPort - класс порта
     */
    setCPort1(cPort){
        this.cPort1 = cPort;
    }

    /**
     *  Установка второго порта для линии
     * @param cPort - класс порта
     */
    setCPort2(cPort){
        this.cPort2 = cPort;
    }

    /**
     * Возвращает класс первого порта
     * @returns {null|*}
     */
    getCPort1(){
        return this.cPort1;
    }

    /**
     * Возвращает класс второго порта
     * @returns {null|*}
     */
    getCPort2(){
        return this.cPort2;
    }

    /**
     * Возвращает 3д-объект для тонкой линии
     * @returns {Object}
     */
    getThinLine3dObject(){
        return this.thinLine;
    }

    /**
     * Возвращает 3д-объект для толстой линии
     * @returns {Object}
     */
    getFatLine3dObject(){
        return this.fatLine;
    }

    /**
     * Установка первой точки линии
     * @param x
     * @param y
     */
    setPos1(x, y){
        this.pos1.x = x;
        this.pos1.y = y;
    }

    /**
     * Установка второй линии точки
     * @param x
     * @param y
     */
    setPos2(x, y){
        this.pos2.x = x;
        this.pos2.y = y;
    }

    /**
     * Построение кривой линии
     */
    updateLine() {

        const _ = this.updateLineBuffer;
        _.sx = this.pos1.x;
        _.sy = this.pos1.y;
        _.ex = this.pos2.x;
        _.ey = this.pos2.y;

        _.p = [];

        _.dx = Math.max(Math.abs(_.ex - _.sx), 0.1);

        _.a = [_.sx + _.dx * 0.5, _.sy];
        _.b = [_.ex - _.dx * 0.5, _.ey];

        _.p.push(_.sx, _.sy, 0);

        for (let i = 1; i < _.steps; i++) {
            _.t = i / _.steps;
            _.x1 = _.sx + (_.a[0] - _.sx) * _.t;
            _.y1 = _.sy + (_.a[1] - _.sy) * _.t;
            _.x2 = _.a[0] + (_.b[0] - _.a[0]) * _.t;
            _.y2 = _.a[1] + (_.b[1] - _.a[1]) * _.t;
            _.x3 = _.b[0] + (_.ex - _.b[0]) * _.t;
            _.y3 = _.b[1] + (_.ey - _.b[1]) * _.t;

            _.x4 = _.x1 + (_.x2 - _.x1) * _.t;
            _.y4 = _.y1 + (_.y2 - _.y1) * _.t;
            _.x5 = _.x2 + (_.x3 - _.x2) * _.t;
            _.y5 = _.y2 + (_.y3 - _.y2) * _.t;

            _.x6 = _.x4 + (_.x5 - _.x4) * _.t;
            _.y6 = _.y4 + (_.y5 - _.y4) * _.t;

            _.p.push(_.x6, _.y6, 0);
        }
        _.p.push(_.ex, _.ey, 0);

        this.thinLine.geometry.setPositions(_.p);

        this.setVectorsOfPoints(_);

        this.thinLine.userData.points = _.vectors;

        this.updateLineMarkPosition();
    }

    setVectorsOfPoints(buffer) {
        for (let i = 0; i < buffer.vectors.length; i += 1) {
            buffer.vectors[i].x = buffer.p[i * 3];
            buffer.vectors[i].y = buffer.p[i * 3 + 1];
            buffer.vectors[i].z = buffer.p[i * 3 + 2];
        }
    }

    /**
     * Обновление толстой линии
     */
    updateFatLine(){
        this.fatLine.geometry.setPositions(this.updateLineBuffer.p);
    }

    /**
     * При колапсировании первого порта с линии снимается выделение
     */
    collapsedPort1(){
        if(this.selected) this.unselect();

        this.isPort1Collapsed = true;
        this.setColor(ThemeControl.theme.node.portTypes.pseudo.connectorColor);

    }

    /**
     * При колапсировании первого порта с линии снимается выделение
     */
    collapsedPort2(){
        if(this.selected) this.unselect();

        this.isPort2Collapsed = true;
        this.setColor(ThemeControl.theme.node.portTypes.pseudo.connectorColor);
    }

    /**
     * Разблокирование линии, если расколлапсированы оба порта
     */
    unCollapsedPort1(){
        this.isPort1Collapsed = false;
        if(!this.isPort2Collapsed) this.resetColor();
    }

    /**
     * Разблокирование линии, если расколлапсированы оба порта
     */
    unCollapsedPort2(){
        this.isPort2Collapsed = false;
        if(!this.isPort1Collapsed) this.resetColor();
    }

    /**
     * Установка цвета линии
     * @param colorStyle {String}
     */
    setColor(colorStyle){
        this.thinLine.material.color.setStyle(colorStyle);
        if(this.lineMark){
            const lineMarkBig = this.lineMark.getObjectByName('lineMarkBig');
            lineMarkBig.material.color.setStyle(colorStyle);
        }
    }

    /**
     * Сброс цвета линии на цвет первого порта
     */
    resetColor(){
        const color = this.cPort1.getColor();
        this.thinLine.material.color.setStyle(color);
        if(this.lineMark){
            const lineMarkBig = this.lineMark.getObjectByName('lineMarkBig');
            lineMarkBig.material.color.setStyle(color);
        }
    }

    /**
     * Выделение линии и присоединённых коннекторов
     */
    select(){
        if(!this.selected) {
            this.selected = true;
            this.setColor(ThemeControl.theme.line.selectedColor);
            this.cPort1.selectConnector();
            this.cPort2.selectConnector();
        }
    }

    /**
     * Снятие выделения линии и присоединённых коннекторов
     */
    unselect(){
        if(this.selected) {
            this.selected = false;
            this.setColor(this.cPort1.getColor());
            this.cPort1.unselectConnector();
            this.cPort2.unselectConnector();
        }
    }

    /**
     * Удаление линии со сцены
     */
    remove(){
        FBS.sceneControl.removeFromScene(this.thinLine);
        if(this.lineMark) this.removeLineMark();
        if(this.fatLine) this.removeFatLine();
        if(this.watchPoint) this.watchPoint.remove();
        //снятие выделения с коннекторов
        if(this.cPort1) this.cPort1.unselectConnector();
        if(this.cPort2) this.cPort2.unselectConnector();
        //удаление линии из списка линий в портах
        if(this.cPort1) this.cPort1.removeCLine(this);
        if(this.cPort2) this.cPort2.removeCLine(this);
    }

    //LINE MARK

    /**
     * Создание 3д-объекта метки
     */
    createLineMark(){
        const lineMark = Assets3d.getLineMark().clone();
        lineMark.traverse(o=> o.userData.instance = this);
        const bigMark = lineMark.getObjectByName('lineMarkBig');
        bigMark.material.color.setStyle(this.thinLine.material.color.getStyle());

        return lineMark;
    }

    /**
     * Получение позиции для вотчпоинта на линии. Процент от начальной точки линии
     * @returns {{x: number, y: number, z: number}}
     */
    getPositionForLineMark(){
        const progress = C.lines.segments/100 * C.lines.mark.positionOnLine; //point on line
        const instanceStart = this.thinLine.geometry.getAttribute('instanceStart').data;
        const points = instanceStart.array;

        return {
            x: points[progress * instanceStart.stride],
            y: points[progress * instanceStart.stride + 1],
            z: points[progress * instanceStart.stride + 2]
        };
    }

    hoverLineMark(){
        const bigMark = this.lineMark.getObjectByName('lineMarkBig');
        bigMark.material.color.setStyle(ThemeControl.theme.line.hoverColor);
    }

    unhoverLineMark(){
        const bigMark = this.lineMark.getObjectByName('lineMarkBig');
        bigMark.material.color.setStyle(this.thinLine.material.color.getStyle());
    }

    /**
     * Обновление позиции вотчпоинта
     * @returns {null}
     */
    updateLineMarkPosition(){
        if(!this.lineMark) return null;

        const pos = this.getPositionForLineMark();
        this.lineMark.position.set(pos.x, pos.y, pos.z);
    }

    /**
     * Удаление вотчпоинта со сцены
     */
    removeLineMark(){
        FBS.sceneControl.removeFromScene(this.lineMark);
        this.lineMark.traverse((o)=>{
            if(o.geometry) o.geometry.dispose();
            if(o.material) o.material.dispose();
            o = null;
        })
        this.lineMark = null;
    }

    /**
     * Удаление толстой линии
     */
    removeFatLine(){
        this.fatLine.removeFromParent();
        this.fatLine.geometry.dispose();
        this.fatLine.material.dispose();
        this.fatLine = null;
    }

    //WATCH POINT
    showWatchPoint(){
        if(!this.watchPoint){
            this.watchPoint = new WatchPoint();
        }

        this.watchPoint.show(this.lineMark.position);
    }

    hideWatchPoint(){
        if(this.watchPoint){
            this.watchPoint.hide();
        }
    }

    /**
     * Обновление темы
     */
    updateTheme(){
        if(this.selected){
            this.setColor(ThemeControl.theme.line.selectedColor);
            this.cPort1.selectConnector();
            this.cPort2.selectConnector();

            if(this.lineMark) {
                const markBig = this.lineMark.getObjectByName('lineMarkBig');
                markBig.material.color.setStyle(ThemeControl.theme.line.selectedColor);
            }

        } else {
            if(this.isPort1Collapsed || this.isPort2Collapsed){
                this.setColor(ThemeControl.theme.node.portTypes.pseudo.connectorColor);
                if(this.lineMark) {
                    const markBig = this.lineMark.getObjectByName('lineMarkBig');
                    markBig.material.color.setStyle(ThemeControl.theme.node.portTypes.pseudo.connectorColor);
                }
            } else {
                this.setColor(this.cPort1.getColor());
                if(this.lineMark) {
                    const markBig = this.lineMark.getObjectByName('lineMarkBig');
                    markBig.material.color.setStyle(this.cPort1.getColor());
                }
            }

        }

        if(this.lineMark) {
            const markSmall = this.lineMark.getObjectByName('lineMarkSmall');
            markSmall.material.color.setStyle(ThemeControl.theme.scene.backgroundColor);
        }

    }
}