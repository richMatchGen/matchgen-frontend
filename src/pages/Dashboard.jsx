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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/me/",
          { headers }
        );
        setUser(res.data);
        return true;
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err.response?.status === 401) logout();
        else alert("Error loading user details.");
        return false;
      }
    };

    const fetchClub = async () => {
      try {
        const res = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/club/",
          { headers }
        );
        setClub(res.data);
      } catch (err) {
        console.warn("No club found or error fetching club:", err);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const userOk = await fetchUser();
      if (userOk) await fetchClub();
      else setLoading(false);
    };

    init();
  }, [navigate, logout]);

  if (loading) return <p>Loading your dashboard...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard 👋</h1>

      {user && (
        <>
          <h2>User Info</h2>
          <p><strong>Email:</strong> {user.email}</p>
          {user.profile_picture && (
            <img src={user.profile_picture} alt="Profile" width={100} />
          )}
        </>
      )}

      <h2>Club Info</h2>
      {club ? (
        <>
          <p><strong>Club Name:</strong> {club.name}</p>
          <p><strong>Sport:</strong> {club.sport}</p>
          {club.logo && <img src={club.logo} alt="Club Logo" width={100} />}
          <br />
          <button onClick={() => navigate(`/edit-club/${club.id}`)}>Edit Club</button>
        </>
      ) : (
        <p>No club found. <button onClick={() => navigate("/clubs/createclub")}>Create one</button></p>
      )}

      <br />
      <button onClick={logout} style={{ marginTop: "2rem" }}>Logout</button>
    </div>
  );
};

export default Dashboard;
