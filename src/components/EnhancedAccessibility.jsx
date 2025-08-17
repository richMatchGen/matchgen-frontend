import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  VolumeUp,
  VolumeOff,
  Accessibility,
  HighContrast,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Skip to main content link
const SkipToMainContent = ({ mainContentId = 'main-content' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        setIsVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClick = () => {
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={handleClick}
      sx={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 9999,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
    >
      Skip to main content
    </Button>
  );
};

// Enhanced focus indicator
const FocusIndicator = ({ children, color = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        '&:focus-within': {
          outline: `2px solid ${theme.palette[color].main}`,
          outlineOffset: '2px',
          borderRadius: '4px',
        },
      }}
    >
      {children}
    </Box>
  );
};

// Screen reader only text
const ScreenReaderOnly = ({ children }) => (
  <Typography
    component="span"
    sx={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </Typography>
);

// Enhanced keyboard navigation
const KeyboardNavigable = ({ children, onKeyDown, ...props }) => {
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (props.onClick) {
          props.onClick(event);
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (onKeyDown) {
          onKeyDown(event);
        }
        break;
      default:
        break;
    }
  };

  return (
    <Box
      {...props}
      tabIndex={0}
      role="button"
      onKeyDown={handleKeyDown}
      sx={{
        cursor: 'pointer',
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
};

// Accessibility toolbar
const AccessibilityToolbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
    document.documentElement.style.fontSize = `${fontSize + 2}px`;
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
    document.documentElement.style.fontSize = `${fontSize - 2}px`;
  };

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement audio muting logic
  };

  if (isMobile) {
    return (
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Tooltip title="Accessibility Options">
          <IconButton
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <Accessibility />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        zIndex: 1000,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px 0 0 8px',
        boxShadow: 2,
        p: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title="Increase font size" placement="left">
          <IconButton size="small" onClick={increaseFontSize}>
            <ZoomIn fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Decrease font size" placement="left">
          <IconButton size="small" onClick={decreaseFontSize}>
            <ZoomOut fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Toggle high contrast" placement="left">
          <IconButton 
            size="small" 
            onClick={toggleHighContrast}
            sx={{
              backgroundColor: isHighContrast ? 'primary.main' : 'transparent',
              color: isHighContrast ? 'primary.contrastText' : 'inherit',
            }}
          >
            <HighContrast fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Toggle sound" placement="left">
          <IconButton size="small" onClick={toggleMute}>
            {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Enhanced form field with better accessibility
const AccessibleFormField = ({
  label,
  error,
  helperText,
  required = false,
  children,
  id,
  ...props
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        component="label"
        htmlFor={fieldId}
        variant="body2"
        sx={{ fontWeight: 500, mb: 1, display: 'block' }}
      >
        {label}
        {required && (
          <Typography
            component="span"
            sx={{ color: 'error.main', ml: 0.5 }}
            aria-label="required"
          >
            *
          </Typography>
        )}
      </Typography>
      
      <Box
        id={fieldId}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      >
        {children}
      </Box>
      
      {error && (
        <Typography
          id={errorId}
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: 'block' }}
          role="alert"
        >
          {error}
        </Typography>
      )}
      
      {helperText && !error && (
        <Typography
          id={helperId}
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

// Enhanced table with better accessibility
const AccessibleTable = ({ data, columns, caption, ...props }) => {
  return (
    <Box
      component="table"
      role="table"
      aria-label={caption}
      sx={{
        width: '100%',
        borderCollapse: 'collapse',
        '& th, & td': {
          padding: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          textAlign: 'left',
        },
        '& th': {
          fontWeight: 600,
          backgroundColor: 'action.hover',
        },
        '& tr:hover': {
          backgroundColor: 'action.hover',
        },
        '& tr:focus-within': {
          outline: '2px solid',
          outlineColor: 'primary.main',
        },
      }}
      {...props}
    >
      {caption && (
        <Typography component="caption" sx={{ display: 'table-caption', mb: 1 }}>
          {caption}
        </Typography>
      )}
      
      <Box component="thead">
        <Box component="tr">
          {columns.map((column, index) => (
            <Box
              key={column.key}
              component="th"
              scope="col"
              role="columnheader"
              aria-sort="none"
            >
              {column.label}
            </Box>
          ))}
        </Box>
      </Box>
      
      <Box component="tbody">
        {data.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            component="tr"
            role="row"
            tabIndex={0}
            sx={{ cursor: 'pointer' }}
          >
            {columns.map((column, colIndex) => (
              <Box
                key={column.key}
                component="td"
                role="cell"
                data-label={column.label}
              >
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Live region for announcements
const LiveRegion = ({ children, role = 'status', ariaLive = 'polite' }) => (
  <Box
    role={role}
    aria-live={ariaLive}
    aria-atomic="true"
    sx={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </Box>
);

export {
  SkipToMainContent,
  FocusIndicator,
  ScreenReaderOnly,
  KeyboardNavigable,
  AccessibilityToolbar,
  AccessibleFormField,
  AccessibleTable,
  LiveRegion,
};
