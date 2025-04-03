import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';
import linearGradient from "../assets/theme/functions/linearGradient";
import pxToRem from "../assets/theme/functions/pxToRem"; // Include others if needed
import borders from '../assets/theme/base/borders';
import boxShadows from "../assets/theme/base/boxShadows";

export default function AppTheme({ children, disableCustomTheme, themeComponents }) {
  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          cssVariables: {
            colorSchemeSelector: 'data-mui-color-scheme',
            cssVarPrefix: 'template',
          },
          colorSchemes,
          typography,
          shadows,
          shape,
          boxShadows,
          borders,
          functions: {
            linearGradient,
            pxToRem,
          },
          components: {
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <>{children}</>;
  }

  return <ThemeProvider theme={theme} disableTransitionOnChange>{children}</ThemeProvider>;
}
