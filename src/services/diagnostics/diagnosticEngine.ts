import {
  DiagnosticReport,
  SystemHealthSummary,
  DiagnosticIssue,
  DeveloperActionRequest,
  FixReport,
} from './diagnosticTypes';
import { DiagnosticSanitizer } from './diagnosticSanitizer';
import { ErrorCollector } from './errorCollector';
import { ScannerDiagnostics } from './scannerDiagnostics';
import { BuildDiagnostics } from './buildDiagnostics';
import { ApiDiagnostics } from './apiDiagnostics';
import { CatalogDiagnostics } from './catalogDiagnostics';
import { SearchDiagnostics } from './searchDiagnostics';
import { RecommendationDiagnostics } from './recommendationDiagnostics';
import { DeploymentDiagnostics } from './deploymentDiagnostics';
import { DeploymentGuardian } from './deploymentGuardian';
import { ShowIngestionPipeline } from '../catalog/showIngestionPipeline';
import { FixEngine } from './fixEngine';

export class DiagnosticEngine {
  private static startTime = Date.now();

  /**
   * Generates public, sanitized system health summary (safe for GET /api/health)
   */
  public static async getSystemHealth(baseUrl: string = 'http://localhost:3000'): Promise<SystemHealthSummary> {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const mem = process.memoryUsage();

    const apiReport = await ApiDiagnostics.testApiSubsystems(baseUrl);
    const catalogReport = CatalogDiagnostics.runCatalogAudit();
    const searchReport = SearchDiagnostics.testSearchEngine();
    const recommendationReport = RecommendationDiagnostics.testRecommendationEngine();
    const recentErrors = ErrorCollector.getRecentErrors();

    const allIssues = [
      ...recentErrors,
      ...apiReport.issues,
      ...catalogReport.issues,
      ...searchReport.issues,
      ...recommendationReport.issues,
    ];

    const criticalCount = allIssues.filter((i) => i.severity === 'CRITICAL').length;
    const errorCount = allIssues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = allIssues.filter((i) => i.severity === 'WARNING').length;
    const infoCount = allIssues.filter((i) => i.severity === 'INFO').length;

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED' = 'HEALTHY';
    if (criticalCount > 0) {
      overallStatus = 'FAILED';
    } else if (errorCount > 0 || warningCount > 5) {
      overallStatus = 'DEGRADED';
    }

    const summary: SystemHealthSummary = {
      overallStatus,
      uptimeSeconds,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      appVersion: '2.5.0',
      buildVersion: '2026.08.09',
      subsystems: {
        server: {
          name: 'EXPRESS_SERVER',
          status: 'HEALTHY',
          message: 'Express application active and listening',
        },
        api: apiReport.healthEndpoint,
        catalog: {
          name: 'CATALOG_DATABASE',
          status: catalogReport.duplicateCount > 0 ? 'DEGRADED' : 'HEALTHY',
          message: `Total ${catalogReport.totalShows} shows. ${catalogReport.duplicateCount} duplicates found.`,
        },
        search: searchReport.health,
        recommendations: recommendationReport.health,
        tmdb: {
          name: 'TMDB_METADATA_API',
          status: apiReport.tmdbConfigured ? 'HEALTHY' : 'DEGRADED',
          message: apiReport.tmdbConfigured ? 'TMDB Key Configured' : 'TMDB Key Missing',
        },
        deployment: {
          name: 'DEPLOYMENT_TARGET',
          status: 'HEALTHY',
          message: 'Vite Frontend + Express Backend',
        },
      },
      memoryUsage: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
      diagnosticSummary: {
        totalIssues: allIssues.length,
        criticalCount,
        errorCount,
        warningCount,
        infoCount,
      },
    };

    return DiagnosticSanitizer.sanitizeObject(summary);
  }

