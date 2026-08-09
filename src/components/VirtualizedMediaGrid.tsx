import React, { useState, useEffect, useRef, useMemo } from 'react';

interface MediaItem {
  id: string | number;
  title: string;
  posterPath?: string;
  category?: string;
  [key: string]: any;
}

interface VirtualizedMediaGridProps<T extends MediaItem> {
  items: T[];
  itemHeight?: number;
  gap?: number;
  renderItem: (item: T) => React.ReactNode;
}

export function VirtualizedMediaGrid<T extends MediaItem>({
  items,
  itemHeight = 280,
  gap = 16,
  renderItem,
}: VirtualizedMediaGridProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(800);
  const [columns, setColumns] = useState(5);

  // 1. Device-aware responsive column detection (Phones -> Tablets -> TVs)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const width = el.clientWidth;
      setContainerHeight(el.clientHeight);

      if (width < 640) setColumns(2);        // Mobile Phones
      else if (width < 1024) setColumns(3);   // Tablets / Small Screens
      else if (width < 1536) setColumns(5);   // Laptops / Standard TVs
      else setColumns(6);                     // 4K Smart TVs & Ultrawide Monitors
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. High-performance scroll tracking targeting 120Hz display refresh cycles
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  };

  // 3. Mathematical Windowing Engine
  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const totalRows = Math.ceil(items.length / columns);
    const calculatedTotalHeight = totalRows * itemHeight + Math.max(0, totalRows - 1) * gap;

    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - 1);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + 1
    );

    const startIndex = startRow * columns;
    const endIndex = Math.min(items.length, (endRow + 1) * columns);

    const slicedItems = items.slice(startIndex, endIndex);
    const topOffset = startRow * (itemHeight + gap);

    return {
      visibleItems: slicedItems,
      totalHeight: calculatedTotalHeight,
      offsetY: topOffset,
    };
  }, [items, columns, itemHeight, gap, scrollTop, containerHeight]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative w-full h-full overflow-y-auto custom-scrollbar touch-pan-y"
      style={{
        contain: 'strict',
        WebkitOverflowScrolling: 'touch', // Smooth iOS momentum scrolling
      }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
        <div
          style={{
            // GPU-accelerated 3D transform forces layer onto GPU for 120 FPS rendering
            transform: `translate3d(0, ${offsetY}px, 0)`,
            willChange: 'transform',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: `${gap}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item) => (
            <div key={item.id} style={{ height: `${itemHeight}px` }}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
