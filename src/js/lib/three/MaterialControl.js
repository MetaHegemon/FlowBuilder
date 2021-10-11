/**
 * Модуль предсоздаёт и выдаёт материалы для всех объектов сцены
 */
//TODO, написать выдачу материала по цвету, брать цвет из темы, если материал с таким цветом уже есть, то выдавать существующий
import * as THREE from "three";
import ThemeControl from "../../themes/ThemeControl";

class MaterialControl{
    constructor() {
        this.materials = [
            {
                names: ['default'],
                material: new THREE.MeshBasicMaterial()
            },
            {
                names: ['lineMarkSmall'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.scene.backgroundColor})
            },
            {
                names: ['transparent', 'nodeWidthResizer', 'connectorMagnet', 'lineMarkPointer'],
                material: new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
            },
            {
                names: [
                    'backMount', 'backCornerTopLeft', 'backBodyTop', 'backCornerTopRight', 'backBody',
                    'backCornerBottomLeft', 'backBodyBottom', 'backCornerBottomRight', 'miniBackMount',
                ],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.mount.back.color})
            },
            {
                names: ['frontTop', 'frontCornerTopLeft', 'frontBodyTop', 'frontCornerTopRight', 'frontHeader',
                'miniFrontTop'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.mount.front.headColor})
            },
            {
                names: ['frontBody', 'miniFrontBody', 'watchPointFrontBody'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.mount.front.bodyColor})
            },
            {
                names: ['frontBottom', 'frontFooter', 'frontCornerBottomLeft', 'frontCornerBottomRight', 'frontBodyBottom',
                    'miniFrontBottom'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.footer.color})
            },
            {
                names: ['miniBackMount'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.footer.color})
            },
            {
                names: ['miniIndicatorMount'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.mount.front.headColor})
            },
            {
                names: ['collapseButton','playButton', 'menuButton', 'miniMenuButton'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.header.fontColor})
            },
            {
                names: ['iconCornerResize'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.cornerResize.fontColor})
            },
            {
                names: ['closeButton'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.closeButton.fontColor})
            },
            {
                names: ['copyButton'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.copyButton.fontColor})
            },
            {
                names: ['exportButton'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.exportButton.fontColor})
            },
            {
                names: ['footerLabel'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.footer.label.color})
            },
            {
                names: ['title'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.title.fontColor})
            },
            {
                names: ['indicator'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.indicator.fontColor})
            },

            //WATCH POINT
            {   //back
                names: [
                    'watchPointBackMount', 'watchPointBackCornerTopLeft', 'watchPointBackCornerTopRight',
                    'watchPointBackCornerBottomLeft', 'watchPointBackCornerBottomRight', 'watchPointBackBodyTop',
                    'watchPointBackBodyBottom', 'watchPointBackBody'
                ],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.back.backgroundColor})
            },
            {   //front top
                names: [
                    'watchPointFrontCornerTopLeft', 'watchPointFrontCornerTopRight',
                    'watchPointFrontBodyTop', 'watchPointFrontHeader'
                ],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.topControlPanel.backgroundColor})
            },
            {   //front bottom
                names: [
                    'watchPointFrontCornerBottomLeft', 'watchPointFrontCornerBottomRight',
                    'watchPointFrontBodyBottom', 'watchPointFrontFooter'
                ],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.watchPoint.bottomControlPanel.backgroundColor})
            },

        ];

    }

    /**
     * Выдаёт материал по имени
     * @param name
     * @returns {null}
     */
    getMaterial(name){
        let result = null;
        cycle: for(let i = 0; i < this.materials.length; i += 1){
            for(let j = 0; j < this.materials[i].names.length; j += 1){
                if(this.materials[i].names[j] === name){
                    result = this.materials[i].material;
                    break cycle;
                }
            }
        }
        return result;
    }

    /**
     * Выдаёт материал для коннекторов портов
     * @param type
     * @returns {MeshBasicMaterial}
     */
    getPortConnectorMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].connectorColor});
    }

    /**
     * Выдаёт материал для подписей портов
     * @param type
     * @returns {MeshBasicMaterial}
     */
    getPortLabelMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].labelColor});
    }

    /**
     * Выдаёт материал для метки порта
     * @param type
     * @returns {MeshBasicMaterial}
     */
    getPortMarkMountMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].markColor});
    }

    /**
     * Выдаёт материал для подписи метки порта
     * @param type
     * @returns {MeshBasicMaterial}
     */
    getPortMarkLabelMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].markFontColor});
    }
}

const materialControl = new MaterialControl();

export default materialControl;


