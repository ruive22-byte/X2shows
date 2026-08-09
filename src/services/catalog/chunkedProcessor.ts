export function processInChunks<T, R>(
  items: T[],
  processItem: (item: T) => R | Promise<R>,
  chunkSize = 50,
  delayMs = 0
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = [];
    let index = 0;

    async function processNextChunk() {
      try {
        const endIndex = Math.min(index + chunkSize, items.length);
        const chunk = items.slice(index, endIndex);
        
        const chunkResults = await Promise.all(chunk.map(processItem));
        results.push(...chunkResults);
        
        index = endIndex;
        
        if (index < items.length) {
          if (typeof requestIdleCallback === 'function' && delayMs === 0) {
            requestIdleCallback(processNextChunk as any);
          } else {
            setTimeout(processNextChunk, delayMs);
          }
        } else {
          resolve(results);
        }
      } catch (e) {
        reject(e);
      }
    }
    
    processNextChunk();
  });
}
