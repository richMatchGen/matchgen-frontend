import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import useAuth from "./hooks/useAuth"; // 👈
import EditClub from './pages/editclub';
import CreateClub from './pages/createclub';
import CreateMatch from './pages/creatematch';

function App() {
  const { auth, logout } = useAuth(); // 👈

  return (
    <>
      {/* Optional: Add logout button for testing */}
      {auth.token && <button onClick={logout}>Logout</button>}

      <Routes>
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
      </Routes>
    </>
  );
}

export default App;