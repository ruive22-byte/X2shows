import fs from 'fs';
import path from 'path';
import { DiagnosticIssue } from './diagnosticTypes';

export interface BuildDiagnosticResult {
  distExists: boolean;
  serverCjsExists: boolean;
  nodeModulesExists: boolean;
  issues: DiagnosticIssue[];
}

export class BuildDiagnostics {
  /**
   * Evaluates project build status and filesystem outputs
   */
  public static async evaluateBuild(projectRoot: string = process.cwd()): Promise<BuildDiagnosticResult> {
    const issues: DiagnosticIssue[] = [];

    const distPath = path.join(projectRoot, 'dist');
    const serverCjsPath = path.join(projectRoot, 'dist', 'server.cjs');
    const nodeModulesPath = path.join(projectRoot, 'node_modules');

    const distExists = fs.existsSync(distPath);
    const serverCjsExists = fs.existsSync(serverCjsPath);
    const nodeModulesExists = fs.existsSync(nodeModulesPath);

    if (!nodeModulesExists) {
      issues.push({
        id: `BUILD-${Date.now()}-1`,
        category: 'MISSING_DEPENDENCY',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        subsystem: 'BUILD_SYSTEM',
        affectedFile: 'node_modules',
        errorMessage: 'node_modules directory is missing',
        probableCause: 'Dependencies have not been installed via npm',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Execute "npm install --legacy-peer-deps"',
        verificationProcedure: 'Verify node_modules directory exists',
      });
    }

    if (!distExists) {
      issues.push({
        id: `BUILD-${Date.now()}-2`,
        category: 'BUILD_FAILURE',
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
        subsystem: 'BUILD_SYSTEM',
        affectedFile: 'dist/',
        errorMessage: 'dist/ build output directory does not exist yet',
        probableCause: 'Build step has not been executed yet',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Execute "npm run build"',
        verificationProcedure: 'Verify dist/ directory and dist/index.html exist',
      });
    } else if (!serverCjsExists) {
      issues.push({
        id: `BUILD-${Date.now()}-3`,
        category: 'BUILD_FAILURE',
        severity: 'ERROR',
        timestamp: new Date().toISOString(),
        subsystem: 'BUILD_SYSTEM',
        affectedFile: 'dist/server.cjs',
        errorMessage: 'dist/server.cjs is missing',
        probableCause: 'esbuild server compilation failed or was skipped during npm run build',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Execute "npm run build" to compile Express backend to dist/server.cjs',
        verificationProcedure: 'Verify dist/server.cjs file exists',
      });
    }

    return {
      distExists,
      serverCjsExists,
      nodeModulesExists,
      issues,
    };
  }
}
