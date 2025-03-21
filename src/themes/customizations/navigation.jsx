import { alpha } from '@mui/material/styles';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { dividerClasses } from '@mui/material/Divider';
import { menuItemClasses } from '@mui/material/MenuItem';
import { selectClasses } from '@mui/material/Select';
import { tabClasses } from '@mui/material/Tab';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import { gray, brand } from '../themePrimitives';

export const navigationCustomizations = {
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: (theme.vars || theme).shape.borderRadius,
        padding: '6px 8px',
        [`&.${menuItemClasses.focusVisible}`]: {
          backgroundColor: 'transparent',
        },
        [`&.${menuItemClasses.selected}`]: {
          [`&.${menuItemClasses.focusVisible}`]: {
            backgroundColor: alpha(theme.palette.action.selected, 0.3),
          },
        },
      }),
    },
  },
  MuiSelect: {
    defaultProps: {
      IconComponent: UnfoldMoreRoundedIcon,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: (theme.vars || theme).shape.borderRadius,
        border: '1px solid',
        borderColor: gray[200],
        backgroundColor: (theme.vars || theme).palette.background.paper,
        '&:hover': {
          borderColor: gray[300],
        },
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.background.default,
      }),
    },
  },
  MuiPaginationItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-selected': {
          color: 'white',
          backgroundColor: (theme.vars || theme).palette.grey[900],
        },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 'fit-content' },
      indicator: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.grey[800],
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '6px 8px',
        textTransform: 'none',
        color: (theme.vars || theme).palette.text.secondary,
        borderRadius: (theme.vars || theme).shape.borderRadius,
        '&:hover': {
          color: (theme.vars || theme).palette.text.primary,
        },
        [`&.${tabClasses.selected}`]: {
          color: gray[900],
        },
      }),
    },
  },
};
