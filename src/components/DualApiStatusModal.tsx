import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, RefreshCw, Zap, Database, Server, 
  Search, Film, Sparkles, Shield, Image, Cpu, Check, Trash2, ArrowRight, Key, Layers
} from 'lucide-react';
import { 
  getApiFallbackStats, 
  clearApiFallbackCache, 
  searchTvMazeShow, 
  searchOmdbShow,
  fetchTvMazeEpisodes,
  preWarmCatalogCache,
  getOmdbApiKey,
  setOmdbApiKey,
  ApiFallbackStats,
  stripHtml
} from '../services/apiFallbackService';
import { TMDB_ANIMATED_CATALOG } from '../data/tmdbData';

interface DualApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const DualApiStatusModal: React.FC<DualApiStatusModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [stats, setStats] = useState<ApiFallbackStats>(getApiFallbackStats());
  const [testQuery, setTestQuery] = useState('Arcane');
  const [isSearching, setIsSearching] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isPreWarming, setIsPreWarming] = useState(false);
  const [omdbInputKey, setOmdbInputKey] = useState(getOmdbApiKey());
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(getApiFallbackStats());
      setOmdbInputKey(getOmdbApiKey());
    }
  }, [isOpen]);

  const handleSaveOmdbKey = (e: React.FormEvent) => {
    e.preventDefault();
    setOmdbApiKey(omdbInputKey);
    setStats(getApiFallbackStats());
    onShowToast(omdbInputKey.trim() ? '🔑 OMDb API Key saved to LocalStorage!' : '🗑️ OMDb API Key removed');
    setShowKeyInput(false);
  };

  const handleTestCascade = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    setTestResult(null);

    try {
      // 1. Test TVmaze search (Secondary Tier)
      const tvmaze = await searchTvMazeShow(testQuery, 0);
      let episodesCount = 0;
      let sampleEp: any = null;

      if (tvmaze && tvmaze.id) {
        const eps = await fetchTvMazeEpisodes(testQuery, 0, tvmaze.id);
        episodesCount = eps.length;
        sampleEp = eps[0] || null;
      }

      // 2. Test OMDb search (Tertiary Tier)
      const omdb = await searchOmdbShow(testQuery);

      setTestResult({
        query: testQuery,
        tvmazeFound: !!tvmaze,
        tvmazeShow: tvmaze,
        omdbFound: !!omdb,
        omdbData: omdb,
        episodesCount,
        sampleEp,
        timestamp: new Date().toLocaleTimeString(),
      });

      setStats(getApiFallbackStats());
    } catch (err) {
      console.warn('Test search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePreWarmAll = async () => {
    setIsPreWarming(true);
    const toWarm = TMDB_ANIMATED_CATALOG.map((c) => ({ title: c.title, tmdbId: c.tmdbId || Number(c.id.replace(/\D/g, '')) }));
    const count = await preWarmCatalogCache(toWarm);
    setStats(getApiFallbackStats());
    setIsPreWarming(false);
    onShowToast(`⚡ Pre-warmed & cached ${count} animated shows in LocalStorage!`);
  };

  const handleClearCache = () => {
    clearApiFallbackCache();
    setStats(getApiFallbackStats());
    setTestResult(null);
    onShowToast('LocalStorage API cache cleared!');
  };

  if (!isOpen) return null;

  return (
    <div 
      id="dual-api-status-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-cartoon"
      onClick={onClose}
    >
      <div 
        id="dual-api-status-container"
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-[#07151e] border-[3px] border-black shadow-[8px_8px_0px_#000000] p-4 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with 3-Tier Status Pill */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black font-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000000]">
              <Layers className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">3-Tier Dual-API Fallback Engine</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#14b8a6] text-black text-[10px] font-black border border-black uppercase tracking-wider">
                  TMDB → TVmaze → OMDb → Local
                </span>
              </div>
              <p className="text-xs text-[#7dd3fc] font-bold">
                Zero hardcoded URLs • Native onError step-down • Automatic LocalStorage persistence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0d2836] hover:bg-[#f87171] text-white border-2 border-black shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Status Cards: TMDB, TVmaze, OMDb, Local Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: TMDB Primary */}
          <div className="p-3.5 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-[#00f2fe] uppercase tracking-wider">Tier 1: Primary</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-black" />
              </div>
              <h4 className="text-xs font-black text-white">TMDB Animation</h4>
              <div className="text-[10px] text-[#ccfbf1] font-bold space-y-0.5 pt-1">
                <div>• Relative: <code className="text-[#facc15]">/t/p/w780</code></div>
                <div>• Backdrops: <code className="text-[#facc15]">/original</code></div>
                <div>• Hits: <strong className="text-white">{stats.tmdbHits}</strong></div>
              </div>
            </div>
            <span className="text-[9px] text-[#7dd3fc] font-bold">Default Master Source</span>
          </div>

          {/* Card 2: TVmaze Fallback */}
          <div className="p-3.5 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-[#14b8a6] uppercase tracking-wider">Tier 2: TVmaze API</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-black" />
              </div>
              <h4 className="text-xs font-black text-white">TVmaze Open API</h4>
              <div className="text-[10px] text-[#ccfbf1] font-bold space-y-0.5 pt-1">
                <div>• Auth: <strong className="text-emerald-300">Free, No Key</strong></div>
                <div>• Search: <code className="text-[#facc15]">/search/shows</code></div>
                <div>• Hits: <strong className="text-white">{stats.tvmazeHits}</strong></div>
              </div>
            </div>
            <span className="text-[9px] text-[#7dd3fc] font-bold">Dynamic Step-Down</span>
          </div>

          {/* Card 3: OMDb Fallback */}
          <div className="p-3.5 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-[#facc15] uppercase tracking-wider">Tier 3: OMDb API</span>
                <span className={`w-2 h-2 rounded-full border border-black ${stats.omdbKeyConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <h4 className="text-xs font-black text-white">OMDb 1,000/day</h4>
              <div className="text-[10px] text-[#ccfbf1] font-bold space-y-0.5 pt-1">
                <div>• Key: <strong className={stats.omdbKeyConfigured ? 'text-emerald-300' : 'text-neutral-400'}>{stats.omdbKeyConfigured ? 'Configured' : 'Optional'}</strong></div>
                <div>• Budget: <span className="text-[#facc15]">{stats.omdbRequestsToday}/1,000</span></div>
                <div>• Hits: <strong className="text-white">{stats.omdbHits}</strong></div>
              </div>
            </div>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[9px] text-[#00f2fe] font-black hover:underline cursor-pointer text-left"
            >
              {showKeyInput ? 'Hide Key Config' : 'Configure OMDb Key →'}
            </button>
          </div>

          {/* Card 4: LocalStorage & Local Title Card */}
          <div className="p-3.5 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-[#38bdf8] uppercase tracking-wider">Tier 4: Local Card</span>
                <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
              </div>
              <h4 className="text-xs font-black text-white">0ms Speed & Card</h4>
              <div className="text-[10px] text-[#ccfbf1] font-bold space-y-0.5 pt-1">
                <div>• Cached Shows: <strong className="text-white">{stats.cachedShowCount}</strong></div>
                <div>• Episode Guides: <strong className="text-white">{stats.cachedEpisodeListCount}</strong></div>
                <div>• Cache Hits: <strong className="text-[#14b8a6]">{stats.cacheHits}</strong></div>
              </div>
            </div>
            <span className="text-[9px] text-[#7dd3fc] font-bold">Zero Broken Cards</span>
          </div>
        </div>

        {/* Optional OMDb API Key Configuration Form */}
        {showKeyInput && (
          <form onSubmit={handleSaveOmdbKey} className="p-3.5 rounded-2xl bg-[#0d2836] border-2 border-black space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#facc15]" />
                <span>OMDb API Key (Optional Tertiary Tier)</span>
              </label>
              <span className="text-[10px] text-[#7dd3fc] font-bold">1,000 free requests/day</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={omdbInputKey}
                onChange={(e) => setOmdbInputKey(e.target.value)}
                placeholder="Enter your OMDb API Key (e.g. 1a2b3c4d)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#07151e] border-2 border-black text-xs font-bold text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00f2fe]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#facc15] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-transform cursor-pointer"
              >
                Save Key
              </button>
            </div>
          </form>
        )}

        {/* Live Multi-Tier Fallback Tester */}
        <div className="p-4 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#00f2fe]" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Live Cascade Pipeline Tester
              </span>
            </div>
            <span className="text-[11px] text-[#7dd3fc] font-bold">
              Tests TVmaze (Free) & OMDb (Tertiary) simultaneously
            </span>
          </div>

          <form onSubmit={handleTestCascade} className="flex items-center gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. Arcane, Cyberpunk: Edgerunners, Attack on Titan, Gravity Falls..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#07151e] border-2 border-black text-xs font-bold text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00f2fe]"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-transform cursor-pointer flex items-center gap-1.5"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-black" />}
              <span>Test Cascade</span>
            </button>
          </form>

          {/* Tester Results Display */}
          {testResult && (
            <div className="p-3.5 rounded-xl bg-[#07151e] border-2 border-black space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* TVmaze Result */}
                <div className="p-2.5 rounded-xl bg-[#0d2836] border border-black space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#14b8a6] uppercase">TVmaze Result (Tier 2)</span>
                    <span className="text-[10px] text-white font-bold">{testResult.tvmazeFound ? '✓ Found' : '✗ None'}</span>
                  </div>
                  {testResult.tvmazeShow ? (
                    <div className="flex gap-2.5">
                      {testResult.tvmazeShow.image?.medium && (
                        <img 
                          src={testResult.tvmazeShow.image.original || testResult.tvmazeShow.image.medium} 
                          alt={testResult.tvmazeShow.name}
                          className="w-14 aspect-[2/3] object-cover rounded-lg border border-black shrink-0"
                        />
                      )}
                      <div className="text-[11px] min-w-0 space-y-0.5">
                        <div className="font-black text-white truncate">{testResult.tvmazeShow.name}</div>
                        <div className="text-[#7dd3fc]">Rating: ★ {testResult.tvmazeShow.rating?.average || '9.0'}</div>
                        <div className="text-[#ccfbf1] text-[10px]">Episodes: {testResult.episodesCount}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-neutral-400">No TVmaze artwork matched query.</div>
                  )}
                </div>

                {/* OMDb Result */}
                <div className="p-2.5 rounded-xl bg-[#0d2836] border border-black space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#facc15] uppercase">OMDb Result (Tier 3)</span>
                    <span className="text-[10px] text-white font-bold">{testResult.omdbFound ? '✓ Found' : (stats.omdbKeyConfigured ? '✗ None' : 'No Key')}</span>
                  </div>
                  {testResult.omdbData ? (
                    <div className="flex gap-2.5">
                      {testResult.omdbData.Poster && testResult.omdbData.Poster !== 'N/A' && (
                        <img 
                          src={testResult.omdbData.Poster} 
                          alt={testResult.omdbData.Title}
                          className="w-14 aspect-[2/3] object-cover rounded-lg border border-black shrink-0"
                        />
                      )}
                      <div className="text-[11px] min-w-0 space-y-0.5">
                        <div className="font-black text-white truncate">{testResult.omdbData.Title}</div>
                        <div className="text-[#7dd3fc]">Year: {testResult.omdbData.Year} • IMDb: {testResult.omdbData.imdbRating}</div>
                        <div className="text-[#ccfbf1] text-[10px] truncate">Genre: {testResult.omdbData.Genre}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-neutral-400">
                      {stats.omdbKeyConfigured ? 'No OMDb poster matched query.' : 'Configure OMDb Key above to query OMDb.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Cache Speed */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreWarmAll}
              disabled={isPreWarming}
              className="px-4 py-2.5 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] text-white hover:text-black text-xs font-black border-2 border-black shadow-[2.5px_2.5px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
            >
              {isPreWarming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />}
              <span>Pre-Warm & Cache All Catalog Shows</span>
            </button>

            <button
              onClick={handleClearCache}
              className="px-3.5 py-2.5 rounded-2xl bg-[#0d2836] hover:bg-[#f87171] text-[#f87171] hover:text-black text-xs font-black border-2 border-black shadow-[2.5px_2.5px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>

          <div className="text-[11px] text-[#7dd3fc] font-bold">
            ⚡ All resolved artwork saved in LocalStorage for 0ms refresh speed
          </div>
        </div>

        {/* Info Banner on OMDb & TVmaze fallback logic */}
        <div className="p-3.5 rounded-2xl bg-[#00f2fe]/10 border-2 border-[#00f2fe]/40 text-xs text-[#ccfbf1] font-bold space-y-1">
          <div className="flex items-center gap-1.5 text-white font-black">
            <CheckCircle2 className="w-4 h-4 text-[#00f2fe]" />
            <span>Budget Protection & Seamless Fallback:</span>
          </div>
          <p className="text-[11px] text-[#7dd3fc] leading-relaxed">
            TMDB relative paths load natively. If any image triggers an error or returns null, TVmaze immediately searches without an API key. If TVmaze fails, OMDb queries with strict 1,000/day LocalStorage caching. If all APIs fail, a styled local neon title card is rendered so no item is ever broken.
          </p>
        </div>

      </div>
    </div>
  );
};
