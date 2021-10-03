import * as THREE from "three";
import ThemeControl from "../../themes/ThemeControl";

class MaterialControl{
    constructor() {
        this.materials = [
            {
                names: ['bigMount', 'rightResizer', 'connectorMagnet'],
                material: new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
            },
            {
                names: ['backMount', 'backCornerTopLeft', 'backBodyTop', 'backCornerTopRight', 'backBody',
                    'backCornerBottomLeft', 'backBodyBottom', 'backCornerBottomRight', 'miniBackMount'],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.mount.back.color})
            },
            {
                names: ['frontTop', 'frontCornerTopLeft', 'frontBodyTop', 'frontCornerTopRight', 'frontHeader',
                'miniFrontTop', ],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.mount.front.headColor})
            },
            {
                names: ['frontBody', 'miniFrontBody'],
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
                names: ['collapseButton','playButton', 'menuButton', 'miniMenuButton', ],
                material: new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.header.fontColor})
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
        ];

    }

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

    getPortConnectorMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].connectorColor});
    }

    getPortLabelMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].labelColor});
    }

    getPortMarkMountMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].markColor});
    }

    getPortMarkLabelMaterial(type){
        return new THREE.MeshBasicMaterial({color: ThemeControl.theme.node.portTypes[type].markFontColor});
    }
}

const materialControl = new MaterialControl();

export default materialControl;


