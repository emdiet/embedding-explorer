// Array to store frame callback functions that need to be processed
const _frameQueue: (() => void)[] = [];
// Currently active frame function, null when no frame is being processed
let _currentActiveFrame: Function | null = null;

/**
 * Schedules a new frame callback function to be executed.
 * @param callback The function to be executed in the animation frame.
 * @param batchSize The number of callbacks to process in each frame, default is 1.
 */
function scheduleFrame(callback: () => void, batchSize = 1) {
    _frameQueue.push(callback);
    if (_currentActiveFrame !== null) {
        return;
    }

    function processFrames() {
        if (_frameQueue.length === 0) {
            _currentActiveFrame = null;
            return; // This ensures that the recursive calls stop when there are no more callbacks.
        }
        _currentActiveFrame = processFrames;
        for (let i = 0; i < batchSize && _frameQueue.length > 0; i++) {
            const nextCallback = _frameQueue.shift();
            nextCallback && nextCallback();
        }
        requestAnimationFrame(processFrames);
    }
    requestAnimationFrame(processFrames);
}
