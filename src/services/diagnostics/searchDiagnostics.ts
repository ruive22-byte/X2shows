import { searchCatalog } from '../search/searchEngine';
import { TMDB_ANIMATED_CATALOG } from '../../data/tmdbData';
import { SubsystemHealth, DiagnosticIssue } from './diagnosticTypes';

export interface SearchDiagnosticReport {
  health: SubsystemHealth;
  totalIndexable: number;
  sampleQueryTest: {
    query: string;
    resultsCount: number;
    latencyMs: number;
    passed: boolean;
  };
  issues: DiagnosticIssue[];
}

export class SearchDiagnostics {
  public static testSearchEngine(): SearchDiagnosticReport {
    const issues: DiagnosticIssue[] = [];
    const sampleQuery = 'Batman';
    const start = Date.now();

    try {
      const results = searchCatalog(sampleQuery, TMDB_ANIMATED_CATALOG as any);
      const latency = Date.now() - start;

      const passed = Array.isArray(results) && results.length > 0;

      if (!passed) {
        issues.push({
          id: `SEARCH-${Date.now()}-1`,
          category: 'SEARCH_ENGINE',
          severity: 'WARNING',
          timestamp: new Date().toISOString(),
          subsystem: 'SEARCH',
          errorMessage: `Sample search query "${sampleQuery}" yielded 0 results`,
          probableCause: 'Search index missing query term or fuzzy matching threshold too high',
          confidenceLevel: 'HIGH',
          recommendedFix: 'Adjust search query tokenizer or inspect TMDB_ANIMATED_CATALOG catalog',
          verificationProcedure: 'Run Search Engine Diagnostic',
        });
      }

      return {
        health: {
          name: 'SEARCH_SUBSYSTEM',
          status: passed ? 'HEALTHY' : 'DEGRADED',
          latencyMs: latency,
          message: `Indexed ${TMDB_ANIMATED_CATALOG.length} items. Sample query "${sampleQuery}" found ${results.length} results.`,
        },
        totalIndexable: TMDB_ANIMATED_CATALOG.length,
        sampleQueryTest: {
          query: sampleQuery,
          resultsCount: results.length,
          latencyMs: latency,
          passed,
        },
        issues,
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      issues.push({
        id: `SEARCH-${Date.now()}-2`,
        category: 'SEARCH_ENGINE',
        severity: 'ERROR',
        timestamp: new Date().toISOString(),
        subsystem: 'SEARCH',
        errorMessage: `Search engine threw an exception: ${err.message}`,
        probableCause: 'Null pointer or unhandled property access during search filtering',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Add null checks in searchEngine.ts',
        verificationProcedure: 'Run Search Engine Diagnostic',
      });

      return {
        health: {
          name: 'SEARCH_SUBSYSTEM',
          status: 'FAILED',
          latencyMs: latency,
          message: err.message,
        },
        totalIndexable: TMDB_ANIMATED_CATALOG.length,
        sampleQueryTest: {
          query: sampleQuery,
          resultsCount: 0,
          latencyMs: latency,
          passed: false,
        },
        issues,
      };
    }
  }
}
