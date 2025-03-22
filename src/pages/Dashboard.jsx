import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const { logout } = useAuth();

    if (!token) {
      navigate("/login"); // force redirect if not logged in
    }
  }, []);

  return (
    <div>
      <h1>Welcome to your Dashboard 👋</h1>
      <p>You are logged in!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;