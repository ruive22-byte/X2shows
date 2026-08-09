import fs from 'fs';
import path from 'path';
import { DiagnosticIssue } from './diagnosticTypes';

export interface ScannerResult {
  filesChecked: number;
  missingDependencies: string[];
  unusedDependencies: string[];
  scriptIssues: string[];
  configErrors: string[];
  issues: DiagnosticIssue[];
}

export class ScannerDiagnostics {
  /**
   * Scans workspace configuration safely without modifying files
   */
  public static async runProjectScan(projectRoot: string = process.cwd()): Promise<ScannerResult> {
    const issues: DiagnosticIssue[] = [];
    let filesChecked = 0;
    const missingDependencies: string[] = [];
    const unusedDependencies: string[] = [];
    const scriptIssues: string[] = [];
    const configErrors: string[] = [];

    // 1. Inspect package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      issues.push({
        id: `SCAN-${Date.now()}-1`,
        category: 'PACKAGE_CONFIG',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        subsystem: 'CONFIG_SCANNER',
        affectedFile: 'package.json',
        errorMessage: 'package.json does not exist in project root',
        probableCause: 'Project root missing manifest',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Restore package.json from repository history',
        verificationProcedure: 'Verify package.json exists',
      });
      configErrors.push('Missing package.json');
    } else {
      filesChecked++;
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Check for forbidden Next.js dependency
        if (allDeps['next']) {
          issues.push({
            id: `SCAN-${Date.now()}-2`,
            category: 'PACKAGE_CONFIG',
            severity: 'CRITICAL',
            timestamp: new Date().toISOString(),
            subsystem: 'ARCHITECTURE_GUARD',
            affectedFile: 'package.json',
            errorMessage: 'Forbidden "next" dependency found in package.json',
            probableCause: 'Accidental Next.js installation or template mismatch',
            confidenceLevel: 'HIGH',
            recommendedFix: 'Run "npm uninstall next --legacy-peer-deps"',
            verificationProcedure: 'Run npm run guard',
          });
          configErrors.push('Forbidden dependency "next" detected');
        }

        // Verify build script
        if (!pkg.scripts?.build) {
          issues.push({
            id: `SCAN-${Date.now()}-3`,
            category: 'PACKAGE_CONFIG',
            severity: 'ERROR',
            timestamp: new Date().toISOString(),
            subsystem: 'CONFIG_SCANNER',
            affectedFile: 'package.json',
            errorMessage: 'Missing "build" script in package.json',
            probableCause: 'Build script removed or corrupted',
            confidenceLevel: 'HIGH',
            recommendedFix:
              'Set "build": "tsx scripts/checkArchitecture.ts && vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs"',
            verificationProcedure: 'Run npm run build',
          });
          scriptIssues.push('Missing build script');
        }
      } catch (err: any) {
        configErrors.push(`Failed to parse package.json: ${err.message}`);
      }
    }

    // 2. Inspect tsconfig.json
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      filesChecked++;
    } else {
      issues.push({
        id: `SCAN-${Date.now()}-4`,
        category: 'TYPESCRIPT',
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
        subsystem: 'CONFIG_SCANNER',
        affectedFile: 'tsconfig.json',
        errorMessage: 'tsconfig.json is missing',
        probableCause: 'TypeScript configuration missing',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Add standard tsconfig.json for Vite + Express',
        verificationProcedure: 'Check tsconfig.json presence',
      });
      configErrors.push('Missing tsconfig.json');
    }

    // 3. Inspect vite.config.ts
    const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      filesChecked++;
    } else {
      issues.push({
        id: `SCAN-${Date.now()}-5`,
        category: 'BUILD_FAILURE',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        subsystem: 'CONFIG_SCANNER',
        affectedFile: 'vite.config.ts',
        errorMessage: 'vite.config.ts is missing',
        probableCause: 'Vite config file deleted',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Restore vite.config.ts',
        verificationProcedure: 'Verify vite.config.ts exists',
      });
      configErrors.push('Missing vite.config.ts');
    }

    // 4. Inspect server.ts
    const serverPath = path.join(projectRoot, 'server.ts');
    if (fs.existsSync(serverPath)) {
      filesChecked++;
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      if (!serverContent.includes('process.env.PORT')) {
        issues.push({
          id: `SCAN-${Date.now()}-6`,
          category: 'SERVER_PORT_CONFIG',
          severity: 'WARNING',
          timestamp: new Date().toISOString(),
          subsystem: 'CONFIG_SCANNER',
          affectedFile: 'server.ts',
          errorMessage: 'server.ts may not be reading dynamic process.env.PORT',
          probableCause: 'Hardcoded port 3000 prevents Render/Cloud Run binding to dynamic port',
          confidenceLevel: 'MEDIUM',
          recommendedFix: 'Use Number(process.env.PORT) || 3000 in server.ts',
          verificationProcedure: 'Check PORT initialization in server.ts',
        });
      }
    } else {
      issues.push({
        id: `SCAN-${Date.now()}-7`,
        category: 'SERVER_STARTUP',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        subsystem: 'CONFIG_SCANNER',
        affectedFile: 'server.ts',
        errorMessage: 'server.ts entry point missing',
        probableCause: 'Backend server file missing',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Restore Express server.ts',
        verificationProcedure: 'Verify server.ts presence',
      });
      configErrors.push('Missing server.ts');
    }

    // 5. Inspect vercel.json
    const vercelJsonPath = path.join(projectRoot, 'vercel.json');
    if (fs.existsSync(vercelJsonPath)) {
      filesChecked++;
      try {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
        const apiRewrite = vercelConfig.rewrites?.find((r: any) => r.source === '/api/(.*)');
        if (!apiRewrite || apiRewrite.destination === '/index.html') {
          issues.push({
            id: `SCAN-${Date.now()}-8`,
            category: 'ROUTE_FAILURE',
            severity: 'ERROR',
            timestamp: new Date().toISOString(),
            subsystem: 'CONFIG_SCANNER',
            affectedFile: 'vercel.json',
            errorMessage: 'vercel.json /api/* rewrite destination is invalid or set to /index.html',
            probableCause: 'Incorrect SPA fallback rewrite for API routes',
            confidenceLevel: 'HIGH',
            recommendedFix: 'Set vercel.json /api/(.*) rewrite to Express backend URL',
            verificationProcedure: 'Check vercel.json rewrites array',
          });
          configErrors.push('Invalid vercel.json /api/* rewrite');
        }
      } catch (err: any) {
        configErrors.push(`Failed to parse vercel.json: ${err.message}`);
      }
    }

    return {
      filesChecked,
      missingDependencies,
      unusedDependencies,
      scriptIssues,
      configErrors,
      issues,
    };
  }
}
