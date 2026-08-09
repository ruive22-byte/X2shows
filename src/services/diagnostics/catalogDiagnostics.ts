import { AppAuditor, AuditIssue } from '../../utils/appAuditor';
import { TMDB_ANIMATED_CATALOG } from '../../data/tmdbData';
import { DiagnosticIssue } from './diagnosticTypes';

export interface CatalogDiagnosticReport {
  totalShows: number;
  duplicateCount: number;
  missingMetadataCount: number;
  invalidRecordsCount: number;
  issues: DiagnosticIssue[];
}

export class CatalogDiagnostics {
  /**
   * Audits active catalog data using AppAuditor and returns diagnostic issues
   */
  public static runCatalogAudit(): CatalogDiagnosticReport {
    const issues: DiagnosticIssue[] = [];

    const rawAuditReport = AppAuditor.auditCatalogDuplicates(TMDB_ANIMATED_CATALOG);

    let duplicateCount = 0;
    let missingMetadataCount = 0;
    let invalidRecordsCount = 0;

    rawAuditReport.forEach((rawIssue: AuditIssue) => {
      if (rawIssue.category === 'CATALOG_DUPLICATE') {
        duplicateCount++;
      }
      if (rawIssue.category === 'MISSING_MEDIA') {
        missingMetadataCount++;
      }

      issues.push({
        id: `CATALOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category:
          rawIssue.category === 'CATALOG_DUPLICATE'
            ? 'CATALOG_DUPLICATE'
            : rawIssue.category === 'MISSING_MEDIA'
            ? 'METADATA_MISSING'
            : 'CATALOG_DATA',
        severity: rawIssue.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        timestamp: new Date().toISOString(),
        subsystem: 'CATALOG',
        errorMessage: rawIssue.message,
        probableCause: 'Catalog data duplication or missing image path in TMDB static/live payload',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Deduplicate catalog array or run posterResolver fallback for missing posters',
        verificationProcedure: 'Execute Catalog Audit',
        details: rawIssue.details,
      });
    });

    return {
      totalShows: TMDB_ANIMATED_CATALOG.length,
      duplicateCount,
      missingMetadataCount,
      invalidRecordsCount,
      issues,
    };
  }
}
