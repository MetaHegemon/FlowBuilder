import C from "../Constants";
import * as THREE from "three";
import Theme from './../../themes/Theme';

export default class{
    constructor() {
        this.materials = [
            {
                names: ['bigMount', 'rightResizer'],
                material: new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
            }
        ];

    }

    getMaterial(name, needClone){
        let result = null;
        cycle: for(let i = 0; i < this.materials.length; i += 1){
            for(let j = 0; j < this.materials[i].names.length; j += 1){
                if(this.materials[i].names[j] === name){
                    result = needClone ? m.material.clone() : m.material;
                    break cycle;
                }
            }
        }
        return result;
    }
};

