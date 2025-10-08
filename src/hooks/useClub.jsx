import { useState, useEffect } from "react";
import axios from "axios";
 
import env from '../config/environment';
const useClub = (clubId) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${env.API_BASE_URL}/users/club/${clubId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClub(res.data);
      } catch (err) {
        console.error("Error fetching club:", err);
        setError("Could not load club details.");
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  return { club, loading, error };
};

export default useClub;
