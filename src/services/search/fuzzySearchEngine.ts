function getTrigrams(str: string): Set<string> {
  const normalized = `  ${str.toLowerCase().replace(/[^a-z0-9]/g, '')}  `;
  const trigrams = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i++) {
    trigrams.add(normalized.substring(i, i + 3));
  }
  return trigrams;
}

export function calculateFuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;
  
  const queryTrigrams = getTrigrams(query);
  const targetTrigrams = getTrigrams(target);
  
  if (queryTrigrams.size === 0 || targetTrigrams.size === 0) return 0;
  
  let intersectionSize = 0;
  queryTrigrams.forEach(tg => {
    if (targetTrigrams.has(tg)) {
      intersectionSize++;
    }
  });
  
  // Jaccard similarity or overlap coefficient
  // Using overlap coefficient is better when query is much shorter than target
  return intersectionSize / queryTrigrams.size;
}

export function fuzzySearch<T>(
  query: string,
  items: T[],
  getString: (item: T) => string,
  threshold = 0.4
): { item: T; score: number }[] {
  if (!query.trim()) return [];
  
  const results = items
    .map(item => ({
      item,
      score: calculateFuzzyScore(query, getString(item))
    }))
    .filter(res => res.score >= threshold);
    
  results.sort((a, b) => b.score - a.score);
  return results;
}
