import React from 'react';
import { SlidersHorizontal, Sparkles, Filter, X, ArrowUpDown } from 'lucide-react';

interface ExploreFilterBarProps {
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedStudio: string;
  setSelectedStudio: (studio: string) => void;
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onReset: () => void;
}

export const ExploreFilterBar: React.FC<ExploreFilterBarProps> = ({
  selectedGenre,
  setSelectedGenre,
  selectedStudio,
  setSelectedStudio,
  selectedFormat,
  setSelectedFormat,
  sortBy,
  setSortBy,
  onReset,
}) => {
  const genres = [
    'All Genres',
    'Cyber-Victorian',
    'Cyberpunk',
    'Dark Fantasy',
    'Supernatural',
    'Surreal Sci-Fi',
    'Watercolor Fantasy',
    'Sci-Fi',
    'Action',
  ];

  const studios = [
    'All Studios',
    'Fortiche Production',
    'Studio Trigger',
    'Ufotable',
    'Sony Pictures Animation',
    'Madhouse',
    'Titmouse',
  ];

  const formats = [
    'All Formats',
    'Series',
    'Movie',
  ];

  const isFiltered = selectedGenre !== 'All Genres' || selectedStudio !== 'All Studios' || selectedFormat !== 'All Formats' || sortBy !== 'score';

  return (
    <div id="explore-filter-bar" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3 font-cartoon animate-category-fade">
      
      {/* Top Filter Controls: Genre chips + Studio & Sort dropdowns */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Genre Pill Horizontal List */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 no-scrollbar">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000000] ${
                selectedGenre === g
                  ? 'bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white shadow-[3px_3px_0px_#000000]'
                  : 'bg-[#0d2836] text-[#7dd3fc] hover:text-white hover:bg-[#14536e]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Dropdown Selectors: Studio, Format, Sort with Modern Black Outlines */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
          
          {/* Studio Filter */}
          <select
            value={selectedStudio}
            onChange={(e) => setSelectedStudio(e.target.value)}
            className="bg-[#0d2836] text-[#ccfbf1] border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black focus:outline-none focus:border-[#00f2fe] shadow-[2px_2px_0px_#000000]"
          >
            {studios.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="bg-[#0d2836] text-[#ccfbf1] border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black focus:outline-none focus:border-[#00f2fe] shadow-[2px_2px_0px_#000000]"
          >
            {formats.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0d2836] text-[#facc15] border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black focus:outline-none focus:border-[#facc15] shadow-[2px_2px_0px_#000000] modern-cartoony-number"
          >
            <option value="score">★ Highest Rated (Score)</option>
            <option value="trending">🔥 Trending Rank</option>
            <option value="year">📅 Release Year (Newest)</option>
            <option value="title">🔤 Title (A - Z)</option>
          </select>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black text-xs font-black flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_#000000] transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              title="Reset Filters"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
