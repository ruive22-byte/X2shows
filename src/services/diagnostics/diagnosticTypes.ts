export type DiagnosticSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type DiagnosticCategory =
  | 'TYPESCRIPT'
  | 'JAVASCRIPT'
  | 'REACT_RENDER'
  | 'MISSING_IMPORT'
  | 'MISSING_DEPENDENCY'
  | 'PACKAGE_CONFIG'
  | 'BUILD_FAILURE'
  | 'SERVER_STARTUP'
  | 'API_FAILURE'
  | 'HTTP_ERROR'
  | 'ENV_CONFIG'
  | 'ROUTE_FAILURE'
  | 'HEALTH_CHECK'
  | 'SERVER_PORT_CONFIG'
  | 'STATIC_ASSET'
  | 'CATALOG_DATA'
  | 'CATALOG_DUPLICATE'
  | 'METADATA_MISSING'
  | 'RELATIONSHIP_BROKEN'
  | 'RECOMMENDATION'
  | 'SEARCH_ENGINE'
  | 'DEPLOYMENT'
  | 'RENDER_RUNTIME'
  | 'PERFORMANCE'
  | 'UNCATCHED_EXCEPTION';

export interface DiagnosticIssue {
  id: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  timestamp: string;
  subsystem: string;
  affectedFile?: string;
  affectedFunction?: string;
  errorMessage: string;
  probableCause: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedFix: string;
  verificationProcedure: string;
  details?: Record<string, any>;
}

export type SubsystemStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';

export interface SubsystemHealth {
  name: string;
  status: SubsystemStatus;
  latencyMs?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface SystemHealthSummary {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  uptimeSeconds: number;
  environment: string;
  nodeVersion: string;
  appVersion: string;
  buildVersion?: string;
  subsystems: {
    server: SubsystemHealth;
    api: SubsystemHealth;
    catalog: SubsystemHealth;
    search: SubsystemHealth;
    recommendations: SubsystemHealth;
    tmdb: SubsystemHealth;
    deployment: SubsystemHealth;
  };
  memoryUsage: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
  };
  timestamp: string;
  diagnosticSummary: {
    totalIssues: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  health: SystemHealthSummary;
  issues: DiagnosticIssue[];
  scannerResults?: {
    filesChecked: number;
    missingDependencies: string[];
    unusedDependencies: string[];
    scriptIssues: string[];
    configErrors: string[];
  };
  catalogHealth?: {
    totalShows: number;
    duplicateCount: number;
    missingMetadataCount: number;
    invalidRecordsCount: number;
  };
  deploymentCheck?: {
    endpoint: string;
    status: number;
    latencyMs: number;
    passed: boolean;
  };
}

export interface FixReport {
  problem: string;
  cause: string;
  evidence: string;
  affectedFiles: string[];
  affectedFunctions: string[];
  recommendedFix: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationSteps: string[];
  proposedPatchSnippet?: string;
}

export type DeveloperActionType =
  | 'RUN_HEALTH_CHECK'
  | 'RUN_FULL_DIAGNOSTIC'
  | 'CHECK_BUILD'
  | 'CHECK_APIS'
  | 'CHECK_CATALOG'
  | 'CHECK_SEARCH'
  | 'CHECK_RECOMMENDATIONS'
  | 'CHECK_DEPLOYMENT'
  | 'RUN_DEPLOYMENT_GUARDIAN'
  | 'INGEST_SHOW'
  | 'GENERATE_FIX_PLAN'
  | 'VERIFY_FIX';

export interface DeveloperActionRequest {
  action: DeveloperActionType;
  params?: Record<string, any>;
}
