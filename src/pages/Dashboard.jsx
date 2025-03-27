import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const userRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/me/",
          { headers }
        );
        setUser(userRes.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err.response?.status === 401) logout();
        else alert("Something went wrong loading user info.");
        setLoading(false);
        return;
      }

      try {
        const clubRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/club/",
          { headers }
        );
        setClub(clubRes.data);
      } catch (err) {
        console.warn("No club found or error fetching club:", err);
        setClub(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate, logout]);

  if (loading) return <p>Loading your dashboard...</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Welcome to your Dashboard 👋</h1>

      {user && (
        <>
          <h2>User Info</h2>
          <p><strong>Email:</strong> {user.email}</p>
          {user.profile_picture && (
            <img
              src={user.profile_picture}
              alt="Profile"
              width={100}
              style={{ borderRadius: "50%", marginTop: "1rem" }}
            />
          )}
        </>
      )}

      <h2 style={{ marginTop: "2rem" }}>Club Info</h2>
      {club ? (
        <>
          <p><strong>Club Name:</strong> {club.name}</p>
          <p><strong>Sport:</strong> {club.sport}</p>
          {club.logo && <img src={club.logo} alt="Club Logo" width={100} />}
          <br />
          <button onClick={() => navigate(`/edit-club/${club.id}`)} style={{ marginTop: "1rem" }}>
            Edit Club
          </button>
        </>
      ) : (
        <p>
          No club found.{" "}
          <button onClick={() => navigate("/clubs/createclub")}>Create one</button>
        </p>
      )}

      <button onClick={logout} style={{ marginTop: "2rem" }}>Logout</button>
    </div>
  );
};

export default Dashboard;
