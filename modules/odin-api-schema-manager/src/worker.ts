const { Worker } = require('worker_threads');

type QueueCallback<N> = (err: any, result?: N) => void;

interface QueueItem<T, N> {
    callback: QueueCallback<N>;
    getData: () => T;
}

export class WorkerPool<T, N> {
    private queue: QueueItem<T, N>[] = [];
    private workersById: { [key: number]: any } = {};
    private activeWorkersById: { [key: number]: boolean } = {};

    public constructor(public workerPath: string, public numberOfThreads: number) {
        this.init();
    }

    private init() {
        // To avoid infinite loops, we first ensure the number of threads is >1
        if ( this.numberOfThreads < 1 ) {
            return null;
        }
        // create the valid number of workers and save them by their index in the workersById state
        for ( let i = 0; i < this.numberOfThreads; i += 1 ) {
            const worker = new Worker(this.workerPath);
            console.log({ worker });
            this.workersById[i] = worker;
            this.activeWorkersById[i] = false;
        }
    }

    // set up a task to run once a worker is available
    public run(getData: () => T) {
        console.log('RUN WORKER TASK', getData);
        return new Promise<N>(async (resolve, reject) => {

            const availableWorkerId = this.getInactiveWorkerId();
            console.log('AVAIALBLE WORKER ID', availableWorkerId);
            const queueItem: QueueItem<T, N> = {
                getData,
                callback: (error, result) => {
                    console.log('queuItem callback', error, result);
                    if ( error ) {
                        return reject(error);
                    }
                    return resolve(result);
                },
            };
            // If the availableWorkerId is -1, then there is no available worker
            if ( availableWorkerId === -1 ) {
                // add the queueItem to the queue
                this.queue.push(queueItem);
                return null;
            }
            // If there is an available worker, execute the task
            await this.runWorker(availableWorkerId, queueItem);
        });
    }

    // check whether there’s a worker available to process the data
    private getInactiveWorkerId(): number {
        for ( let i = 0; i < this.numberOfThreads; i += 1 ) {
            if ( !this.activeWorkersById[i] ) {
                return i;
            }
        }
        return -1;
    }

    private async runWorker(workerId: number, queueItem: QueueItem<T, N>) {
        const worker = this.workersById[workerId];
        console.log('run worker', worker);

        this.activeWorkersById[workerId] = true;

        const messageCallback = (result: N) => {
            console.log('messageCallback', result);
            queueItem.callback(null, result);
            cleanUp();
        };
        const errorCallback = (error: any) => {
            console.log('errorCallback', error);
            queueItem.callback(error);
            cleanUp();
        };

        const cleanUp = () => {
            console.log('cleanUp');
            worker.removeAllListeners('message');
            worker.removeAllListeners('error');
            this.activeWorkersById[workerId] = false;
            if ( !this.queue.length ) {
                return null;
            }
            this.runWorker(workerId, this.queue.shift());
        };

        console.log('worker message');
        worker.once('message', messageCallback);
        console.log('worker error');
        worker.once('error', errorCallback);
        console.log('worker post message');
        worker.postMessage(await queueItem.getData());
    }

}
