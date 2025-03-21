import { useEffect, useState } from "react";
import { fetchMatches } from "./api";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<h1>Dashboard (Protected)</h1>} />
      </Routes>
    </Router>
  );
}

export default App;