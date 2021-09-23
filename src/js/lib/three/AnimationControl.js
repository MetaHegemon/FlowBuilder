import FBS from './../FlowBuilderStore';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

export default class {
    constructor(){
        this.renderLoops = FBS.renderLoops;
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
        this.renderLoops.push(callback);
    }

    removeRenderCallback(callback){
        for(let i = 0; i < this.renderLoops.length; i += 1){
            if(this.renderLoops[i] === callback){
                this.renderLoops.splice(i, 1);
                break;
            }
        }
    }
}