import { DiagnosticIssue, DiagnosticSeverity, DiagnosticCategory } from './diagnosticTypes';
import { DiagnosticSanitizer } from './diagnosticSanitizer';

export class ErrorCollector {
  private static recentErrors: DiagnosticIssue[] = [];
  private static MAX_BUFFER_SIZE = 100;

  /**
   * Captures and normalizes a runtime or network error
   */
  public static captureError(
    error: unknown,
    context: {
      subsystem: string;
      category?: DiagnosticCategory;
      severity?: DiagnosticSeverity;
      affectedFile?: string;
      affectedFunction?: string;
      probableCause?: string;
      confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
      recommendedFix?: string;
      verificationProcedure?: string;
      details?: Record<string, any>;
    }
  ): DiagnosticIssue {
    const rawMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : JSON.stringify(error);

    const sanitizedMessage = DiagnosticSanitizer.sanitizeString(rawMessage);
    const sanitizedDetails = context.details
      ? DiagnosticSanitizer.sanitizeObject(context.details)
      : undefined;

    const stack = error instanceof Error ? error.stack : undefined;
    const sanitizedStack = stack ? DiagnosticSanitizer.sanitizeString(stack) : undefined;

    const issue: DiagnosticIssue = {
      id: `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category: context.category || 'UNCATCHED_EXCEPTION',
      severity: context.severity || 'ERROR',
      timestamp: new Date().toISOString(),
      subsystem: context.subsystem,
      affectedFile: context.affectedFile,
      affectedFunction: context.affectedFunction,
      errorMessage: sanitizedMessage,
      probableCause:
        context.probableCause ||
        (sanitizedMessage.includes('fetch')
          ? 'Network request or API endpoint unreachable'
          : sanitizedMessage.includes('undefined')
          ? 'Null pointer or missing object property'
          : 'Unexpected runtime error'),
      confidenceLevel: context.confidenceLevel || 'HIGH',
      recommendedFix:
        context.recommendedFix ||
        'Inspect stack trace and verify module initialization or parameter validity.',
      verificationProcedure:
        context.verificationProcedure ||
        'Re-run diagnostic check or re-test endpoint after applying fix.',
      details: {
        ...sanitizedDetails,
        stack: sanitizedStack,
      },
    };

    this.recentErrors.unshift(issue);
    if (this.recentErrors.length > this.MAX_BUFFER_SIZE) {
      this.recentErrors.pop();
    }

    return issue;
  }

  /**
   * Returns recent recorded diagnostic issues, optionally filtered by severity
   */
  public static getRecentErrors(severityFilter?: DiagnosticSeverity): DiagnosticIssue[] {
    if (!severityFilter) {
      return [...this.recentErrors];
    }
    return this.recentErrors.filter((err) => err.severity === severityFilter);
  }

  /**
   * Clears error buffer
   */
  public static clearErrors(): void {
    this.recentErrors = [];
  }
}
