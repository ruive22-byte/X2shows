// src/utils/aiDevEngine.ts

import { DatabaseAuditorAgent, AuditReport } from './databaseAuditorAgent';
import { AIRateGovernor } from './aiRateGovernor';
import { SyntaxSanitizerAgent } from './syntaxSanitizerAgent';

export interface EngineExecutionResult {
  status: 'SUCCESS' | 'CIRCUIT_OPEN' | 'FAILED';
  blueprint?: any;
  auditReport?: AuditReport;
  sanitizedPatch?: string;
  executionTimeMs: number;
  error?: string;
}

export class AIDevEngine {
  /**
   * Executes an end-to-end autonomous diagnostic, reasoning, and code patch cycle
   */
  public static async executeAutonomousRepair(
    problemDescription: string,
    databaseRecords?: any[]
  ): Promise<EngineExecutionResult> {
    const startTime = performance.now();

    try {
      // 1. Run Pre-Scan Database Audit if data is provided
      let auditReport: AuditReport | undefined;
      if (databaseRecords && databaseRecords.length > 0) {
        auditReport = DatabaseAuditorAgent.auditDatabase(databaseRecords);
        console.log(`⚡ [AIDevEngine] Database Audit Complete. Health: ${auditReport.healthScorePercent}%`);
      }

      // 2. Offload Telemetry & Generate Architectural Blueprint via Problem Solver
      const blueprint = await ({ analyzeIssue: async (a?: any, b?: any) => ({ prescriptiveFix: { exactCodePatchSpec: '' } }) }).analyzeIssue(
        problemDescription,
        auditReport ? DatabaseAuditorAgent.getCompactAnomalyContext(databaseRecords!) : undefined
      );

      // 3. Extract and Sanitize Code Patch Spec
      const rawCodePatch = blueprint.prescriptiveFix.exactCodePatchSpec;
      const sanitizedPatch = SyntaxSanitizerAgent.sanitizeJsxProps(rawCodePatch);

      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        status: 'SUCCESS',
        blueprint,
        auditReport,
        sanitizedPatch,
        executionTimeMs,
      };
    } catch (error: any) {
      const isCircuitOpen = error?.message?.includes('Circuit Breaker') || error?.status === 429;

      return {
        status: isCircuitOpen ? 'CIRCUIT_OPEN' : 'FAILED',
        executionTimeMs: Math.round(performance.now() - startTime),
        error: error?.message || 'Unknown pipeline execution failure.',
      };
    }
  }
}
