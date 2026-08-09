import { DiagnosticEngine } from './diagnosticEngine';
import { BuildDiagnostics } from './buildDiagnostics';
import { ScannerDiagnostics } from './scannerDiagnostics';
import { DeploymentDiagnostics } from './deploymentDiagnostics';
import { DiagnosticSanitizer } from './diagnosticSanitizer';
import { FixEngine } from './fixEngine';

export interface GuardianStageResult {
  stage: 'PRE_DEPLOY' | 'BUILD' | 'POST_DEPLOY';
  passed: boolean;
  timestamp: string;
  checks: { name: string; passed: boolean; message?: string }[];
  failureReport?: any;
}

export class DeploymentGuardian {
  /**
   * Runs the complete PRE-DEPLOYMENT Guardian checklist
   */
  public static async runPreDeployCheck(): Promise<GuardianStageResult> {
    const checks: { name: string; passed: boolean; message?: string }[] = [];
    let passed = true;

    // 1. Architecture Check
    const scanner = await ScannerDiagnostics.runProjectScan();
    const archPassed = scanner.configErrors.length === 0 && !scanner.issues.some(i => i.severity === 'CRITICAL');
    checks.push({
      name: 'Architecture & Guard Check',
      passed: archPassed,
      message: archPassed ? 'Vite + React + Express validated' : scanner.configErrors.join('; '),
    });
    if (!archPassed) passed = false;

    // 2. Secret Exposure Scan
    const envScanPassed = !scanner.issues.some(i => i.category === 'ENV_CONFIG' && i.severity === 'CRITICAL');
    checks.push({
      name: 'Secret Exposure Scan',
      passed: envScanPassed,
      message: envScanPassed ? 'No credentials in client VITE_*' : 'Secret exposure risk detected',
    });
    if (!envScanPassed) passed = false;

    // 3. Dependency Check
    const buildEval = await BuildDiagnostics.evaluateBuild();
    const depsPassed = buildEval.nodeModulesExists;
    checks.push({
      name: 'Dependency Integrity Check',
      passed: depsPassed,
      message: depsPassed ? 'node_modules verified' : 'node_modules missing',
    });
    if (!depsPassed) passed = false;

    return {
      stage: 'PRE_DEPLOY',
      passed,
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  /**
   * Runs the POST-DEPLOYMENT Guardian verification checklist
   */
  public static async runPostDeployCheck(baseUrl: string = 'http://localhost:3000'): Promise<GuardianStageResult> {
    const deploymentReport = await DeploymentDiagnostics.verifyDeployment(baseUrl);
    const checks = deploymentReport.checks.map((c) => ({
      name: `Endpoint ${c.endpoint}`,
      passed: c.passed,
      message: c.message,
    }));

    let failureReport;
    if (!deploymentReport.overallPassed) {
      const topFailure = deploymentReport.issues[0];
      if (topFailure) {
        failureReport = await FixEngine.generateFixReport(topFailure);
        failureReport = DiagnosticSanitizer.sanitizeObject(failureReport);
      }
    }

    return {
      stage: 'POST_DEPLOY',
      passed: deploymentReport.overallPassed,
      timestamp: new Date().toISOString(),
      checks,
      failureReport,
    };
  }
}
