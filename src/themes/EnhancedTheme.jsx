import { createTheme, alpha } from '@mui/material/styles';

// Enhanced color palette with better contrast ratios
export const enhancedColors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Enhanced shadows with better depth perception
export const enhancedShadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.05)',
  '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
  '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
  '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
  '0px 25px 50px rgba(0, 0, 0, 0.15)',
  '0px 35px 60px rgba(0, 0, 0, 0.2)',
  '0px 50px 80px rgba(0, 0, 0, 0.25)',
  '0px 70px 100px rgba(0, 0, 0, 0.3)',
];

// Enhanced typography with better readability
export const enhancedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3.5rem',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.75rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  subtitle2: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
};

// Enhanced spacing system
export const enhancedSpacing = (factor) => `${8 * factor}px`;

// Enhanced border radius system
export const enhancedBorderRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  round: '50%',
};

// Enhanced transitions
export const enhancedTransitions = {
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
};

export const createEnhancedTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: enhancedColors.primary[600],
        light: enhancedColors.primary[400],
        dark: enhancedColors.primary[800],
        contrastText: '#ffffff',
      },
      secondary: {
        main: enhancedColors.secondary[600],
        light: enhancedColors.secondary[400],
        dark: enhancedColors.secondary[800],
        contrastText: '#ffffff',
      },
      success: {
        main: enhancedColors.success[600],
        light: enhancedColors.success[400],
        dark: enhancedColors.success[800],
        contrastText: '#ffffff',
      },
      warning: {
        main: enhancedColors.warning[600],
        light: enhancedColors.warning[400],
        dark: enhancedColors.warning[800],
        contrastText: '#ffffff',
      },
      error: {
        main: enhancedColors.error[600],
        light: enhancedColors.error[400],
        dark: enhancedColors.error[800],
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? enhancedColors.neutral[900] : enhancedColors.neutral[50],
        paper: isDark ? enhancedColors.neutral[800] : '#ffffff',
        subtle: isDark ? alpha(enhancedColors.neutral[700], 0.5) : alpha(enhancedColors.neutral[100], 0.5),
      },
      text: {
        primary: isDark ? enhancedColors.neutral[50] : enhancedColors.neutral[900],
        secondary: isDark ? enhancedColors.neutral[400] : enhancedColors.neutral[600],
        disabled: isDark ? enhancedColors.neutral[600] : enhancedColors.neutral[400],
      },
      divider: isDark ? alpha(enhancedColors.neutral[700], 0.5) : alpha(enhancedColors.neutral[200], 0.5),
      action: {
        active: isDark ? enhancedColors.neutral[400] : enhancedColors.neutral[600],
        hover: isDark ? alpha(enhancedColors.neutral[700], 0.08) : alpha(enhancedColors.neutral[900], 0.04),
        selected: isDark ? alpha(enhancedColors.neutral[700], 0.16) : alpha(enhancedColors.neutral[900], 0.08),
        disabled: isDark ? alpha(enhancedColors.neutral[600], 0.38) : alpha(enhancedColors.neutral[400], 0.38),
        disabledBackground: isDark ? alpha(enhancedColors.neutral[700], 0.12) : alpha(enhancedColors.neutral[400], 0.12),
      },
    },
    typography: enhancedTypography,
    shadows: enhancedShadows,
    shape: {
      borderRadius: parseInt(enhancedBorderRadius.md),
    },
    spacing: enhancedSpacing,
    transitions: enhancedTransitions,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: enhancedBorderRadius.md,
            textTransform: 'none',
            fontWeight: 600,
            transition: `all ${enhancedTransitions.duration.standard}ms ${enhancedTransitions.easing.easeInOut}`,
          },
          contained: {
            boxShadow: enhancedShadows[2],
            '&:hover': {
              boxShadow: enhancedShadows[4],
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: enhancedBorderRadius.lg,
            boxShadow: enhancedShadows[2],
            transition: `all ${enhancedTransitions.duration.standard}ms ${enhancedTransitions.easing.easeInOut}`,
            '&:hover': {
              boxShadow: enhancedShadows[4],
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: enhancedBorderRadius.md,
              transition: `all ${enhancedTransitions.duration.standard}ms ${enhancedTransitions.easing.easeInOut}`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: enhancedBorderRadius.xl,
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: enhancedBorderRadius.md,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            backgroundColor: isDark 
              ? alpha(enhancedColors.neutral[900], 0.8) 
              : alpha('#ffffff', 0.8),
          },
        },
      },
    },
  });
};

export default createEnhancedTheme;