  /**
   * Generates a complete developer-only diagnostic report (safe for GET /api/diagnostics)
   */
  public static async runFullDiagnostics(baseUrl: string = 'http://localhost:3000'): Promise<DiagnosticReport> {
    const health = await this.getSystemHealth(baseUrl);
    const scanner = await ScannerDiagnostics.runProjectScan();
    const build = await BuildDiagnostics.evaluateBuild();
    const catalog = CatalogDiagnostics.runCatalogAudit();
    const deployment = await DeploymentDiagnostics.verifyDeployment(baseUrl);
    const recentErrors = ErrorCollector.getRecentErrors();

    const allIssues: DiagnosticIssue[] = [
      ...recentErrors,
      ...scanner.issues,
      ...build.issues,
      ...catalog.issues,
      ...deployment.issues,
    ];

    const report: DiagnosticReport = {
      id: `DIAG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      health,
      issues: allIssues,
      scannerResults: {
        filesChecked: scanner.filesChecked,
        missingDependencies: scanner.missingDependencies,
        unusedDependencies: scanner.unusedDependencies,
        scriptIssues: scanner.scriptIssues,
        configErrors: scanner.configErrors,
      },
      catalogHealth: {
        totalShows: catalog.totalShows,
        duplicateCount: catalog.duplicateCount,
        missingMetadataCount: catalog.missingMetadataCount,
        invalidRecordsCount: catalog.invalidRecordsCount,
      },
      deploymentCheck: deployment.checks[0]
        ? {
            endpoint: deployment.checks[0].endpoint,
            status: deployment.checks[0].status,
            latencyMs: deployment.checks[0].latencyMs,
            passed: deployment.checks[0].passed,
          }
        : undefined,
    };

    return DiagnosticSanitizer.sanitizeObject(report);
  }

  /**
   * Executes targeted developer actions
   */
  public static async executeAction(
    req: DeveloperActionRequest,
    baseUrl: string = 'http://localhost:3000'
  ): Promise<{ success: boolean; data: any }> {
    switch (req.action) {
      case 'RUN_HEALTH_CHECK': {
        const health = await this.getSystemHealth(baseUrl);
        return { success: true, data: health };
      }
      case 'RUN_FULL_DIAGNOSTIC': {
        const report = await this.runFullDiagnostics(baseUrl);
        return { success: true, data: report };
      }
      case 'CHECK_BUILD': {
        const build = await BuildDiagnostics.evaluateBuild();
        return { success: true, data: build };
      }
      case 'CHECK_APIS': {
        const api = await ApiDiagnostics.testApiSubsystems(baseUrl);
        return { success: true, data: api };
      }
      case 'CHECK_CATALOG': {
        const cat = CatalogDiagnostics.runCatalogAudit();
        return { success: true, data: cat };
      }
      case 'CHECK_SEARCH': {
        const search = SearchDiagnostics.testSearchEngine();
        return { success: true, data: search };
      }
      case 'CHECK_RECOMMENDATIONS': {
        const recs = RecommendationDiagnostics.testRecommendationEngine();
        return { success: true, data: recs };
      }
      case 'CHECK_DEPLOYMENT': {
        const dep = await DeploymentDiagnostics.verifyDeployment(baseUrl);
        return { success: true, data: dep };
      }
      case 'RUN_DEPLOYMENT_GUARDIAN': {
        const pre = await DeploymentGuardian.runPreDeployCheck();
        const post = await DeploymentGuardian.runPostDeployCheck(baseUrl);
        return { success: pre.passed && post.passed, data: { preDeploy: pre, postDeploy: post } };
      }
      case 'INGEST_SHOW': {
        const rawShow = req.params?.show || { name: 'New Ingested Animated Show', genre_ids: [16, 10759] };
        const ingestionResult = await ShowIngestionPipeline.ingestShow(rawShow);
        return { success: ingestionResult.success, data: ingestionResult };
      }
      case 'GENERATE_FIX_PLAN': {
        const issueToFix: DiagnosticIssue = req.params?.issue || {
          id: 'MANUAL-1',
          category: 'SERVER_STARTUP',
          severity: 'CRITICAL',
          timestamp: new Date().toISOString(),
          subsystem: 'SERVER',
          errorMessage: 'Sample diagnostic issue for fix plan generation',
          probableCause: 'Configuration mismatch',
          confidenceLevel: 'HIGH',
          recommendedFix: 'Review environment variables and build scripts',
          verificationProcedure: 'Run npm run guard',
        };
        const fixReport = await FixEngine.generateFixReport(issueToFix);
        return { success: true, data: fixReport };
      }
      case 'VERIFY_FIX': {
        const dep = await DeploymentDiagnostics.verifyDeployment(baseUrl);
        return { success: dep.overallPassed, data: dep };
      }
      default:
        return { success: false, data: { error: 'Unknown action type' } };
    }
  }
}
