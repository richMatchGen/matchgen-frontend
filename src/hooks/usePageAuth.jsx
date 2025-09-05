import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import { apiClient, handleApiError } from "../api/config";

export const usePageAuth = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await apiClient.get("/users/me/");
        setUser(userRes.data);

        // Fetch club data (optional - user might not have a club)
        try {
          const clubRes = await apiClient.get("/users/my-club/");
          setClub(clubRes.data);
          // Store club ID in localStorage for feature gating
          if (clubRes.data && clubRes.data.id) {
            localStorage.setItem('selectedClubId', clubRes.data.id.toString());
          }
        } catch (clubError) {
          console.warn("User might not have a club yet:", clubError);
          setClub(null);
          localStorage.removeItem('selectedClubId');
        }
      } catch (error) {
        const errorMessage = handleApiError(error, "Failed to load user data");
        setError(errorMessage);
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return {
    user,
    club,
    loading,
    error,
    logout,
  };
};
