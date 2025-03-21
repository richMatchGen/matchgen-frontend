import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from './pages/Signup';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/dashboard" element={<h1>Dashboard (Protected)</h1>} />

    </Routes>
  );
}

export default App;