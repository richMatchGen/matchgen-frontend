import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import env from "../config/environment";

const useAuth = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("accessToken"),
    refresh: localStorage.getItem("refreshToken"),
  });
  const [user, setUser] = useState(null);

  // Refresh token every 4 minutes
  useEffect(() => {
    const refreshToken = async () => {
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          const res = await axios.post(
            `${env.API_BASE_URL}/token/refresh/`,
            { refresh }
          );
          localStorage.setItem("accessToken", res.data.access);
          setAuth((prev) => ({ ...prev, token: res.data.access }));
        } catch (err) {
          console.error("Token refresh failed:", err);
          logout();
        }
      }
    };

    const interval = setInterval(refreshToken, 4 * 60 * 1000); // every 4 minutes
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(({ access, refresh, user: userData }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setAuth({ token: access, refresh });
    if (userData) {
      setUser(userData);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuth({ token: null, refresh: null });
    setUser(null);
    window.location.href = "/login";
  }, []);

  // Fetch user data when token is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.token && !user) {
        try {
          const response = await axios.get(
            `${env.API_BASE_URL}/users/me/`,
            { headers: { Authorization: `Bearer ${auth.token}` } }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUserData();
  }, [auth.token, user]);

  return { auth, user, login, logout };
};

export default useAuth;
