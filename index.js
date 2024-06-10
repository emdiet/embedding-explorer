"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingSystem = void 0;
class EmbeddingSystem {
    constructor() {
        console.log('EmbeddingSystem constructor');
    }
}
exports.EmbeddingSystem = EmbeddingSystem;
const __openFrames = [];
let __activeFrame = null;
function nextFrame(f, n = 1) {
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
//# sourceMappingURL=index.js.map