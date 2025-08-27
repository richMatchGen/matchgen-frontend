import { createTheme, alpha } from '@mui/material/styles';

// MatchGen Brand Colors
const matchgenPrimary = '#28443f';
const matchgenSecondary = '#4a7c59';
const matchgenAccent = '#8bc34a';

// Generate color palette from primary
const generateColorPalette = (baseColor) => {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgb = hexToRgb(baseColor);
  if (!rgb) return {};

  const lighten = (amount) => {
    const factor = 1 + amount;
    return rgbToHex(
      Math.min(255, Math.round(rgb.r * factor)),
      Math.min(255, Math.round(rgb.g * factor)),
      Math.min(255, Math.round(rgb.b * factor))
    );
  };

  const darken = (amount) => {
    const factor = 1 - amount;
    return rgbToHex(
      Math.max(0, Math.round(rgb.r * factor)),
      Math.max(0, Math.round(rgb.g * factor)),
      Math.max(0, Math.round(rgb.b * factor))
    );
  };

  return {
    50: lighten(0.8),
    100: lighten(0.6),
    200: lighten(0.4),
    300: lighten(0.2),
    400: lighten(0.1),
    500: baseColor,
    600: darken(0.1),
    700: darken(0.2),
    800: darken(0.3),
    900: darken(0.4),
  };
};

const primaryPalette = generateColorPalette(matchgenPrimary);
const secondaryPalette = generateColorPalette(matchgenSecondary);

// Modern Gray Scale
const gray = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

// Success Colors
const success = {
  50: '#e8f5e8',
  100: '#c8e6c9',
  200: '#a5d6a7',
  300: '#81c784',
  400: '#66bb6a',
  500: '#4caf50',
  600: '#43a047',
  700: '#388e3c',
  800: '#2e7d32',
  900: '#1b5e20',
};

// Warning Colors
const warning = {
  50: '#fff8e1',
  100: '#ffecb3',
  200: '#ffe082',
  300: '#ffd54f',
  400: '#ffca28',
  500: '#ffc107',
  600: '#ffb300',
  700: '#ffa000',
  800: '#ff8f00',
  900: '#ff6f00',
};

// Error Colors
const error = {
  50: '#ffebee',
  100: '#ffcdd2',
  200: '#ef9a9a',
  300: '#e57373',
  400: '#ef5350',
  500: '#f44336',
  600: '#e53935',
  700: '#d32f2f',
  800: '#c62828',
  900: '#b71c1c',
};

// Info Colors
const info = {
  50: '#e3f2fd',
  100: '#bbdefb',
  200: '#90caf9',
  300: '#64b5f6',
  400: '#42a5f5',
  500: '#2196f3',
  600: '#1e88e5',
  700: '#1976d2',
  800: '#1565c0',
  900: '#0d47a1',
};

