import FBS from './../FlowBuilderStore';

export default class {
    constructor(){

    }

    animate(tasks){
        tasks.map((item)=>{
            const tween = new FBS.tween.Tween( item.target)
                .to( item.value, item.time )
                .easing( FBS.tween.Easing.Exponential.InOut );
            if(item.callbackOnUpdate){
                tween.onUpdate(item.callbackOnUpdate);
            }
            if(item.callbackOnComplete){
                tween.onComplete(item.callbackOnComplete);
            }
            if(item.repeat){
                tween.repeat(item.repeat);
            }
            if(item.yoyo){
                tween.yoyo(item.yoyo);
            }
            tween.start();
        });

    }
}