import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import useAuth from "./hooks/useAuth"; // 👈

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
      </Routes>
    </>
  );
}

export default App;