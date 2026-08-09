import { DiagnosticIssue } from './diagnosticTypes';

export interface DeploymentCheckResult {
  endpoint: string;
  status: number;
  latencyMs: number;
  passed: boolean;
  message: string;
}

export interface DeploymentDiagnosticReport {
  timestamp: string;
  overallPassed: boolean;
  checks: DeploymentCheckResult[];
  issues: DiagnosticIssue[];
}

export class DeploymentDiagnostics {
  /**
   * Executes post-deployment checks against host service
   */
  public static async verifyDeployment(baseUrl: string = 'http://localhost:3000'): Promise<DeploymentDiagnosticReport> {
    const issues: DiagnosticIssue[] = [];
    const checks: DeploymentCheckResult[] = [];

    const endpointsToVerify = [
      { path: '/', expectedStatus: 200 },
      { path: '/health', expectedStatus: 200 },
      { path: '/api/health', expectedStatus: 200 },
      { path: '/api/shows?page=1', expectedStatus: 200 },
    ];

    let overallPassed = true;

    for (const ep of endpointsToVerify) {
      const url = `${baseUrl}${ep.path}`;
      const start = Date.now();
      try {
        const res = await fetch(url);
        const latencyMs = Date.now() - start;
        const passed = res.status === ep.expectedStatus;

        checks.push({
          endpoint: ep.path,
          status: res.status,
          latencyMs,
          passed,
          message: passed ? 'OK' : `Expected HTTP ${ep.expectedStatus}, got ${res.status}`,
        });

        if (!passed) {
          overallPassed = false;
          issues.push({
            id: `DEPLOY-${Date.now()}-${ep.path.replace(/[^a-z0-9]/gi, '')}`,
            category: 'DEPLOYMENT',
            severity: 'CRITICAL',
            timestamp: new Date().toISOString(),
            subsystem: 'DEPLOYMENT_VERIFIER',
            affectedFile: 'server.ts / vercel.json',
            errorMessage: `Post-deployment verification failed for endpoint "${ep.path}" (HTTP ${res.status})`,
            probableCause: 'Route routing error, missing Express route, or proxy misconfiguration',
            confidenceLevel: 'HIGH',
            recommendedFix: 'Inspect server.ts route mappings and vercel.json /api/* proxy destinations',
            verificationProcedure: `Curl ${url}`,
          });
        }
      } catch (err: any) {
        const latencyMs = Date.now() - start;
        overallPassed = false;

        checks.push({
          endpoint: ep.path,
          status: 0,
          latencyMs,
          passed: false,
          message: err.message || 'Connection refused',
        });

        issues.push({
          id: `DEPLOY-${Date.now()}-${ep.path.replace(/[^a-z0-9]/gi, '')}`,
          category: 'DEPLOYMENT',
          severity: 'CRITICAL',
          timestamp: new Date().toISOString(),
          subsystem: 'DEPLOYMENT_VERIFIER',
          affectedFile: 'server.ts',
          errorMessage: `Post-deployment endpoint "${ep.path}" unreachable: ${err.message}`,
          probableCause: 'Service port binding failure or web service down on target environment',
          confidenceLevel: 'HIGH',
          recommendedFix: 'Ensure PORT environment variable is honored in server.ts and service is running',
          verificationProcedure: `Curl ${url}`,
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      overallPassed,
      checks,
      issues,
    };
  }
}
