import { createTheme } from '@mui/material/styles';

const MonochromeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',    // Pure black
      light: '#333333',   // Dark gray
      dark: '#000000',    // Pure black
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666',    // Medium gray
      light: '#999999',   // Light gray
      dark: '#333333',    // Dark gray
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff', // Pure white
      paper: '#ffffff',   // Pure white
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#666666', // Gray text
      disabled: '#999999', // Light gray for disabled
    },
    divider: '#e0e0e0',   // Light gray dividers
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e0e0e0',
      300: '#cccccc',
      400: '#999999',
      500: '#666666',
      600: '#333333',
      700: '#1a1a1a',
      800: '#0d0d0d',
      900: '#000000',
    },
    action: {
      hover: '#f5f5f5',   // Very light gray on hover
      selected: '#f0f0f0', // Light gray for selected
      disabled: '#cccccc', // Light gray for disabled
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#000000',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#000000',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#000000',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#666666',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#666666',
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners for modern look
  },
  components: {
    // Button styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          boxShadow: 'none',
          border: '1px solid transparent',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#f5f5f5',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          '&:disabled': {
            backgroundColor: '#cccccc',
            color: '#999999',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            borderColor: '#333333',
            backgroundColor: '#f5f5f5',
          },
        },
        text: {
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    
    // Card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          backgroundColor: '#ffffff',
        },
      },
    },
    
    // Paper styling
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    
    // AppBar styling for headers
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#000000',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    
    // Toolbar styling
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px !important',
          paddingLeft: '24px !important',
          paddingRight: '24px !important',
        },
      },
    },
    
    // Tab styling
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#666666',
          fontWeight: 500,
          textTransform: 'none',
          '&.Mui-selected': {
            color: '#000000',
            fontWeight: 600,
          },
          '&:hover': {
            color: '#000000',
            backgroundColor: '#f5f5f5',
          },
          '&.Mui-disabled': {
            color: '#cccccc',
            opacity: 0.6,
          },
        },
      },
    },
    
    // Chip styling
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          color: '#000000',
          border: '1px solid #e0e0e0',
        },
        colorWarning: {
          backgroundColor: '#f5f5f5',
          color: '#666666',
          border: '1px solid #cccccc',
        },
        outlined: {
          backgroundColor: 'transparent',
          border: '1px solid #e0e0e0',
          color: '#666666',
        },
      },
    },
    
    // Tooltip styling
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#000000',
          color: '#ffffff',
          fontSize: '0.875rem',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        arrow: {
          color: '#000000',
        },
      },
    },
    
    // Snackbar styling
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    
    // Alert styling
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '1px solid #e0e0e0',
        },
        standardWarning: {
          backgroundColor: '#fafafa',
          color: '#666666',
          border: '1px solid #cccccc',
        },
        standardError: {
          backgroundColor: '#fafafa',
          color: '#666666',
          border: '1px solid #cccccc',
        },
        standardSuccess: {
          backgroundColor: '#fafafa',
          color: '#000000',
          border: '1px solid #e0e0e0',
        },
      },
    },
    
    // Form control styling
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#000000',
            },
          },
        },
      },
    },
    
    // Input styling
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#cccccc',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
          },
        },
      },
    },
    
    // Select styling
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#cccccc',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
          },
        },
      },
    },
  },
});

export default MonochromeTheme;








