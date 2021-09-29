import FBS from './../FlowBuilderStore';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

//TODO add or delete callbacks in render loops must be in scene control
export default class {
    constructor(){

    }

    animate(tasks){
        let taskCount = 0;
        const waitAll = () => {
            taskCount += 1;
            if(taskCount === tasks.length){
                this.removeRenderCallback(callback);
            }
        };

        tasks.map((item)=>{
            const tween = new TWEEN.Tween( item.target)
                .to( item.value, item.time )
                .easing( TWEEN.Easing.Exponential.InOut )
                .onComplete(waitAll);

            if(item.callbackOnUpdate){
                tween.onUpdate(item.callbackOnUpdate);
            }
            if(item.callbackOnComplete){
                tween.onComplete(item.callbackOnComplete);
            }
            tween.start();

        });


        const callback = ()=> TWEEN.update();
        FBS.sceneControl.renderLoops.push(callback);
    }

    removeRenderCallback(callback){
        for(let i = 0; i < FBS.sceneControl.renderLoops.length; i += 1){
            if(FBS.sceneControl.renderLoops[i] === callback){
                FBS.sceneControl.renderLoops.splice(i, 1);
                break;
            }
        }
    }
}