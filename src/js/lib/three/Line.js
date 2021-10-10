/**
 * Модуль линии
 */

import * as THREE from 'three';
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import C from './../Constants';
import ThemeControl from '../../themes/ThemeControl';
import NodeAssets from './NodeAssets';
import FBS from "../FlowBuilderStore";
import WatchPoint from "./WatchPoint";

export default class {
    constructor(){
        this.cPort1 = null;                 //ссылка на класс первого порта, первый порт всегда выходной порт
        this.cPort2 = null;                 //ссылка на класс второго порта - всегда входной
        this.selected = false;              //флаг выбора линии
        this.updateLineBuffer =             //буфер для хранения переменных при обновлении линии, для экономии памяти
        {
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
            y6: 0
        };

        this.pos1 = new THREE.Vector2();
        this.pos2 = new THREE.Vector2();

        this.isPort1Collapsed = false;      //флаг состояния порта1
        this.isPort2Collapsed = false;      //флаг состояния порта2
                                            //через них один порт может узнать, что со вторым
        this.lineMark = null;               //ссылка на 3д-объект метки

        this.watchPoint = null;             //ссылка на класс-вотчпоинт этой линии

        this.mesh = this.createLine();
    }

    /**
     * Создание 3д-объекта линии
     * @returns {Object}
     */
    createLine(){
        const mesh = NodeAssets.line.clone();
        mesh.material = mesh.material.clone();

        //запись в 3д-объект ссылки на класс
        mesh.userData.class = this;

        return mesh;
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

        //создание вотчпоинта
        this.lineMark = this.createLineMark();
        this.updateLineMarkPosition()
        this.mesh.parent.add(this.lineMark);
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
     * Возвращает 3д-объект для линии
     * @returns {Object}
     */
    getMLine(){
        return this.mesh;
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

        const geometry = new LineGeometry();
        geometry.setPositions(_.p);

        this.mesh.geometry = geometry;

        this.updateLineMarkPosition();
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
        this.mesh.material.color.setStyle(colorStyle);
    }

    /**
     * Сброс цвета линии на цвет первого порта
     */
    resetColor(){
        this.mesh.material.color.setStyle(this.cPort1.getColor());
    }

    /**
     * Выделение линии и присоединённых коннекторов
     */
    select(){
        if(!this.selected) {
            this.selected = true;
            this.mesh.material.color.setStyle(ThemeControl.theme.line.selectedColor);
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
            this.mesh.material.color.setStyle(this.cPort1.getColor());
            this.cPort1.unselectConnector();
            this.cPort2.unselectConnector();
        }
    }

    /**
     * Удаление линии со сцены
     */
    remove(){
        FBS.sceneControl.removeFromScene(this.mesh);
        if(this.lineMark) this.removeLineMark();
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
        const lineMark = NodeAssets.getLineMark().clone();
        lineMark.traverse(o=> o.userData.class = this);
        const bigMark = lineMark.getObjectByName('lineMarkBig');
        bigMark.material.color.setStyle(this.mesh.material.color.getStyle());

        return lineMark;
    }

    /**
     * Получение позиции для вотчпоинта на линии. Процент от начальной точки линии
     * @returns {{x: number, y: number, z: number}}
     */
    getPositionForLineMark(){
        const progress = C.lines.segments/100 * C.lines.mark.positionOnLine; //point on line
        const instanceStart = this.mesh.geometry.getAttribute('instanceStart').data;
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
        bigMark.material.color.setStyle(this.mesh.material.color.getStyle());
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
        this.lineMark = null;
    }

    //WATCH POINT

    showWatchPoint(){
        if(!this.watchPoint){
            this.watchPoint = new WatchPoint();
        }

        this.watchPoint.show(this.lineMark.position);

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