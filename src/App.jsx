import { Routes, Route } from "react-router-dom";
import { Button, Container, Typography, AppBar, Toolbar } from "@mui/material";
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


function App() {
  const { auth, logout } = useAuth(); // 👈

  return (
    <>

      {/* Optional: Add logout button for testing */}
      {auth.token && <button onClick={logout}>Logout</button>}

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
        <Route path="/edit-club/:clubId" element={<EditClub />} />
        <Route path="/fixture/creatematch" element={<PrivateRoute><CreateMatch /></PrivateRoute>} />
        <Route path="/squad/createplayer" element={<PrivateRoute><CreatePlayer /></PrivateRoute>} />
      </Routes>

    </>
  );
}

export default App;