import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Database,
  Search,
  Sparkles,
  Shield,
  Layers,
  Terminal,
  Wrench,
  X,
  FileCode,
} from 'lucide-react';
import { DiagnosticReport, FixReport, DeveloperActionType } from '../../services/diagnostics/diagnosticTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperDiagnosticsPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'HEALTH' | 'ERRORS' | 'CATALOG' | 'DEPLOYMENT' | 'FIX_ENGINE'>('SYSTEM');
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFix, setSelectedFix] = useState<FixReport | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/diagnostics');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Developer session or authorization required.`);
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAction = async (action: DeveloperActionType, params?: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/diagnostics/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      const result = await res.json();
      if (action === 'GENERATE_FIX_PLAN') {
        setSelectedFix(result.data);
      } else {
        await fetchDiagnostics();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0d0f17] text-slate-200 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Developer Diagnostics & Self-Healing</h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  AUTHENTICATED DEV
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">XTwo Shows Diagnostics Engine v2.5</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDiagnostics}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              Refresh Scan
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-2 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" /> ACTIONS:
          </span>
          <button
            onClick={() => triggerAction('RUN_HEALTH_CHECK')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700/80 text-cyan-300 rounded border border-slate-700 font-mono text-[11px]"
          >
            Health Check
          </button>
          <button
            onClick={() => triggerAction('CHECK_BUILD')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700/80 text-emerald-300 rounded border border-slate-700 font-mono text-[11px]"
          >
            Check Build
          </button>
          <button
            onClick={() => triggerAction('CHECK_APIS')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700/80 text-amber-300 rounded border border-slate-700 font-mono text-[11px]"
          >
            Check APIs
          </button>
          <button
            onClick={() => triggerAction('CHECK_CATALOG')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700/80 text-purple-300 rounded border border-slate-700 font-mono text-[11px]"
          >
            Check Catalog
          </button>
          <button
            onClick={() => triggerAction('INGEST_SHOW')}
            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded border border-indigo-500/30 font-mono text-[11px] flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" /> Ingest Test Show
          </button>
          <button
            onClick={() => triggerAction('RUN_DEPLOYMENT_GUARDIAN')}
            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded border border-cyan-500/40 font-mono text-[11px] font-bold flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-cyan-400" /> Run Deployment Guardian
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-slate-900/30 border-b border-slate-800 flex items-center gap-1 text-xs font-medium">
          {[
            { id: 'SYSTEM', label: 'System', icon: Cpu },
            { id: 'HEALTH', label: 'Subsystems', icon: Activity },
            { id: 'ERRORS', label: 'Errors', icon: AlertTriangle, count: report?.issues?.length },
            { id: 'CATALOG', label: 'Catalog & Search', icon: Database },
            { id: 'DEPLOYMENT', label: 'Deployment', icon: Shield },
            { id: 'FIX_ENGINE', label: 'AI Fix Engine', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition font-mono ${
                  active
                    ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error Bar */}
        {errorMsg && (
          <div className="px-6 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!report && !loading ? (
            <div className="text-center py-12 text-slate-400 font-mono">
              Click "Refresh Scan" to run a developer diagnostic scan.
            </div>
          ) : null}

          {/* SYSTEM TAB */}
          {activeTab === 'SYSTEM' && report && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">OVERALL STATUS</div>
                  <div className="text-xl font-bold mt-1 flex items-center gap-2">
                    {report.health.overallStatus === 'HEALTHY' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400">HEALTHY</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400">{report.health.overallStatus}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">UPTIME</div>
                  <div className="text-xl font-bold mt-1 text-white font-mono">
                    {report.health.uptimeSeconds}s
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">ENVIRONMENT</div>
                  <div className="text-xl font-bold mt-1 text-cyan-400 font-mono">
                    {report.health.environment}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">MEMORY (HEAP)</div>
                  <div className="text-xl font-bold mt-1 text-purple-400 font-mono">
                    {report.health.memoryUsage.heapUsedMb} MB / {report.health.memoryUsage.heapTotalMb} MB
                  </div>
                </div>
              </div>

              {/* Scanner Results */}
              {report.scannerResults && (
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 font-mono">
                    <FileCode className="w-4 h-4 text-cyan-400" /> ARCHITECTURE SCANNER
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div>Files Checked: <span className="text-white font-bold">{report.scannerResults.filesChecked}</span></div>
                    <div>Missing Deps: <span className="text-emerald-400 font-bold">{report.scannerResults.missingDependencies.length}</span></div>
                    <div>Config Errors: <span className="text-amber-400 font-bold">{report.scannerResults.configErrors.length}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HEALTH / SUBSYSTEMS TAB */}
          {activeTab === 'HEALTH' && report && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> SUBSYSTEM HEALTH MATRIX
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(report.health.subsystems).map(([key, sub]) => (
                  <div key={key} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-300 uppercase">{sub.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{sub.message || 'Operational'}</div>
                      {sub.latencyMs !== undefined && (
                        <div className="text-[11px] font-mono text-cyan-400/80 mt-1">
                          Latency: {sub.latencyMs}ms
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase ${
                        sub.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERRORS TAB */}
          {activeTab === 'ERRORS' && report && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> RECORDED DIAGNOSTIC ISSUES ({report.issues.length})
                </h3>
              </div>

              {report.issues.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono bg-slate-900/30 rounded-xl border border-slate-800">
                  🎉 No errors or critical issues detected! All systems nominal.
                </div>
              ) : (
                <div className="space-y-3">
                  {report.issues.map((issue) => (
                    <div key={issue.id} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                              issue.severity === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : issue.severity === 'ERROR'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}
                          >
                            {issue.severity}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">{issue.category}</span>
                          <span className="text-xs text-slate-400 font-mono">[{issue.subsystem}]</span>
                        </div>
                        <button
                          onClick={() => triggerAction('GENERATE_FIX_PLAN', { issue })}
                          className="px-2.5 py-1 text-[11px] font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Generate Fix Plan
                        </button>
                      </div>

                      <div className="text-xs text-slate-200 font-mono">{issue.errorMessage}</div>

                      <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500">PROBABLE CAUSE:</span> {issue.probableCause}
                        <br />
                        <span className="text-slate-500">RECOMMENDED FIX:</span> {issue.recommendedFix}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CATALOG & SEARCH TAB */}
          {activeTab === 'CATALOG' && report && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 font-mono mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" /> CATALOG INTEGRITY AUDIT
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">TOTAL SHOWS</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">{report.catalogHealth?.totalShows || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">DUPLICATES</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">{report.catalogHealth?.duplicateCount || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">MISSING METADATA</div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{report.catalogHealth?.missingMetadataCount || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">INVALID RECORDS</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{report.catalogHealth?.invalidRecordsCount || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEPLOYMENT TAB */}
          {activeTab === 'DEPLOYMENT' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" /> DEPLOYMENT GUARDIAN & SECURITY BOUNDARY
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                    SECURED BY REQUIRE_AUTH()
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-slate-300">
                  <div className="text-cyan-400 font-bold mb-1">🔒 Security Architecture Notice:</div>
                  The keyboard shortcut <code className="text-white bg-slate-900 px-1 py-0.5 rounded">Ctrl + Shift + D</code> is strictly a UI shortcut. All sensitive diagnostic API endpoints (<code className="text-amber-300">/api/diagnostics/*</code>) are enforced server-side by <code className="text-emerald-300">requireAuth()</code> session validation. Discovering the shortcut grants zero API access without valid session cookies.
                </div>

                <div className="space-y-2">
                  <div className="text-slate-400 font-bold">DEPLOYMENT GUARDIAN PIPELINE:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-cyan-400 font-bold">1. PRE-DEPLOY</div>
                      <div className="text-slate-400 mt-1">TS check, deps check, arch check, secret scan, build</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-emerald-400 font-bold">2. POST-DEPLOY</div>
                      <div className="text-slate-400 mt-1">/health, /api/health, /api/shows, search, recommendations</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-rose-400 font-bold">3. FAIL-SAFE</div>
                      <div className="text-slate-400 mt-1">Capture logs, sanitize secrets, patch & report</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => triggerAction('RUN_DEPLOYMENT_GUARDIAN')}
                  className="px-4 py-2 text-xs font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/40 transition flex items-center gap-2 font-bold"
                >
                  <Shield className="w-4 h-4" /> Run Full Deployment Guardian
                </button>
              </div>
            </div>
          )}

          {/* FIX ENGINE TAB */}
          {activeTab === 'FIX_ENGINE' && (
            <div className="space-y-4 font-mono">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> AUTOMATIC FIX PIPELINE STATE MACHINE
              </h3>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold">PIPELINE STATES:</span>
                {['DETECTED', 'ANALYZING', 'ROOT_CAUSE_FOUND', 'PATCH_PROPOSED', 'PATCH_APPLIED', 'BUILDING', 'TESTING', 'VERIFIED', 'READY_TO_DEPLOY'].map((st, i) => (
                  <span key={st} className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                      {st}
                    </span>
                    {i < 8 && <span className="text-slate-500">➔</span>}
                  </span>
                ))}
              </div>

              {selectedFix ? (
                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400">PROBLEM:</span>
                    <div className="text-white font-bold text-sm mt-0.5">{selectedFix.problem}</div>
                  </div>

                  <div>
                    <span className="text-slate-400">CAUSE:</span>
                    <div className="text-slate-300 mt-0.5">{selectedFix.cause}</div>
                  </div>

                  <div>
                    <span className="text-slate-400">AFFECTED FILES:</span>
                    <div className="text-cyan-400 mt-0.5">{selectedFix.affectedFiles.join(', ')}</div>
                  </div>

                  <div>
                    <span className="text-slate-400">PROPOSED SAFE PATCH:</span>
                    <pre className="mt-1 p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre-wrap">
                      {selectedFix.proposedPatchSnippet}
                    </pre>
                  </div>

                  <div>
                    <span className="text-slate-400">STATE TRANSITION LOGS:</span>
                    <ul className="mt-1 space-y-1 text-slate-300 list-none">
                      {selectedFix.verificationSteps.map((step, idx) => (
                        <li key={idx} className="p-2 bg-slate-950 rounded border border-slate-800/80 text-[11px] text-cyan-300 font-mono">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800 text-xs">
                  Select an issue from the Errors tab and click "Generate Fix Plan" to execute the state machine pipeline.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
