import { Routes, Route } from "react-router-dom";
import { Button, Container, Typography, AppBar, Toolbar } from "@mui/material";
import Link from '@mui/material/Link';
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import useAuth from "./hooks/useAuth"; // 👈
import EditClub from './pages/editclub';
import CreateClub from './pages/createclub';
import CreateMatch from './pages/creatematch';
import CreatePlayer from './pages/createplayer';
import LandingPage from "./pages/landingpage";
import Overview from "./pages/profile";

import Fixtures from "./pages/fixtures";
import Results from "./pages/results";

import GenFixture from "./pages/genFixture";
import GenPlayer from "./pages/genPlayer";
import GenResult from "./pages/genResult";
import GenTeamLineup from "./pages/genTeamLineup";
import GenLiveScore from "./pages/genLiveScore";
import GenTemplates from "./pages/genTemplates";




function App() {
  const { auth, logout } = useAuth(); // 👈

  return (
    <>

      {/* Optional: Add logout button for testing
      {auth.token && <button onClick={logout}>Logout</button>} */}

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
        
        <Route path="/fixture/creatematch" element={<PrivateRoute><CreateMatch /></PrivateRoute>} />
        <Route path="/squad/createplayer" element={<PrivateRoute><CreatePlayer /></PrivateRoute>} />
        
        <Route path="/edit-club/:clubId" element={<EditClub />} />
        <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
        <Route path="/fixtures" element={<PrivateRoute><Fixtures /></PrivateRoute>} />

        <Route path="/profile" element={<Overview />} />

        <Route path="/gen/teamlineup" element={<PrivateRoute><GenTeamLineup /></PrivateRoute>} />
        <Route path="/gen/livescore" element={<PrivateRoute><GenLiveScore /></PrivateRoute>} />
        <Route path="/gen/fixture" element={<PrivateRoute><GenFixture /></PrivateRoute>} />
        <Route path="/gen/result" element={<PrivateRoute><GenResult /></PrivateRoute>} />
        <Route path="/gen/player" element={<PrivateRoute><GenPlayer /></PrivateRoute>} />

        <Route path="/gen/templates" element={<PrivateRoute><GenTemplates/></PrivateRoute>} />

      </Routes>

    </>
  );
}

export default App;