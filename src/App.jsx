import { Routes, Route } from "react-router-dom";
import { Button, Container, Typography, AppBar, Toolbar, Box } from "@mui/material";
import Link from '@mui/material/Link';
import { Suspense, lazy } from "react";
import PrivateRoute from "./components/PrivateRoute";
import useAuth from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import { SkipToMainContent, AccessibilityToolbar } from "./components/EnhancedAccessibility";
import { createEnhancedTheme } from "./themes/EnhancedTheme";
import { ThemeProvider } from "@mui/material/styles";
import { RateLimitProvider } from "./context";

// Lazy load components for better performance
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EditClub = lazy(() => import('./pages/editclub'));
const CreateClub = lazy(() => import('./pages/createclub'));
const CreateMatch = lazy(() => import('./pages/creatematch'));
const CreatePlayer = lazy(() => import('./pages/createplayer'));
const LandingPage = lazy(() => import("./pages/landingpage"));
const Overview = lazy(() => import("./pages/profile"));
const Fixtures = lazy(() => import("./pages/fixtures"));
const Results = lazy(() => import("./pages/results"));
const GenFixture = lazy(() => import("./pages/genFixture"));
const GenPlayer = lazy(() => import("./pages/genPlayer"));
const GenResult = lazy(() => import("./pages/genResult"));
const GenTeamLineup = lazy(() => import("./pages/genTeamLineup"));
const GenLiveScore = lazy(() => import("./pages/genLiveScore"));
const GenTemplates = lazy(() => import("./pages/genTemplates"));
const ChoosePackPage = lazy(() => import("./pages/ChoosePackage"));
const MatchdayPostPage = lazy(() => import("./pages/MatchdayPost"));
const ClubOverview = lazy(() => import("./pages/ClubOverview"));
const GenStartingXI = lazy(() => import("./pages/GenStartingXI"));
const GenUpcomingPost = lazy(() => import("./pages/GenUpcomingPost"));
const GenHalfTime = lazy(() => import("./pages/GenHalfTime"));
const GenFullTime = lazy(() => import("./pages/GenFullTime"));
const GenPosts = lazy(() => import("./pages/GenPosts"));

function App() {
  const { auth, logout } = useAuth();
  const theme = createEnhancedTheme('light');

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

          <Route path="/profile" element={<Overview />} />

          <Route path="/gen/teamlineup" element={<PrivateRoute><GenTeamLineup /></PrivateRoute>} />
          <Route path="/gen/livescore" element={<PrivateRoute><GenLiveScore /></PrivateRoute>} />
          <Route path="/gen/fixture" element={<PrivateRoute><MatchdayPostPage /></PrivateRoute>} />
          <Route path="/gen/result" element={<PrivateRoute><GenResult /></PrivateRoute>} />
          <Route path="/gen/player" element={<PrivateRoute><GenPlayer /></PrivateRoute>} />
          <Route path="/gen/startingxi" element={<PrivateRoute><GenStartingXI /></PrivateRoute>} />
          <Route path="/gen/upcoming" element={<PrivateRoute><GenUpcomingPost /></PrivateRoute>} />
          <Route path="/gen/halftime" element={<PrivateRoute><GenHalfTime /></PrivateRoute>} />
          <Route path="/gen/fulltime" element={<PrivateRoute><GenFullTime /></PrivateRoute>} />
          <Route path="/gen/posts" element={<PrivateRoute><GenPosts /></PrivateRoute>} />
          <Route path="/gen/posts/:matchId" element={<PrivateRoute><GenPosts /></PrivateRoute>} />
   
          <Route path="/gen/templates" element={<PrivateRoute><ChoosePackPage/></PrivateRoute>} />
          <Route path="/profile" element={<Overview />} />
        </Routes>
      </Suspense>
      </Box>
    </ThemeProvider>
    </RateLimitProvider>
  );
}

export default App;