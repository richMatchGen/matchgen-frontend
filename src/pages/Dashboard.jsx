import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserAndClub = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Get current user
        const userRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/me/",
          { headers }
        );
        setUser(userRes.data);

        // Get user's club
        const clubRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/club/",
          { headers }
        );
        setClub(clubRes.data);
      } catch (err) {
        console.error("Failed to fetch user or club:", err);
        logout(); // optional: auto logout if error
      }
    };

    fetchUserAndClub();
  }, [navigate, logout]);

  if (!user || !club) return <p>Loading your dashboard...</p>;

  return (
    <div>
      <h1>Welcome to your Dashboard 👋</h1>

      <h2>User Info</h2>
      <p><strong>Email:</strong> {user.email}</p>
      {user.profile_picture && <img src={user.profile_picture} alt="Profile" width={100} />}

      <h2>Club Info</h2>
      <p><strong>Club Name:</strong> {club.name}</p>
      <p><strong>Sport:</strong> {club.sport}</p>
      {club.logo && <img src={club.logo} alt="Club Logo" width={100} />}

      <button onClick={() => navigate(`/edit-club/${club.id}`)}>Edit Club</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;