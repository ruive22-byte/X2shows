type Task<T> = () => Promise<T>;
class PromiseQueue {
  private queue: Task<any>[] = [];
  private activeCount = 0;
  private maxConcurrent = 2;
  private delayMs = 600;

  async add<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const res = await task();
          resolve(res);
        } catch (e) {
          reject(e);
        }
      });
      this.next();
    });
  }

  private next() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;
    const task = this.queue.shift();
    if (task) {
      this.activeCount++;
      task().finally(() => {
        setTimeout(() => {
          this.activeCount--;
          this.next();
        }, this.delayMs);
      });
    }
  }
}
const q = new PromiseQueue();
let start = Date.now();
for(let i=0; i<5; i++) {
  q.add(async () => {
    console.log("Task", i, "started at", Date.now() - start);
    return i;
  }).then(res => console.log("Task", res, "finished at", Date.now() - start));
}
