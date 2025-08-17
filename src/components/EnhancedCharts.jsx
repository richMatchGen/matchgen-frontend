import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Refresh,
  Download,
  Fullscreen,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

// Animated progress bar
const progressAnimation = keyframes`
  0% { width: 0%; }
  100% { width: var(--progress-width); }
`;

const StyledProgressBar = styled(Box)(({ theme, value, color = 'primary' }) => ({
  width: '100%',
  height: '8px',
  backgroundColor: theme.palette.grey[200],
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${value}%`,
    backgroundColor: theme.palette[color].main,
    borderRadius: '4px',
    animation: `${progressAnimation} 1s ease-out`,
    '--progress-width': `${value}%`,
  },
}));

const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'primary',
  loading = false,
  trend,
  subtitle,
  actions,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return theme.palette.success.main;
      case 'negative': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive': return <TrendingUp fontSize="small" />;
      case 'negative': return <TrendingDown fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="30%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in={isVisible} timeout={500}>
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}05)`,
          border: `1px solid ${theme.palette[color].light}30`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette[color].main }}>
                {value}
              </Typography>
            </Box>
            {icon && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: `${theme.palette[color].main}20`,
                  color: theme.palette[color].main,
                }}
              >
                {icon}
              </Box>
            )}
          </Box>

          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle}
            </Typography>
          )}

          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={`${change > 0 ? '+' : ''}${change}%`}
                size="small"
                icon={getChangeIcon(changeType)}
                sx={{
                  backgroundColor: `${getChangeColor(changeType)}20`,
                  color: getChangeColor(changeType),
                  fontWeight: 600,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          )}

          {trend && (
            <StyledProgressBar value={trend} color={color} />
          )}

          {actions && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              {actions}
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

const ChartCard = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  onRefresh,
  onDownload,
  onFullscreen,
  height = 300,
  actions,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const defaultActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {onRefresh && (
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={onRefresh}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDownload && (
        <Tooltip title="Download">
          <IconButton size="small" onClick={onDownload}>
            <Download fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onFullscreen && (
        <Tooltip title="Fullscreen">
          <IconButton size="small" onClick={onFullscreen}>
            <Fullscreen fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={height - 80} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Chart
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          {onRefresh && (
            <IconButton onClick={onRefresh} sx={{ mt: 1 }}>
              <Refresh />
            </IconButton>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in={isVisible} timeout={500}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions || defaultActions}
          </Box>
          <Box sx={{ height, width: '100%' }}>
            {children}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

const MetricGrid = ({ metrics = [], columns = 4, loading = false }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 3,
        width: '100%',
      }}
    >
      {loading
        ? Array.from({ length: columns }).map((_, index) => (
            <StatCard key={index} loading={true} />
          ))
        : metrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
    </Box>
  );
};

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pagination = false,
  searchable = false,
  sortable = false,
  onRowClick,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = searchable
    ? data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const sortedData = sortable && sortConfig.key
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={40} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {searchable && (
          <Box sx={{ mb: 2 }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </Box>
        )}
        
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600,
                      cursor: sortable ? 'pointer' : 'default',
                    }}
                    onClick={() => sortable && handleSort(column.key)}
                  >
                    {column.label}
                    {sortable && sortConfig.key === column.key && (
                      <span style={{ marginLeft: '4px' }}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
};

export { StatCard, ChartCard, MetricGrid, DataTable };
export default StatCard;
