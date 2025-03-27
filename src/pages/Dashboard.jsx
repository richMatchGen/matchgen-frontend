import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axios from "axios";

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

    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch user details
        const userRes = await axios.get("https://matchgen-backend-production.up.railway.app/api/users/me/", {
          headers,
        });
        setUser(userRes.data);

        // Fetch club details
        const clubRes = await axios.get("https://matchgen-backend-production.up.railway.app/api/users/club/", {
          headers,
        });
        setClub(clubRes.data);
      } catch (err) {
        console.error("Failed to load user or club data:", err);
        logout(); // optionally logout if invalid token
      }
    };

    fetchData();
  }, [navigate, logout]);

  if (!user || !club) {
    return <p>Loading your dashboard...</p>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard 👋</h1>

      <h2>User Info</h2>
      <p><strong>Email:</strong> {user.email}</p>
      {user.profile_picture && <img src={user.profile_picture} alt="Profile" width={100} />}

      <h2>Your Club</h2>
      <p><strong>Club Name:</strong> {club.name}</p>
      <p><strong>Sport:</strong> {club.sport}</p>
      {club.logo && <img src={club.logo} alt="Club Logo" width={100} />}

      <button onClick={() => navigate(`/edit-club/${club.id}`)}>Edit Club</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
