import { SubsystemHealth, DiagnosticIssue } from './diagnosticTypes';

export interface ApiDiagnosticReport {
  healthEndpoint: SubsystemHealth;
  showsApi: SubsystemHealth;
  tmdbConfigured: boolean;
  aiConfigured: boolean;
  firebaseConfigured: boolean;
  issues: DiagnosticIssue[];
}

export class ApiDiagnostics {
  /**
   * Probes active API endpoints and subsystem availability
   */
  public static async testApiSubsystems(baseUrl: string = 'http://localhost:3000'): Promise<ApiDiagnosticReport> {
    const issues: DiagnosticIssue[] = [];

    let tmdbConfigured = false;
    let aiConfigured = false;
    let firebaseConfigured = false;

    // 1. Probe /api/health
    let healthStatus: SubsystemHealth = {
      name: 'API_HEALTH_ENDPOINT',
      status: 'UNKNOWN',
    };

    const startHealth = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      const latency = Date.now() - startHealth;

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        tmdbConfigured = Boolean(data.tmdbConfigured);
        aiConfigured = Boolean(data.aiAvailable);
        firebaseConfigured = Boolean(data.firebaseConfigured);

        healthStatus = {
          name: 'API_HEALTH_ENDPOINT',
          status: 'HEALTHY',
          latencyMs: latency,
          message: 'Endpoint returned 200 OK',
          details: {
            service: data.service || 'XTwo Shows API',
            aiAvailable: aiConfigured ? 'CONFIGURED' : 'MISSING',
            tmdbConfigured: tmdbConfigured ? 'CONFIGURED' : 'MISSING',
            firebaseConfigured: firebaseConfigured ? 'CONFIGURED' : 'MISSING',
          },
        };
      } else {
        healthStatus = {
          name: 'API_HEALTH_ENDPOINT',
          status: 'FAILED',
          latencyMs: latency,
          message: `HTTP ${res.status} ${res.statusText}`,
        };
        issues.push({
          id: `API-${Date.now()}-1`,
          category: 'HTTP_ERROR',
          severity: 'CRITICAL',
          timestamp: new Date().toISOString(),
          subsystem: 'API',
          affectedFile: 'server.ts',
          errorMessage: `/api/health returned HTTP status ${res.status}`,
          probableCause: 'Express server error or route handler crash',
          confidenceLevel: 'HIGH',
          recommendedFix: 'Check server logs and ensure server.ts is running properly',
          verificationProcedure: 'GET /api/health',
        });
      }
    } catch (err: any) {
      healthStatus = {
        name: 'API_HEALTH_ENDPOINT',
        status: 'FAILED',
        latencyMs: Date.now() - startHealth,
        message: err.message || 'Connection refused',
      };
      issues.push({
        id: `API-${Date.now()}-2`,
        category: 'SERVER_STARTUP',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        subsystem: 'API',
        affectedFile: 'server.ts',
        errorMessage: `Failed to connect to ${baseUrl}/api/health: ${err.message}`,
        probableCause: 'Express server is not running or listening on target port',
        confidenceLevel: 'HIGH',
        recommendedFix: 'Start Express server with npm run dev or npm start',
        verificationProcedure: 'Curl http://localhost:3000/api/health',
      });
    }

    // 2. Probe /api/shows (Catalog sample API)
    let showsStatus: SubsystemHealth = {
      name: 'SHOWS_CATALOG_API',
      status: 'UNKNOWN',
    };

    const startShows = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/shows?page=1`);
      const latency = Date.now() - startShows;

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const count = Array.isArray(data.results) ? data.results.length : 0;
        showsStatus = {
          name: 'SHOWS_CATALOG_API',
          status: 'HEALTHY',
          latencyMs: latency,
          message: `Returned ${count} items`,
          details: { itemsCount: count },
        };
      } else {
        showsStatus = {
          name: 'SHOWS_CATALOG_API',
          status: 'DEGRADED',
          latencyMs: latency,
          message: `HTTP ${res.status}`,
        };
      }
    } catch (err: any) {
      showsStatus = {
        name: 'SHOWS_CATALOG_API',
        status: 'FAILED',
        latencyMs: Date.now() - startShows,
        message: err.message || 'Request failed',
      };
    }

    return {
      healthEndpoint: healthStatus,
      showsApi: showsStatus,
      tmdbConfigured,
      aiConfigured,
      firebaseConfigured,
      issues,
    };
  }
}
