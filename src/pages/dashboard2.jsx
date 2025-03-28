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
        const userRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/me/",
          { headers }
        );
        setUser(userRes.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        logout(); // Only logout if user fetch fails
      }
    };

    const fetchClub = async () => {
      try {
        const clubRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/club/",
          { headers }
        );
        setClub(clubRes.data);
      } catch (err) {
        console.warn("User might not have a club yet.");
        setClub(null); // Don't treat it as fatal
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchClub();
  }, [navigate, logout]);

  if (loading) return <p>Loading your dashboard...</p>;
  if (!user) return null; // user fetch failure already handled

  return (
    <div>
      <h1>Welcome to your Dashboard 👋</h1>

      <h2>User Info</h2>
      <p><strong>Email:</strong> {user.email}</p>
      {user.profile_picture && <img src={user.profile_picture} alt="Profile" width={100} />}

      <h2>Club Info</h2>
      {club ? (
        <>
          <p><strong>Club Name:</strong> {club.name}</p>
          <p><strong>Sport:</strong> {club.sport}</p>
          {club.logo && <img src={club.logo} alt="Club Logo" width={100} />}
          <button onClick={() => navigate(`/edit-club/${club.id}`)}>Edit Club</button>
        </>
      ) : (
        <p>No club found. <button onClick={() => navigate("/create-club")}>Create one</button></p>
      )}

      <br />
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
