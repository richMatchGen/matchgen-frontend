import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ Call hooks at the top level, not inside useEffect

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login"); // force redirect if not logged in
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to your Dashboard 👋</h1>
      <p>You are logged in!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
