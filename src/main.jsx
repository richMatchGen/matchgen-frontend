import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from './themes/AppTheme';
import { BrowserRouter } from 'react-router-dom';

import { MaterialUIControllerProvider } from "./context";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MaterialUIControllerProvider>
      <AppTheme>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppTheme>
    </MaterialUIControllerProvider>
  </StrictMode>
);
