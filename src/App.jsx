import { Routes, Route } from "react-router-dom";
import { Button, Container, Typography, AppBar, Toolbar, Box } from "@mui/material";
import Link from '@mui/material/Link';
import { Suspense, lazy } from "react";
import PrivateRoute from "./components/PrivateRoute";
import useAuth from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import { AccessibilityToolbar } from "./components/EnhancedAccessibility";
import { ThemeProvider } from "@mui/material/styles";
import { RateLimitProvider } from "./context";
import { createMatchGenTheme } from "./themes/MatchGenTheme";
import Sitemark from './components/Sitemarkicon';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import('./pages/Signup'));
const EnhancedSignup = lazy(() => import('./pages/EnhancedSignup'));
const EnhancedSignup2 = lazy(() => import('./pages/EnhancedSignup2'));
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
const EnhancedTemplateSelection = lazy(() => import("./pages/EnhancedTemplateSelection"));
const TemplateDetails = lazy(() => import("./pages/TemplateDetails"));
const SocialMediaPostGenerator = lazy(() => import("./components/MatchdayPostGenerator"));
const TextElementManagement = lazy(() => import("./pages/TextElementManagement"));
const FixturesManagement = lazy(() => import("./pages/FixturesManagement"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const FeatureCatalog = lazy(() => import("./components/FeatureCatalog"));
const Settings = lazy(() => import("./pages/Settings"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Account = lazy(() => import("./pages/Account"));
const PSDProcessor = lazy(() => import("./pages/PSDProcessor"));
const UploadGraphicPack = lazy(() => import("./pages/UploadGraphicPack"));
const MediaManager = lazy(() => import("./pages/MediaManager"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPlayerManagement = lazy(() => import("./pages/AdminPlayerManagement"));
const About = lazy(() => import("./pages/About"));
const Feedback = lazy(() => import("./pages/Feedback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Error400 = lazy(() => import("./pages/Error400"));
const Error404 = lazy(() => import("./pages/Error404"));
const Error500 = lazy(() => import("./pages/Error500"));


function App() {
  const { auth, logout } = useAuth();
  const theme = createMatchGenTheme('light');

  return (
    <ErrorBoundary>
      <RateLimitProvider>
        <ThemeProvider theme={theme}>
          <AccessibilityToolbar />
          <ScrollToTop />
          <Box id="main-content">

      {/* Logout button moved to side menu */}

      <Suspense fallback={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          sx={{
            background: "#f2fd7d",
            color: "#333",
          }}
        >
          <Box textAlign="center" sx={{ maxWidth: 400, mx: 'auto', px: 3 }}>
            <Sitemark />
            <Typography variant="h4" sx={{ mt: 2, mb: 3, fontWeight: 700, color: '#333' }}>
              MatchGen
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#666', opacity: 0.8 }}>
              Creating your football club's digital presence...
            </Typography>
            <LoadingSpinner 
              message="Loading application..." 
              variant="dots"
              size={60}
            />
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#333', borderRadius: '50%', opacity: 0.6 }} />
              <Box sx={{ width: 8, height: 8, bgcolor: '#333', borderRadius: '50%', opacity: 0.4 }} />
              <Box sx={{ width: 8, height: 8, bgcolor: '#333', borderRadius: '50%', opacity: 0.2 }} />
            </Box>
          </Box>
        </Box>
      }>
        <Routes>
          <Route path="/" element={
            auth.token ? (
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            ) : <Login />
          } />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<EnhancedSignup2 />} />
          <Route path="/enhanced-signup" element={<EnhancedSignup />} />
          <Route path="/enhanced-signup2" element={<register />} />
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

          <Route path="/gen/templates" element={<PrivateRoute><EnhancedTemplateSelection/></PrivateRoute>} />
          <Route path="/gen/templates/:packId" element={<PrivateRoute><TemplateDetails/></PrivateRoute>} />
          
          {/* PSD Processor Routes */}
          <Route path="/psd-processor" element={<PrivateRoute><PSDProcessor /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/players" element={<PrivateRoute><AdminPlayerManagement /></PrivateRoute>} />
          <Route path="/upload-graphic-pack" element={<PrivateRoute><UploadGraphicPack /></PrivateRoute>} />
          
          {/* Media Management */}
          <Route path="/media-manager" element={<PrivateRoute><MediaManager /></PrivateRoute>} />
          
          {/* Error Pages */}
          <Route path="/error/400" element={<Error400 />} />
          <Route path="/error/404" element={<Error404 />} />
          <Route path="/error/500" element={<Error500 />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Suspense>
      </Box>
    </ThemeProvider>
    </RateLimitProvider>
    </ErrorBoundary>
  );
}

export default App;