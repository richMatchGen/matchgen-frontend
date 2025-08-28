import { alpha } from '@mui/material/styles';
import { gray } from '../themePrimitives';

export const surfacesCustomizations = {
  MuiAccordion: {
    defaultProps: {
      elevation: 0,
      disableGutters: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        padding: 4,
        overflow: 'clip',
        backgroundColor: (theme.vars || theme).palette.background.default,
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
        ':before': {
          backgroundColor: 'transparent',
        },
        '&:not(:last-of-type)': {
          borderBottom: 'none',
        },
        '&:first-of-type': {
          borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
          borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
        },
        '&:last-of-type': {
          borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
          borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: 'none',
        borderRadius: 8,
        '&:hover': { backgroundColor: gray[50] },
        '&:focus-visible': { backgroundColor: 'transparent' },
        ...theme.applyStyles('dark', {
          '&:hover': { backgroundColor: gray[800] },
        }),
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Use MUI default card styling
        borderRadius: (theme.vars || theme).shape.borderRadius,
        boxShadow: (theme.vars || theme).shadows[1],
        '&:hover': {
          boxShadow: (theme.vars || theme).shadows[4],
          transition: 'all 0.3s ease',
        },
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        // Use MUI default card content styling
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        // Use MUI default card actions styling
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        '&.MuiButton-colorPrimary': {
          backgroundColor: '#000000 !important',
          color: '#ffffff !important',
          borderRadius: '0px !important',
        },
      },
    },
  },
};