export const createMatchGenTheme = (mode = 'light') => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: matchgenPrimary,
        light: primaryPalette[300],
        dark: primaryPalette[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: matchgenSecondary,
        light: secondaryPalette[300],
        dark: secondaryPalette[700],
        contrastText: '#ffffff',
      },
      success: {
        main: success[500],
        light: success[300],
        dark: success[700],
        contrastText: '#ffffff',
      },
      warning: {
        main: warning[500],
        light: warning[300],
        dark: warning[700],
        contrastText: '#000000',
      },
      error: {
        main: error[500],
        light: error[300],
        dark: error[700],
        contrastText: '#ffffff',
      },
      info: {
        main: info[500],
        light: info[300],
        dark: info[700],
        contrastText: '#ffffff',
      },
      text: {
        primary: isLight ? gray[900] : gray[50],
        secondary: isLight ? gray[600] : gray[400],
        disabled: isLight ? gray[400] : gray[600],
      },
      background: {
        default: isLight ? '#fafafa' : '#121212',
        paper: isLight ? '#ffffff' : '#1e1e1e',
        subtle: isLight ? '#f5f5f5' : '#2a2a2a',
      },
      divider: isLight ? alpha(gray[500], 0.12) : alpha(gray[500], 0.12),
      action: {
        active: isLight ? alpha(gray[900], 0.54) : alpha(gray[100], 0.54),
        hover: isLight ? alpha(gray[900], 0.04) : alpha(gray[100], 0.08),
        selected: isLight ? alpha(gray[900], 0.08) : alpha(gray[100], 0.16),
        disabled: isLight ? alpha(gray[900], 0.26) : alpha(gray[100], 0.3),
        disabledBackground: isLight ? alpha(gray[900], 0.12) : alpha(gray[100], 0.12),
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontSize: '3.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: isLight ? gray[900] : gray[50],
      },
      h2: {
        fontSize: '2.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: isLight ? gray[900] : gray[50],
      },
      h3: {
        fontSize: '2.25rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: isLight ? gray[900] : gray[50],
      },
      h4: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: isLight ? gray[900] : gray[50],
      },
      h5: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: isLight ? gray[900] : gray[50],
      },
      h6: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: isLight ? gray[900] : gray[50],
      },
      subtitle1: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.5,
        color: isLight ? gray[700] : gray[300],
      },
      subtitle2: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
        color: isLight ? gray[700] : gray[300],
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        color: isLight ? gray[800] : gray[200],
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.6,
        color: isLight ? gray[700] : gray[300],
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: 1.5,
        textTransform: 'none',
        letterSpacing: '0.025em',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: isLight ? gray[600] : gray[400],
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.5,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: isLight ? gray[600] : gray[400],
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      isLight 
        ? '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)'
        : '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.4)',
      isLight
        ? '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)'
        : '0px 3px 6px rgba(0, 0, 0, 0.4), 0px 3px 6px rgba(0, 0, 0, 0.5)',
      isLight
        ? '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)'
        : '0px 10px 20px rgba(0, 0, 0, 0.5), 0px 6px 6px rgba(0, 0, 0, 0.6)',
      isLight
        ? '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)'
        : '0px 14px 28px rgba(0, 0, 0, 0.6), 0px 10px 10px rgba(0, 0, 0, 0.7)',
      isLight
        ? '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)'
        : '0px 19px 38px rgba(0, 0, 0, 0.7), 0px 15px 12px rgba(0, 0, 0, 0.8)',
      ...Array(19).fill('none'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            height: '100%',
            width: '100%',
          },
          body: {
            height: '100%',
            width: '100%',
            margin: 0,
            padding: 0,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            backgroundColor: isLight ? '#fafafa' : '#121212',
            color: isLight ? gray[900] : gray[50],
          },
          '#root': {
            height: '100%',
            width: '100%',
          },
          'input:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${isLight ? '#ffffff' : '#1e1e1e'} inset`,
            WebkitTextFillColor: isLight ? gray[900] : gray[50],
          },
          'input:-webkit-autofill:focus': {
            WebkitBoxShadow: `0 0 0 100px ${isLight ? '#ffffff' : '#1e1e1e'} inset`,
            WebkitTextFillColor: isLight ? gray[900] : gray[50],
          },
          '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: isLight ? gray[100] : gray[800],
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb': {
            background: isLight ? gray[400] : gray[600],
            borderRadius: '4px',
            '&:hover': {
              background: isLight ? gray[500] : gray[500],
            },
          },
        },
      },
                   MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Straight edges
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '12px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            },
          },
          contained: {
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1a1a1a',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            },
          },
          outlined: {
            borderWidth: '2px',
            borderColor: '#000000',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#000000',
              color: '#ffffff',
              borderWidth: '2px',
            },
          },
          // Ensure buttons inside cards maintain styling
          '&.MuiButton-contained': {
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1a1a1a',
            },
          },
        },
      },
                   MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Straight edges
            background: 'linear-gradient(135deg, #28443f 0%, #1a2f2a 100%)',
            color: '#ffffff',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15), 0px 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2), 0px 4px 12px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
            // Ensure all text inside cards is white
            '& .MuiTypography-root': {
              color: '#ffffff',
            },
            // Ensure secondary text has proper opacity
            '& .MuiTypography-body2, & .MuiTypography-caption': {
              color: 'rgba(255,255,255,0.8)',
            },
            // Ensure all icons inside cards are white
            '& .MuiSvgIcon-root': {
              color: '#ffffff',
            },
          },
        },
      },
             MuiPaper: {
         styleOverrides: {
           root: {
             borderRadius: 0, // Straight edges
             backgroundImage: 'none',
           },
         },
       },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isLight ? gray[400] : gray[600],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: matchgenPrimary,
                borderWidth: '2px',
              },
            },
          },
        },
      },
             MuiChip: {
         styleOverrides: {
           root: {
             borderRadius: 0, // Straight edges
             fontWeight: 500,
             fontSize: '0.75rem',
           },
         },
       },
             MuiDialog: {
         styleOverrides: {
           paper: {
             borderRadius: 0, // Straight edges
             background: 'linear-gradient(135deg, #28443f 0%, #1a2f2a 100%)',
             color: '#ffffff',
             boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3), 0px 4px 16px rgba(0, 0, 0, 0.2)',
           },
         },
       },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isLight 
              ? '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)'
              : '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            boxShadow: isLight 
              ? '2px 0px 8px rgba(0, 0, 0, 0.12)'
              : '2px 0px 8px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Straight edges
            marginBottom: 4,
            '&:hover': {
              backgroundColor: isLight 
                ? alpha(gray[900], 0.04)
                : alpha(gray[100], 0.08),
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Straight edges
            '&:hover': {
              backgroundColor: isLight 
                ? alpha(gray[900], 0.04)
                : alpha(gray[100], 0.08),
            },
            '&.Mui-selected': {
              backgroundColor: isLight 
                ? alpha(matchgenPrimary, 0.08)
                : alpha(matchgenPrimary, 0.16),
              '&:hover': {
                backgroundColor: isLight 
                  ? alpha(matchgenPrimary, 0.12)
                  : alpha(matchgenPrimary, 0.24),
              },
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase': {
              '&.Mui-checked': {
                color: matchgenPrimary,
                '& + .MuiSwitch-track': {
                  backgroundColor: matchgenPrimary,
                },
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: isLight ? gray[200] : gray[700],
          },
          bar: {
            borderRadius: 4,
          },
        },
      },
             MuiCircularProgress: {
         styleOverrides: {
           root: {
             color: matchgenPrimary,
           },
         },
       },
       MuiSvgIcon: {
         styleOverrides: {
           root: {
             color: '#ffffff', // White icons
           },
         },
       },
    },
  });
};

export default createMatchGenTheme;
