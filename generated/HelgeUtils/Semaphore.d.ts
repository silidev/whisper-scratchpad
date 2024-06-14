/**
* Source:
* https://stackoverflow.com/questions/17528749/semaphore-like-queue-in-javascript
*/
export declare class Queue {
    private running;
    private readonly autorun;
    private queue;
    constructor(autorun?: boolean, queue?: never[]);
    add(cb: (arg0: any) => any): this;
    dequeue(value: any): any;
    get next(): (value: any) => any;
}
