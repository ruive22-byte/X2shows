// Just a simple runtime test suite that could be wired to a UI or run in console
import { catalogRegistry } from './catalogRegistry';
import { validateAndSanitizeItem } from './catalogValidator';

export async function runTests() {
  console.log('Running Catalog Test Suite...');
  
  const mockItem = {
    title: '<script>alert("xss")</script> Test Show',
    tmdbId: 12345,
    poster_path: '/test.jpg'
  };
  
  const valid = validateAndSanitizeItem(mockItem);
  console.assert(valid?.title === ' Test Show', 'XSS sanitization failed');
  console.assert(valid?.id === '12345', 'ID generation failed');
  
  await catalogRegistry.registerItem(mockItem);
  const found = catalogRegistry.getByTmdbId(12345);
  console.assert(!!found, 'Registry indexing failed');
  
  console.log('Catalog Test Suite Completed.');
}
