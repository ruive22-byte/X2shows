// src/utils/databaseAuditorAgent.ts

export interface DatabaseAnomaly {
  recordId: string;
  recordTitle: string;
  errorType: 'MISSING_FIELD' | 'INVALID_URL' | 'DUPLICATE_ID' | 'NULL_METADATA';
  fieldAffected: string;
  severity: 'CRITICAL' | 'WARNING';
  details: string;
}

export interface AuditReport {
  totalRecordsScanned: number;
  anomaliesFound: DatabaseAnomaly[];
  healthScorePercent: number;
  timestamp: number;
}

export class DatabaseAuditorAgent {
  /**
   * Performs an instant structural audit over a dataset to extract broken entries
   */
  public static auditDatabase(records: any[]): AuditReport {
    const anomalies: DatabaseAnomaly[] = [];
    const seenIds = new Set<string>();

    records.forEach((record, index) => {
      const recordId = record.id || `record-[${index}]`;
      const recordTitle = record.title || record.name || 'Untitled Record';

      // 1. Check for Duplicate IDs
      if (record.id) {
        if (seenIds.has(record.id)) {
          anomalies.push({
            recordId,
            recordTitle,
            errorType: 'DUPLICATE_ID',
            fieldAffected: 'id',
            severity: 'CRITICAL',
            details: `Duplicate ID "${record.id}" detected in database dataset.`,
          });
        } else {
          seenIds.add(record.id);
        }
      } else {
        anomalies.push({
          recordId,
          recordTitle,
          errorType: 'MISSING_FIELD',
          fieldAffected: 'id',
          severity: 'CRITICAL',
          details: 'Record is missing mandatory primary key field "id".',
        });
      }

      // 2. Check for Missing Crucial Display Fields
      if (!record.title && !record.name) {
        anomalies.push({
          recordId,
          recordTitle,
          errorType: 'MISSING_FIELD',
          fieldAffected: 'title',
          severity: 'CRITICAL',
          details: 'Record is missing both "title" and "name" properties.',
        });
      }

      // 3. Check for Malformed or Missing Poster/Image URLs
      if (record.posterPath !== undefined) {
        if (!record.posterPath || record.posterPath === '' || record.posterPath === 'null') {
          anomalies.push({
            recordId,
            recordTitle,
            errorType: 'NULL_METADATA',
            fieldAffected: 'posterPath',
            severity: 'WARNING',
            details: 'Poster image URL is empty or set to null.',
          });
        }
      }

      // 4. Check for Empty Video Stream / Link Sources
      if (record.servers && Array.isArray(record.servers) && record.servers.length === 0) {
        anomalies.push({
          recordId,
          recordTitle,
          errorType: 'MISSING_FIELD',
          fieldAffected: 'servers',
          severity: 'CRITICAL',
          details: 'Media record has an empty stream server array.',
        });
      }
    });

    const totalCount = records.length || 1;
    const errorWeight = anomalies.filter(a => a.severity === 'CRITICAL').length;
    const healthScore = Math.max(0, Math.round(((totalCount - errorWeight) / totalCount) * 100));

    return {
      totalRecordsScanned: records.length,
      anomaliesFound: anomalies,
      healthScorePercent: healthScore,
      timestamp: Date.now(),
    };
  }

  /**
   * Formats database anomalies into a compact context string for Gemini prompt injection
   */
  public static getCompactAnomalyContext(records: any[]): string {
    const report = this.auditDatabase(records);

    if (report.anomaliesFound.length === 0) {
      return `DATABASE HEALTH: 100% (Scanned ${report.totalRecordsScanned} records - 0 anomalies detected).`;
    }

    let summary = `DATABASE AUDIT REPORT (${report.anomaliesFound.length} ERRORS DETECTED):\n`;
    report.anomaliesFound.slice(0, 5).forEach((anomaly) => {
      summary += `- [${anomaly.severity}] Record "${anomaly.recordTitle}" (${anomaly.recordId}): ${anomaly.errorType} in field "${anomaly.fieldAffected}" -> ${anomaly.details}\n`;
    });

    return summary;
  }
}
