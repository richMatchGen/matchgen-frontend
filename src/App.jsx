import { Routes, Route } from "react-router-dom";
import { Button, Container, Typography, AppBar, Toolbar, Box } from "@mui/material";
import Link from '@mui/material/Link';
import { Suspense, lazy } from "react";
import PrivateRoute from "./components/PrivateRoute";
import useAuth from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import { SkipToMainContent, AccessibilityToolbar } from "./components/EnhancedAccessibility";
import { ThemeProvider } from "@mui/material/styles";
import { RateLimitProvider } from "./context";
import { createMatchGenTheme } from "./themes/MatchGenTheme";

// Lazy load components for better performance
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import('./pages/Signup'));
const EnhancedSignup = lazy(() => import('./pages/EnhancedSignup'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EditClub = lazy(() => import('./pages/editclub'));
const CreateClub = lazy(() => import('./pages/createclub'));
const CreateMatch = lazy(() => import('./pages/creatematch'));
const CreatePlayer = lazy(() => import('./pages/createplayer'));
const LandingPage = lazy(() => import("./pages/landingpage"));
const Overview = lazy(() => import("./pages/profile"));
const Fixtures = lazy(() => import("./pages/fixtures"));
const Results = lazy(() => import("./pages/results"));
const ClubOverview = lazy(() => import("./pages/ClubOverview"));
const ChoosePackPage = lazy(() => import("./pages/ChoosePackage"));
const SocialMediaPostGenerator = lazy(() => import("./components/MatchdayPostGenerator"));
const TextElementManagement = lazy(() => import("./pages/TextElementManagement"));
const FixturesManagement = lazy(() => import("./pages/FixturesManagement"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const FeatureCatalog = lazy(() => import("./components/FeatureCatalog"));
const Settings = lazy(() => import("./pages/Settings"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Account = lazy(() => import("./pages/Account"));


function App() {
  const { auth, logout } = useAuth();
  const theme = createMatchGenTheme('light');

  return (
    <RateLimitProvider>
      <ThemeProvider theme={theme}>
        <SkipToMainContent />
        <AccessibilityToolbar />
        <Box id="main-content">

      {/* Optional: Add logout button for testing
      {auth.token && <button onClick={logout}>Logout</button>} */}

      <Suspense fallback={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box textAlign="center">
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              MatchGen
            </Typography>
            <LoadingSpinner 
              message="Loading application..." 
              variant="dots"
              size={60}
            />
          </Box>
        </Box>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/enhanced-signup" element={<EnhancedSignup />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/clubs/createclub" element={<PrivateRoute><CreateClub /></PrivateRoute>} />
          <Route path="/club" element={<PrivateRoute><ClubOverview /></PrivateRoute>} />
          
          <Route path="/fixture/creatematch" element={<PrivateRoute><CreateMatch /></PrivateRoute>} />
          <Route path="/squad/createplayer" element={<PrivateRoute><CreatePlayer /></PrivateRoute>} />
          
          <Route path="/edit-club/:clubId" element={<EditClub />} />
          <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
          <Route path="/fixtures" element={<PrivateRoute><Fixtures /></PrivateRoute>} />
          <Route path="/fixtures-management" element={<PrivateRoute><FixturesManagement /></PrivateRoute>} />

          <Route path="/profile" element={<Overview />} />

          {/* Social Media Post Generation */}
          <Route path="/gen/posts" element={<PrivateRoute><SocialMediaPostGenerator /></PrivateRoute>} />
          <Route path="/gen/posts/:fixtureId" element={<PrivateRoute><SocialMediaPostGenerator /></PrivateRoute>} />
          <Route path="/gen/posts/:fixtureId/:postType" element={<PrivateRoute><SocialMediaPostGenerator /></PrivateRoute>} />
          <Route path="/text-elements" element={<PrivateRoute><TextElementManagement /></PrivateRoute>} />
          <Route path="/team-management" element={<PrivateRoute><TeamManagement /></PrivateRoute>} />
          <Route path="/subscription" element={<PrivateRoute><SubscriptionManagement /></PrivateRoute>} />
          <Route path="/feature-catalog" element={<PrivateRoute><FeatureCatalog /></PrivateRoute>} />

          {/* Settings and Profile Routes */}
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/settings/account" element={<PrivateRoute><Account /></PrivateRoute>} />
          <Route path="/settings/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

          <Route path="/gen/templates" element={<PrivateRoute><ChoosePackPage/></PrivateRoute>} />
        </Routes>
      </Suspense>
      </Box>
    </ThemeProvider>
    </RateLimitProvider>
  );
}

export default App;