import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Virtualized list component for large datasets
const VirtualizedList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  loading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event) => {
    const { scrollTop: newScrollTop } = event.target;
    setScrollTop(newScrollTop);

    // Load more items when near the bottom
    if (hasMore && !isLoadingMore && onLoadMore) {
      const scrollPercentage = (newScrollTop + containerHeight) / totalHeight;
      if (scrollPercentage > 0.8) {
        setIsLoadingMore(true);
        onLoadMore().finally(() => setIsLoadingMore(false));
      }
    }
  }, [hasMore, isLoadingMore, onLoadMore, containerHeight, totalHeight]);

  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        position: 'relative',
      }}
    >
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <Box
              key={startIndex + index}
              sx={{
                height: itemHeight,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              {renderItem(item, startIndex + index)}
            </Box>
          ))}
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {isLoadingMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
          }}
        >
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
};

// Lazy loaded image component
const LazyImage = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+',
  width = '100%',
  height = 'auto',
  sx = {},
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(img);
    return () => observer.unobserve(img);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <img
        ref={imgRef}
        src={placeholder}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0.3,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      {!isLoaded && !hasError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

// Debounced search input
const DebouncedSearch = ({
  onSearch,
  placeholder = 'Search...',
  delay = 300,
  minLength = 2,
  sx = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef(null);

  const handleSearch = useCallback(
    (term) => {
      if (term.length >= minLength) {
        setIsSearching(true);
        onSearch(term).finally(() => setIsSearching(false));
      }
    },
    [onSearch, minLength]
  );

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length >= minLength) {
      timeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, delay);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
      />
      {isSearching && (
        <Box
          sx={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <CircularProgress size={16} />
        </Box>
      )}
    </Box>
  );
};

// Optimized infinite scroll
const InfiniteScroll = ({
  children,
  onLoadMore,
  hasMore = false,
  loading = false,
  threshold = 0.8,
  sx = {},
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback(
    (event) => {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (hasMore && !loading && !isLoading && scrollPercentage > threshold) {
        setIsLoading(true);
        onLoadMore()
          .then(() => {
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    },
    [hasMore, loading, isLoading, onLoadMore, threshold]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        ...sx,
      }}
    >
      {children}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 3,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

// Memoized component wrapper
const MemoizedComponent = React.memo(({ children, ...props }) => {
  return <Box {...props}>{children}</Box>;
});

// Performance monitoring hook
const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    console.log(`${componentName} rendered ${renderCount.current} times in ${timeSinceLastRender.toFixed(2)}ms`);
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => {
      renderCount.current = 0;
    },
  };
};

// Optimized grid with virtualization
const VirtualizedGrid = ({
  items = [],
  columns = 3,
  itemHeight = 200,
  containerHeight = 600,
  renderItem,
  loading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const actualColumns = isMobile ? 1 : columns;

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += actualColumns) {
      result.push(items.slice(i, i + actualColumns));
    }
    return result;
  }, [items, actualColumns]);

  const rowHeight = itemHeight;
  const visibleRowCount = Math.ceil(containerHeight / rowHeight);
  const [scrollTop, setScrollTop] = useState(0);

  const startRow = Math.floor(scrollTop / rowHeight);
  const endRow = Math.min(startRow + visibleRowCount + 1, rows.length);

  const visibleRows = rows.slice(startRow, endRow);
  const totalHeight = rows.length * rowHeight;
  const offsetY = startRow * rowHeight;

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return (
    <Box
      sx={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
      onScroll={handleScroll}
    >
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleRows.map((row, rowIndex) => (
            <Box
              key={startRow + rowIndex}
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${actualColumns}, 1fr)`,
                gap: 2,
                height: rowHeight,
                padding: 1,
              }}
            >
              {row.map((item, colIndex) => (
                <Box key={colIndex}>
                  {renderItem(item, startRow * actualColumns + colIndex)}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 3,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export {
  VirtualizedList,
  LazyImage,
  DebouncedSearch,
  InfiniteScroll,
  MemoizedComponent,
  usePerformanceMonitor,
  VirtualizedGrid,
};
