import React, { useRef, useState, useEffect } from 'react';
import { CategoryPill } from '../types';
import { CATEGORY_PILLS } from '../data/skeletonData';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Heart, 
  Compass, 
  Layers,
  Smile,
  Rocket
} from 'lucide-react';

interface CategoriesBarProps {
  selectedCategory: CategoryPill | 'All';
  onSelectCategory: (category: CategoryPill | 'All') => void;
  categoryCounts?: Record<string, number>;
  onShowToast: (msg: string) => void;
}

export const CategoriesBar: React.FC<CategoriesBarProps> = React.memo(({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onShowToast
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  // Check scroll position to display gradient fades & arrows
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  const getPillIcon = (cat: CategoryPill | 'All') => {
    switch (cat) {
      case 'For You':
        return <Sparkles className="w-4 h-4 text-[#38bdf8] animate-pulse" />;
      case 'Top 10':
        return <Flame className="w-4 h-4 text-[#14b8a6]" />;
      case 'Cause You Like':
        return <Heart className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8]/40" />;
      case 'Explore More':
        return <Rocket className="w-4 h-4 text-[#2dd4bf]" />;
      default:
        return <Layers className="w-4 h-4 text-[#7dd3fc]" />;
    }
  };

  return (
    <section className="categories-wrapper relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 select-none font-cartoon">
      <div className="relative flex items-center group">
        
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <div className="absolute left-0 z-20 h-full flex items-center pr-4 bg-gradient-to-r from-[#07151e] via-[#07151e]/95 to-transparent">
            <button
              onClick={() => handleScroll('left')}
              className="p-2.5 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] text-white border-2 border-black shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] transition-all cursor-pointer transform hover:scale-110 active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Categories Row */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="categories-scroll flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth w-full"
        >
          {/* "All" Pill with Dynamic Count */}
          <button
            onClick={() => {
              onSelectCategory('All');
              onShowToast('Showing all cartoon categories: For You, Top 10, Cause You Like & Explore More');
            }}
            className={`cat-pill shrink-0 ${
              selectedCategory === 'All' ? 'active' : ''
            }`}
          >
            <Smile className="w-4 h-4 text-[#38bdf8]" />
            <span>All Categories</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-black text-[#00f2fe] border border-black shadow-[1px_1px_0px_#000000] modern-cartoony-number">
              {categoryCounts?.['All'] ?? 28} TOONS
            </span>
          </button>

          {/* Strictly Requested Homepage Category Pills: For You, Top 10, Cause You Like, Explore More */}
          {CATEGORY_PILLS.map((category) => {
            const isSelected = selectedCategory === category;
            const fallbackCounts: Record<string, number> = {
              'For You': 6,
              'Top 10': 10,
              'Cause You Like': 6,
              'Explore More': 6
            };
            const count = categoryCounts?.[category] ?? fallbackCounts[category] ?? 6;

            return (
              <button
                key={category}
                onClick={() => {
                  onSelectCategory(category);
                  onShowToast(`Filtered category: ${category} (${count} toons)`);
                }}
                className={`cat-pill shrink-0 ${isSelected ? 'active' : ''}`}
                title={`Filter to ${category} (${count} toons)`}
              >
                {getPillIcon(category)}
                <span>{category}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] modern-cartoony-number ${
                  isSelected ? 'bg-black text-[#facc15]' : 'bg-black/60 text-[#7dd3fc]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <div className="absolute right-0 z-20 h-full flex items-center pl-4 bg-gradient-to-l from-[#07151e] via-[#07151e]/95 to-transparent">
            <button
              onClick={() => handleScroll('right')}
              className="p-2.5 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] text-white border-2 border-black shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] transition-all cursor-pointer transform hover:scale-110 active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
});

CategoriesBar.displayName = 'CategoriesBar';
