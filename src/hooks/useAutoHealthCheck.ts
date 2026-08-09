import { useEffect, useState } from 'react';
import { AppAuditor, AuditReport } from '../utils/appAuditor';
import { TmdbAnimatedShow } from '../data/tmdbData';

export const useAutoHealthCheck = (catalogShows: TmdbAnimatedShow[], intervalMinutes = 5) => {
  const [latestReport, setLatestReport] = useState<AuditReport | null>(null);
  const [hasCriticalIssues, setHasCriticalIssues] = useState<boolean>(false);

  useEffect(() => {
    if (!catalogShows || catalogShows.length === 0) return;

    const executeAudit = async () => {
      const report = await AppAuditor.runFullAudit(catalogShows);
      setLatestReport(report);

      const critical = report.issues.some((issue) => issue.severity === 'CRITICAL');
      setHasCriticalIssues(critical);

      if (critical) {
        console.warn('🚨 [Auto Health Check] Critical issues detected in app environment:', report.issues);
      }
    };

    // 1. Run audit automatically on initial startup
    executeAudit();

    // 2. Set background timer to re-audit automatically
    const timerId = setInterval(executeAudit, intervalMinutes * 60 * 1000);

    return () => clearInterval(timerId);
  }, [catalogShows, intervalMinutes]);

  return { latestReport, hasCriticalIssues };
};
