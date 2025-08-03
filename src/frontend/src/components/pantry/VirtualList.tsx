/**
 * The Pantry Design System - Virtual List Component
 * High-performance virtual scrolling for large datasets
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useThrottledWindowSize } from '../../hooks/usePerformance';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  overscan?: number;
  onScroll?: (scrollTop: number, scrollDirection: 'up' | 'down') => void;
  className?: string;
  itemClassName?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

interface ItemPosition {
  index: number;
  top: number;
  height: number;
}

function calculateItemPositions<T>(
  items: T[],
  itemHeight: number | ((index: number, item: T) => number)
): ItemPosition[] {
  const positions: ItemPosition[] = [];
  let currentTop = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const height = typeof itemHeight === 'function' ? itemHeight(i, item) : itemHeight;
    
    positions.push({
      index: i,
      top: currentTop,
      height,
    });
    
    currentTop += height;
  }

  return positions;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  onScroll,
  className = '',
  itemClassName = '',
  loadingComponent,
  emptyComponent,
  header,
  footer,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate item positions
  const itemPositions = useMemo(() => 
    calculateItemPositions(items, itemHeight), 
    [items, itemHeight]
  );

  const lastPosition = itemPositions[itemPositions.length - 1];
  const totalHeight = itemPositions.length > 0 && lastPosition
    ? lastPosition.top + lastPosition.height 
    : 0;

  // Find visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    if (itemPositions.length === 0) {
      return { startIndex: 0, endIndex: 0, visibleItems: [] };
    }

    // Find first visible item
    let start = 0;
    let end = itemPositions.length - 1;
    
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const position = itemPositions[mid];
      
      if (position && position.top <= scrollTop && position.top + position.height > scrollTop) {
        start = mid;
        break;
      } else if (position && position.top > scrollTop) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }

    // Find last visible item
    const visibleEnd = scrollTop + containerHeight;
    let endIdx = start;
    
    while (endIdx < itemPositions.length - 1) {
      const position = itemPositions[endIdx + 1];
      if (position && position.top >= visibleEnd) break;
      endIdx++;
    }

    // Apply overscan
    const startWithOverscan = Math.max(0, start - overscan);
    const endWithOverscan = Math.min(itemPositions.length - 1, endIdx + overscan);

    const visible = [];
    for (let i = startWithOverscan; i <= endWithOverscan; i++) {
      const item = items[i];
      const position = itemPositions[i];
      if (item && position) {
        visible.push({
          item,
          index: i,
          position,
        });
      }
    }

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      visibleItems: visible,
    };
  }, [scrollTop, containerHeight, itemPositions, overscan, items]);

  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    const direction = newScrollTop > lastScrollTop.current ? 'down' : 'up';
    
    setScrollTop(newScrollTop);
    setScrollDirection(direction);
    setIsScrolling(true);
    
    lastScrollTop.current = newScrollTop;
    onScroll?.(newScrollTop, direction);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout to detect scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (loadingComponent && items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {loadingComponent}
      </div>
    );
  }

  // Empty state
  if (emptyComponent && items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {header}
      
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Virtual container with total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Rendered items */}
          {visibleItems.map(({ item, index, position }) => (
            <div
              key={keyExtractor(item, index)}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: position.top,
                left: 0,
                right: 0,
                height: position.height,
              }}
            >
              {renderItem(item, index, {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: position.height,
              })}
            </div>
          ))}
        </div>
      </div>
      
      {footer}
    </div>
  );
}

// Virtual Grid Component
export interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  gap?: number;
  overscan?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  keyExtractor,
  gap = 0,
  overscan = 5,
  className = '',
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;
  const totalHeight = totalRows * rowHeight;

  // Calculate visible range
  const { startRow, endRow, visibleItems } = useMemo(() => {
    const firstVisibleRow = Math.floor(scrollTop / rowHeight);
    const lastVisibleRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight)
    );

    // Apply overscan
    const startWithOverscan = Math.max(0, firstVisibleRow - overscan);
    const endWithOverscan = Math.min(totalRows - 1, lastVisibleRow + overscan);

    const visible = [];
    for (let row = startWithOverscan; row <= endWithOverscan; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        const item = items[index];
        if (index < items.length && item) {
          visible.push({
            item,
            index,
            row,
            col,
            x: col * (itemWidth + gap),
            y: row * rowHeight,
          });
        }
      }
    }

    return {
      startRow: startWithOverscan,
      endRow: endWithOverscan,
      visibleItems: visible,
    };
  }, [scrollTop, containerHeight, rowHeight, totalRows, columnsPerRow, itemWidth, itemHeight, gap, overscan, items]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, x, y }) => (
          <div
            key={keyExtractor(item, index)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index, {
              width: itemWidth,
              height: itemHeight,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;