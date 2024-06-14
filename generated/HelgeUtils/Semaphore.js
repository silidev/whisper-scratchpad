import { HelgeUtils } from './HelgeUtils.js';
var suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;
/**
* Source:
* https://stackoverflow.com/questions/17528749/semaphore-like-queue-in-javascript
*/
export class Queue {
    running;
    autorun;
    queue;
    constructor(autorun = true, queue = []) {
        this.running = false;
        this.autorun = autorun;
        this.queue = queue;
    }
    //ts-ignore
    add(cb) {
        this.queue.push((value) => {
            const finished = new Promise((resolve, reject) => {
                const callbackResponse = cb(value);
                if (callbackResponse !== false) {
                    resolve(callbackResponse);
                }
                else {
                    reject(callbackResponse);
                }
            });
            finished.then(this.dequeue.bind(this), (() => {
            }));
        });
        if (this.autorun && !this.running) {
            // @ts-expect-error
            this.dequeue();
        }
        return this;
    }
    dequeue(value) {
        this.running = this.queue.shift();
        if (this.running) {
            this.running(value);
        }
        return this.running;
    }
    get next() {
        return this.dequeue;
    }
}
// noinspection JSUnusedLocalSymbols
const test = () => {
    // passing false into the constructor makes it so
    // the queue does not start till we tell it to
    const q = new Queue(false).add(function () {
        //start running something
    }).add(function () {
        //start running something 2
    }).add(function () {
        //start running something 3
    });
    setTimeout(function () {
        // start the queue
        // @ts-expect-error
        q.next();
    }, 2000);
};
suppressUnusedWarning(test);
//# sourceMappingURL=Semaphore.js.map