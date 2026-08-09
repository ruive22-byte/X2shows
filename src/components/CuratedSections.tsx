import React from 'react';
import { 
  Flame, Sparkles, Zap, Shield, Wand2, Film, 
  ChevronRight, Trophy, Heart, Compass
} from 'lucide-react';
import { Show } from '../types';
import { ShowCard } from './ShowCard';

interface CuratedSectionsProps {
  shows: Show[];
  onPlayShow: (show: Show) => void;
  onOpenDetails: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: (showId: string) => boolean;
  onStartWatchParty: (show: Show) => void;
}

export const CuratedSections: React.FC<CuratedSectionsProps> = ({
  shows,
  onPlayShow,
  onOpenDetails,
  onToggleWatchlist,
  isInWatchlist,
  onStartWatchParty,
}) => {
  // Category splits
  const trendingShows = [...shows].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
  const originals = shows.filter(s => s.isOriginal);
  const cyberpunkSciFi = shows.filter(s => 
    s.genres?.includes('Cyberpunk') || 
    s.genres?.includes('Sci-Fi') || 
    s.genres?.includes('Cyber-Victorian') ||
    s.genres?.includes('Surreal Sci-Fi')
  );
  const darkFantasy = shows.filter(s => 
    s.genres?.includes('Dark Fantasy') || 
    s.genres?.includes('Dark Gothic Baroque') || 
    s.genres?.includes('Supernatural') ||
    s.genres?.includes('Dark Urban Fantasy')
  );
  const highSakuga = shows.filter(s => 
    s.animationStyle.includes('Sakuga') || 
    s.animationStyle.includes('Hyper-Kinetic') ||
    s.genres?.includes('High Sakuga')
  );
  const whimsicalFantasy = shows.filter(s =>
    s.genres?.includes('Fantasy') ||
    s.genres?.includes('Watercolor Fantasy') ||
    s.animationStyle.includes('Watercolor')
  );

  const sections = [
    {
      id: 'sec-trending',
      title: 'Trending Global Sakuga & Blockbusters',
      subtitle: 'The most watched, visually groundbreaking animated spectacles right now.',
      icon: Flame,
      iconColor: 'text-rose-500',
      badge: 'TOP 10',
      shows: trendingShows,
    },
    {
      id: 'sec-originals',
      title: 'XTwo Originals & Exclusive Masters',
      subtitle: 'Curated 4K HDR masterworks produced with premier international animation studios.',
      icon: Trophy,
      iconColor: 'text-amber-400',
      badge: 'EXCLUSIVE',
      shows: originals.length > 0 ? originals : shows.slice(0, 4),
    },
    {
      id: 'sec-cyberpunk',
      title: 'Cyberpunk, Neon Noir & High-Octane Action',
      subtitle: 'Chrome-drenched cityscapes, kinetic laser chases, and visceral smear frames.',
      icon: Zap,
      iconColor: 'text-blue-400',
      badge: 'HIGH OCTANE',
      shows: cyberpunkSciFi,
    },
    {
      id: 'sec-dark-fantasy',
      title: 'Dark Fantasy & Supernatural Thrillers',
      subtitle: 'Dimensional castles, blood moon revolutions, and terrifying cursed energy.',
      icon: Shield,
      iconColor: 'text-rose-400',
      badge: '18+ RATED',
      shows: darkFantasy,
    },
    {
      id: 'sec-whimsical',
      title: 'Whimsical Journeys & Atmospheric Masterpieces',
      subtitle: 'Gentle watercolor landscapes, alien ecosystems, and philosophical reflections.',
      icon: Wand2,
      iconColor: 'text-purple-400',
      badge: 'AWARD WINNING',
      shows: whimsicalFantasy.length > 0 ? whimsicalFantasy : shows.slice(2, 6),
    },
  ];

  return (
    <div id="curated-sections-container" className="space-y-12 sm:space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {sections.map((section) => {
        const Icon = section.icon;
        if (section.shows.length === 0) return null;

        return (
          <section key={section.id} id={section.id} className="space-y-4">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                    <Icon className={`w-4 h-4 ${section.iconColor}`} />
                  </div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                    {section.title}
                  </h2>
                  <span className="text-[10px] font-mono-code font-extrabold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/40">
                    {section.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  {section.subtitle}
                </p>
              </div>

              {/* View All count */}
              <div className="text-xs font-mono-code text-blue-400 font-semibold flex items-center gap-1">
                <span>{section.shows.length} Masterpieces</span>
              </div>
            </div>

            {/* Horizontal Show Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {section.shows.map((show) => (
                <ShowCard
                  key={`${section.id}-${show.id}`}
                  show={show}
                  onPlay={onPlayShow}
                  onOpenDetails={onOpenDetails}
                  onToggleWatchlist={onToggleWatchlist}
                  isInWatchlist={isInWatchlist(show.id)}
                  onStartWatchParty={onStartWatchParty}
                />
              ))}
            </div>

          </section>
        );
      })}
    </div>
  );
};
