import React, { useState, useEffect, useRef } from 'react';
import { Film, Tv, Sparkles } from 'lucide-react';
import { getNextFallbackArtwork } from '../services/apiFallbackService';
import { resolvePoster, resolveBackdrop, getPosterFallbackChain, getBackdropFallbackChain } from '../utils/posterResolver';

interface TmdbImageProps {
  showId?: string | number;
  id?: string | number;
  tmdbId?: string | number;
  imdbId?: string;
  posterPath?: string | null;
  posterUrl?: string | null;
  backdropPath?: string | null;
  type?: 'poster' | 'backdrop';
  title?: string;
  name?: string;
  mediaType?: string;
  genres?: string[];
  qualityBadge?: string;
  className?: string;
  alt?: string;
  showProviderBadge?: boolean;
  item?: any;
}

export const TmdbImage: React.FC<TmdbImageProps> = React.memo(({
  item,
  showId,
  id,
  tmdbId,
  imdbId,
  posterPath,
  posterUrl,
  backdropPath,
  type = 'poster',
  title = '',
  name = '',
  mediaType,
  genres = [],
  qualityBadge = '4K UHD',
  className = '',
  alt = '',
  showProviderBadge = false,
}) => {
  const displayTitle = title || name || 'Animated Show';
  
  const getFallbackChain = (): string[] => {
    const itemToResolve = item || {
      posterPath,
      posterUrl,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      backdropUrl: backdropPath,
      tmdbId,
      imdbId,
      title: displayTitle,
      mediaType
    };
    
    if (type === 'backdrop') {
      return getBackdropFallbackChain(itemToResolve as any);
    }
    return getPosterFallbackChain(itemToResolve as any);
  };

  const chain = getFallbackChain();
  const [chainIndex, setChainIndex] = useState<number>(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(chain[0] || null);
  const [hasError, setHasError] = useState<boolean>(!chain[0]);
  const [currentSource, setCurrentSource] = useState<string>(chain[0] ? 'primary' : 'placeholder');

  useEffect(() => {
    const newChain = getFallbackChain();
    setChainIndex(0);
    setCurrentUrl(newChain[0] || null);
    setHasError(!newChain[0]);
    setCurrentSource(newChain[0] ? 'primary' : 'placeholder');
  }, [posterPath, posterUrl, backdropPath, type, displayTitle, tmdbId, imdbId]);

  // Image HTTP Error Fallback with Multi-CDN Chain
  const handleImageError = async () => {
    // Check if next CDN URL in fallback chain is available
    const newChain = getFallbackChain();
    if (chainIndex + 1 < newChain.length) {
      const nextIndex = chainIndex + 1;
      setChainIndex(nextIndex);
      setCurrentUrl(newChain[nextIndex]);
      setCurrentSource(`mirror-${nextIndex}`);
      setHasError(false);
      return;
    }

    // Try secondary API lookup
    try {
      const nextArtwork = await getNextFallbackArtwork(
        displayTitle,
        currentSource,
        currentUrl,
        tmdbId ? Number(tmdbId) : null,
        imdbId
      );
      
      if (nextArtwork && nextArtwork.url) {
        const resolvedFallback = resolvePoster({ posterUrl: nextArtwork.url } as any);
        if (resolvedFallback) {
          setCurrentUrl(resolvedFallback);
          setCurrentSource(nextArtwork.source);
          setHasError(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback resolution failed', e);
    }
    
    setHasError(true);
    setCurrentSource('placeholder');
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#07151e] ${className}`}>
      {currentUrl && !hasError ? (
        <>
          <img
            src={currentUrl}
            alt={alt || displayTitle}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => { 
               e.currentTarget.style.display = "none";
               handleImageError();
            }}
            className="w-full h-full object-cover object-center transition-transform duration-300 transform-gpu"
            style={{ imageRendering: 'auto' }}
          />
          {showProviderBadge && currentSource && currentSource !== 'placeholder' && currentSource !== 'primary' && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_#000000] ${
                currentSource === 'tvmaze' 
                  ? 'bg-[#14b8a6] text-black' 
                  : currentSource === 'omdb'
                  ? 'bg-[#facc15] text-black'
                  : 'bg-[#00f2fe] text-black'
              }`}>
                {currentSource === 'tvmaze' ? 'TVmaze' : currentSource === 'omdb' ? 'OMDb' : 'TMDB'}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col justify-between p-3.5 sm:p-4 bg-gradient-to-br from-[#082230] via-[#07151e] to-[#040a0f] border-2 border-[#14b8a6]/40 text-[#f0fdfa] select-none">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-[#14b8a6] text-black font-black text-[9px] uppercase tracking-wider border border-black shadow-[1px_1px_0px_#000000]">
              {qualityBadge || '4K TOON'}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
              <Film className="w-3.5 h-3.5 text-[#00f2fe]" />
            </div>
          </div>
          <div className="space-y-1.5 my-auto text-center py-2">
            <div className="w-9 h-9 rounded-2xl bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/50 flex items-center justify-center mx-auto mb-1.5 shadow-[2px_2px_0px_#000000]">
              <Tv className="w-4 h-4" />
            </div>
            <h4 className="font-black text-xs sm:text-sm text-white line-clamp-2 leading-tight px-1">
              {displayTitle}
            </h4>
            <p className="text-[10px] text-[#7dd3fc] font-bold truncate">
              {genres && genres.length > 0 ? genres.slice(0, 2).join(' • ') : 'Animation'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[9px] text-[#99f6e4] pt-1.5 border-t border-black/40">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#facc15]" />
              <span>Native Card</span>
            </span>
            <span className="text-[#00f2fe] font-black tracking-wider">SAKUGA 4K</span>
          </div>
        </div>
      )}
    </div>
  );
});
TmdbImage.displayName = 'TmdbImage';
