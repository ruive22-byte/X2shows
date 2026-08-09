import { WatchlistItem } from '../types';
import { TmdbAnimatedShow } from '../data/tmdbData';

/**
 * Exports the user's Watchlist and Catalog to JSON file
 */
export function exportCatalogToJson(watchlist: WatchlistItem[], catalog: TmdbAnimatedShow[]) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    appName: 'X2SHOWS Animation Vault',
    version: '2.0.0',
    totalWatchlistCount: watchlist.length,
    totalCatalogCount: catalog.length,
    watchlist: watchlist.map(item => ({
      title: item.title,
      japaneseTitle: item.japaneseTitle,
      status: item.status,
      score: item.score,
      userRating: item.userRating,
      episodesWatched: item.episodesWatched,
      totalEpisodes: item.totalEpisodes,
      progressPercent: item.progressPercent,
      genres: item.genres,
      studio: item.studio,
      releaseYear: item.releaseYear,
      notes: item.notes,
    })),
    catalogHighlights: catalog.slice(0, 50).map(s => ({
      id: s.id,
      title: s.title,
      voteAverage: s.vote_average,
      genres: s.genres,
      durationMinutes: s.durationMinutes,
      totalEpisodes: s.totalEpisodes,
      studio: s.studio,
      qualityBadges: s.qualityBadges,
    }))
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `x2shows-catalog-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a high-contrast Cyber-Teal JPG poster card summarizing the Catalog
 */
export function exportCatalogToJpg(watchlist: WatchlistItem[], catalog: TmdbAnimatedShow[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1600);
  bgGrad.addColorStop(0, '#040a0f');
  bgGrad.addColorStop(0.3, '#07151e');
  bgGrad.addColorStop(0.7, '#0d2836');
  bgGrad.addColorStop(1, '#040a0f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 1600);

  // Outer Border & Glow
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, 1160, 1560);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, 1140, 1540);

  // Brand Header
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText('X2SHOWS', 60, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('ANIMATION VAULT & WATCHLIST REPORT', 330, 110);

  // Accent Line
  const lineGrad = ctx.createLinearGradient(60, 140, 1140, 140);
  lineGrad.addColorStop(0, '#14b8a6');
  lineGrad.addColorStop(0.5, '#00f2fe');
  lineGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(60, 135, 1080, 6);

  // Metadata Badges
  ctx.fillStyle = '#0d2836';
  ctx.fillRect(60, 165, 340, 60);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 165, 340, 60);

  ctx.fillStyle = '#f0fdfa';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Watchlist: ${watchlist.length} Shows`, 80, 202);

  ctx.fillStyle = '#0d2836';
  ctx.fillRect(420, 165, 340, 60);
  ctx.strokeRect(420, 165, 340, 60);

  ctx.fillStyle = '#f0fdfa';
  ctx.fillText(`Catalog Vault: ${catalog.length} Toons`, 440, 202);

  ctx.fillStyle = '#0d2836';
  ctx.fillRect(780, 165, 360, 60);
  ctx.strokeRect(780, 165, 360, 60);

  ctx.fillStyle = '#f0fdfa';
  ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 800, 202);

  // Section 1: Active Watchlist Entries
  ctx.fillStyle = '#14b8a6';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('MY WATCHLIST & QUEUE', 60, 280);

  const displayList = watchlist.slice(0, 8);
  let yPos = 330;

  displayList.forEach((item, index) => {
    // Card background
    ctx.fillStyle = '#07151e';
    ctx.fillRect(60, yPos - 35, 1080, 65);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, yPos - 35, 1080, 65);

    // Number
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${index + 1}.`, 80, yPos + 5);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    const cleanTitle = item.title.length > 32 ? item.title.substring(0, 32) + '...' : item.title;
    ctx.fillText(cleanTitle, 120, yPos + 5);

    // Status Pill
    ctx.fillStyle = item.status === 'Watching' ? '#14b8a6' : item.status === 'Finished' ? '#22c55e' : '#f59e0b';
    ctx.fillRect(580, yPos - 22, 130, 35);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(item.status.toUpperCase(), 600, yPos + 2);

    // Progress
    ctx.fillStyle = '#99f6e4';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Ep ${item.episodesWatched || 0}/${item.totalEpisodes || 12} (${item.progressPercent || 0}%)`, 740, yPos + 5);

    // Rating
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`★ ${item.score || 9.5}`, 980, yPos + 5);

    yPos += 80;
  });

  // Section 2: Top Animated Shows in Catalog
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('FEATURED 4K 120 FPS SAKUGA SELECTION', 60, yPos + 30);
  yPos += 75;

  const topShows = catalog.slice(0, 6);
  topShows.forEach((show, index) => {
    ctx.fillStyle = '#0a2230';
    ctx.fillRect(60, yPos - 30, 1080, 60);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(60, yPos - 30, 1080, 60);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`• ${show.title}`, 85, yPos + 8);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '16px sans-serif';
    ctx.fillText(show.genres?.slice(0, 3).join(' / ') || 'Animation', 580, yPos + 8);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Match: ${show.matchScore || 98}%`, 960, yPos + 8);

    yPos += 72;
  });

  // Footer
  ctx.fillStyle = '#5eead4';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Generated by X2SHOWS • 4K UHD 120 FPS Streaming Shell & TMDB Discover Engine', 60, 1540);

  // Convert to JPG and download
  const jpgUrl = canvas.toDataURL('image/jpeg', 0.92);
  const link = document.createElement('a');
  link.href = jpgUrl;
  link.download = `x2shows-catalog-poster-${new Date().toISOString().split('T')[0]}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and triggers printable/downloadable PDF report of the Catalog
 */
export function exportCatalogToPdf(watchlist: WatchlistItem[], catalog: TmdbAnimatedShow[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF report');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>X2SHOWS Animation Catalog & Watchlist Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #040a0f;
            color: #f0fdfa;
            padding: 30px;
            margin: 0;
          }
          .header {
            border-bottom: 3px solid #00f2fe;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            font-size: 28px;
            font-weight: 900;
            color: #00f2fe;
          }
          .subtitle {
            font-size: 14px;
            color: #99f6e4;
          }
          .stats-bar {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
          }
          .stat-card {
            background: #07151e;
            border: 2px solid #14b8a6;
            padding: 12px 20px;
            border-radius: 12px;
            flex: 1;
          }
          .stat-val {
            font-size: 22px;
            font-weight: bold;
            color: #ffffff;
          }
          .stat-label {
            font-size: 11px;
            color: #7dd3fc;
            text-transform: uppercase;
          }
          h2 {
            font-size: 20px;
            color: #14b8a6;
            margin-top: 30px;
            border-bottom: 1px solid #0d2836;
            padding-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: #07151e;
            border: 1px solid #14b8a6;
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background: #0d2836;
            color: #00f2fe;
            font-weight: bold;
            font-size: 12px;
            text-align: left;
            padding: 10px 14px;
            border-bottom: 2px solid #14b8a6;
          }
          td {
            padding: 10px 14px;
            border-bottom: 1px solid #0d2836;
            font-size: 12px;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 10px;
            background: #14b8a6;
            color: #000000;
          }
          .score {
            color: #facc15;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #5eead4;
            text-align: center;
            border-top: 1px solid #0d2836;
            padding-top: 15px;
          }
          @media print {
            body {
              background-color: #ffffff;
              color: #000000;
            }
            .header {
              border-bottom-color: #000000;
            }
            .logo {
              color: #0284c7;
            }
            .stat-card {
              background: #f8fafc;
              border-color: #cbd5e1;
            }
            .stat-val {
              color: #000000;
            }
            table {
              background: #ffffff;
              border-color: #cbd5e1;
            }
            th {
              background: #f1f5f9;
              color: #0f172a;
              border-bottom-color: #94a3b8;
            }
            td {
              border-bottom-color: #e2e8f0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">X2SHOWS ANIMATION VAULT</div>
            <div class="subtitle">Personal Watchlist & Curated Catalog Report</div>
          </div>
          <div>
            <span class="badge">4K UHD • 120 FPS</span>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-card">
            <div class="stat-val">${watchlist.length}</div>
            <div class="stat-label">Watchlist Shows</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${catalog.length}</div>
            <div class="stat-label">Vault Catalog Shows</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${new Date().toLocaleDateString()}</div>
            <div class="stat-label">Export Date</div>
          </div>
        </div>

        <h2>My Watchlist Queue (${watchlist.length} Shows)</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Rating</th>
              <th>Genres</th>
              <th>Studio</th>
            </tr>
          </thead>
          <tbody>
            ${watchlist.map(item => `
              <tr>
                <td><strong>${item.title}</strong> ${item.japaneseTitle ? `<br/><small style="color:#7dd3fc">${item.japaneseTitle}</small>` : ''}</td>
                <td><span class="badge">${item.status}</span></td>
                <td>Ep ${item.episodesWatched || 0} / ${item.totalEpisodes || 12} (${item.progressPercent || 0}%)</td>
                <td class="score">★ ${item.score || 9.5}</td>
                <td>${item.genres?.slice(0, 2).join(', ') || 'Animation'}</td>
                <td>${item.studio || 'Sakuga'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Featured Catalog Highlights</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Match</th>
              <th>Quality</th>
              <th>Genres</th>
            </tr>
          </thead>
          <tbody>
            ${catalog.slice(0, 15).map(show => `
              <tr>
                <td><strong>${show.title}</strong></td>
                <td>${show.media_type === 'movie' ? 'Movie' : 'TV Series'}</td>
                <td class="score">${show.matchScore || 98}%</td>
                <td><span class="badge">${show.qualityBadges?.[0] || '4K UHD'}</span></td>
                <td>${show.genres?.slice(0, 3).join(', ') || 'Animation'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by X2SHOWS • The Premier Cyber-Teal Animation Shell • Print or Save as PDF
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
