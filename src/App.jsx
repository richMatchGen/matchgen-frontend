import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> {/* ✅ New route */}
      <Route path="/dashboard" element={<h1>Dashboard (Protected)</h1>} />

    </Routes>
  );
}

export default App;