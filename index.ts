type Vector = number[];

export class EmbeddingSystem {
  constructor() {
    console.log('EmbeddingSystem constructor');
  }




  
}


const __openFrames: (() => void)[] = [];
let __activeFrame: Function | null = null;

function nextFrame(f: () => void, n = 1) {
    __openFrames.push(f);
    if (__activeFrame !== null) {
        return;
    }
    // Starts an animation frame loop that processes up to n functions from the queue per frame
    function frame() {
        if (__openFrames.length === 0) {
            __activeFrame = null;
            return;
        }
        __activeFrame = frame;
        for (let i = 0; i < n; i++) {
            const func = __openFrames.shift();
            if (func === undefined) {
                break;
            }
            func();
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);  
}
