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
        borderRadius: 0, // Straight edges
        background: 'linear-gradient(135deg, #28443f 0%, #1a2f2a 100%) !important',
        color: '#ffffff !important',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15), 0px 2px 8px rgba(0, 0, 0, 0.1) !important',
        border: '1px solid rgba(255, 255, 255, 0.1) !important',
        '&:hover': {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2), 0px 4px 12px rgba(0, 0, 0, 0.15) !important',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease',
        },
        // Ensure all text inside cards is white
        '& .MuiTypography-root': {
          color: '#ffffff !important',
        },
        // Ensure secondary text has proper opacity
        '& .MuiTypography-body2, & .MuiTypography-caption': {
          color: 'rgba(255,255,255,0.8) !important',
        },
        // Ensure all icons inside cards are white
        '& .MuiSvgIcon-root': {
          color: '#ffffff !important',
        },
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 0,
        '&:last-child': { paddingBottom: 0 },
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
        padding: 0,
      },
    },
  },
};