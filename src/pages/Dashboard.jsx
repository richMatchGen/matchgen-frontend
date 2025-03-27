import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [club, setClub] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user's club
    const fetchClub = async () => {
      try {
        const res = await axios.get("https://matchgen-backend-production.up.railway.app/api/users/club/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClub(res.data); // assume it returns one club
      } catch (err) {
        console.error("Failed to fetch club:", err);
      }
    };

    fetchClub();
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to your Dashboard 👋</h1>
      <p>You are logged in!</p>

      
        <button onClick={() => navigate(`/edit-club/${club.id}`)}>Edit Club</button>
      

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
