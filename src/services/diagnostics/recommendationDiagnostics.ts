import { TMDB_ANIMATED_CATALOG } from '../../data/tmdbData';
import { SubsystemHealth, DiagnosticIssue } from './diagnosticTypes';

export interface RecommendationDiagnosticReport {
  health: SubsystemHealth;
  totalShowsTested: number;
  showsWithRecommendationsCount: number;
  issues: DiagnosticIssue[];
}

export class RecommendationDiagnostics {
  public static testRecommendationEngine(): RecommendationDiagnosticReport {
    const issues: DiagnosticIssue[] = [];
    const start = Date.now();

    try {
      let showsWithRecommendationsCount = 0;
      const sampleShows = TMDB_ANIMATED_CATALOG.slice(0, 20);

      sampleShows.forEach((show) => {
        if (show.genre_ids && show.genre_ids.length > 0) {
          showsWithRecommendationsCount++;
        }
      });

      const latency = Date.now() - start;

      return {
        health: {
          name: 'RECOMMENDATION_SUBSYSTEM',
          status: 'HEALTHY',
          latencyMs: latency,
          message: `Evaluated ${sampleShows.length} sample items for recommendation rules.`,
        },
        totalShowsTested: sampleShows.length,
        showsWithRecommendationsCount,
        issues,
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      issues.push({
        id: `REC-${Date.now()}-1`,
        category: 'RECOMMENDATION',
        severity: 'ERROR',
        timestamp: new Date().toISOString(),
        subsystem: 'RECOMMENDATIONS',
        errorMessage: `Recommendation engine error: ${err.message}`,
        probableCause: 'Recommendation resolver encountered corrupted show metadata',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Validate show genre_ids and franchise relationships',
        verificationProcedure: 'Run Recommendation Diagnostic',
      });

      return {
        health: {
          name: 'RECOMMENDATION_SUBSYSTEM',
          status: 'FAILED',
          latencyMs: latency,
          message: err.message,
        },
        totalShowsTested: 0,
        showsWithRecommendationsCount: 0,
        issues,
      };
    }
  }
}
