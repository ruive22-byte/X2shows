import { EMBED_SERVERS } from './serverResolver';
import { TmdbAnimatedShow } from '../data/tmdbData';

export interface AuditIssue {
  severity: 'CRITICAL' | 'WARNING' | 'PERFORMANCE';
  category: 'CATALOG_DUPLICATE' | 'SERVER_DOWN' | 'MISSING_MEDIA' | 'RENDER_LAG';
  message: string;
  details: any;
}

export interface AuditReport {
  timestamp: string;
  totalShowsAudited: number;
  totalServersAudited: number;
  healthy: boolean;
  issues: AuditIssue[];
}

export class AppAuditor {
  /**
   * 1. Checks catalog for duplicate TMDB IDs or duplicate titles
   */
  public static auditCatalogDuplicates(shows: TmdbAnimatedShow[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const seenIds = new Set<number | string>();
    const seenTitles = new Set<string>();

    shows.forEach((show) => {
      const id = show.tmdbId || show.id;
      const normalizedTitle = (show.title || show.name || '').toLowerCase().trim();

      // Check Duplicate ID
      if (seenIds.has(id)) {
        issues.push({
          severity: 'CRITICAL',
          category: 'CATALOG_DUPLICATE',
          message: `Duplicate show ID found in catalog: "${show.title || show.name}" (ID: ${id})`,
          details: { id, title: show.title || show.name },
        });
      } else {
        seenIds.add(id);
      }

      // Check Duplicate Title
      if (seenTitles.has(normalizedTitle) && normalizedTitle.length > 0) {
        issues.push({
          severity: 'WARNING',
          category: 'CATALOG_DUPLICATE',
          message: `Duplicate show title found: "${show.title || show.name}"`,
          details: { title: show.title || show.name },
        });
      } else if (normalizedTitle.length > 0) {
        seenTitles.add(normalizedTitle);
      }

      // Check Missing Posters/Backdrops
      const hasPoster = Boolean(
        show.posterUrl ||
        show.poster_path ||
        show.resolvedPosterUrl ||
        (show as any).poster
      );

      if (!hasPoster) {
        issues.push({
          severity: 'WARNING',
          category: 'MISSING_MEDIA',
          message: `Show missing poster artwork: "${show.title || show.name || 'Untitled'}"`,
          details: { id },
        });
      }
    });

    return issues;
  }

  /**
   * 2. Probes stream servers to verify active URL generator configurations
   */
  public static async auditServers(testTmdbId = 324857): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const mockShow: any = { id: testTmdbId, tmdbId: testTmdbId, title: 'Audit Test', media_type: 'movie' };

    for (const server of EMBED_SERVERS) {
      try {
        const testUrl = server.getUrl(mockShow, 1, 1);
        if (!testUrl || typeof testUrl !== 'string' || !testUrl.startsWith('https://')) {
          issues.push({
            severity: 'CRITICAL',
            category: 'SERVER_DOWN',
            message: `Stream server missing valid endpoint configuration: "${server.name}"`,
            details: { serverId: server.id },
          });
        }
      } catch {
        issues.push({
          severity: 'CRITICAL',
          category: 'SERVER_DOWN',
          message: `Stream server unreachable or offline: "${server.name}"`,
          details: { serverId: server.id },
        });
      }
    }

    return issues;
  }

  /**
   * 3. Runs complete system audit and outputs structured report for AI
   */
  public static async runFullAudit(catalogShows: TmdbAnimatedShow[]): Promise<AuditReport> {
    console.log('🔍 Running Fakeflix System Diagnostic Audit...');

    const duplicateIssues = this.auditCatalogDuplicates(catalogShows);
    const serverIssues = await this.auditServers();
    const allIssues = [...duplicateIssues, ...serverIssues];

    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      totalShowsAudited: catalogShows.length,
      totalServersAudited: EMBED_SERVERS.length,
      healthy: allIssues.filter((i) => i.severity === 'CRITICAL').length === 0,
      issues: allIssues,
    };

    return report;
  }
}
