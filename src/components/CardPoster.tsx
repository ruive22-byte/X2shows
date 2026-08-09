import React, { useEffect, useState } from 'react';
import {
  resolvePoster,
  debugPosterResolution,
  MediaCatalogItem,
} from '../utils/posterResolver';

interface CardPosterProps {
  item: MediaCatalogItem;
  alt?: string;
  className?: string;
  fallbackPlaceholder?: React.ReactNode;
}

export const CardPoster: React.FC<CardPosterProps> = ({
  item,
  alt,
  className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
  fallbackPlaceholder,
}) => {
  const resolvedUrl = resolvePoster(item);

  const [imgSrc, setImgSrc] = useState<string | null>(resolvedUrl);
  const [hasFailed, setHasFailed] = useState<boolean>(!resolvedUrl);

  useEffect(() => {
    const url = resolvePoster(item);

    setImgSrc(url);
    setHasFailed(!url);

    debugPosterResolution(item, 'CardPoster useEffect');
  }, [item]);

  const handleImageError = () => {
    console.warn(
      `🖼️ [IMAGE LOAD FAIL] Direct HTTP failure for "${
        alt || item?.title || item?.name
      }" -> URL: ${imgSrc}`
    );

    debugPosterResolution(item, 'HTTP_LOAD_ERROR');

    setHasFailed(true);
  };

  if (hasFailed || !imgSrc) {
    return fallbackPlaceholder ? (
      <>{fallbackPlaceholder}</>
    ) : (
      <div className="w-full h-full bg-[#07151e] flex flex-col items-center justify-center p-2 text-center text-xs text-slate-400">
        <span>
          {alt || item?.title || item?.name || 'No Image'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || item?.title || item?.name || 'Poster'}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={handleImageError}
    />
  );
};
