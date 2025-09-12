import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MonochromeTheme from './themes/MonochromeTheme';
import { BrowserRouter } from 'react-router-dom';

import { MaterialUIControllerProvider } from "./context";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MaterialUIControllerProvider>
      <ThemeProvider theme={MonochromeTheme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </MaterialUIControllerProvider>
  </StrictMode>
);
