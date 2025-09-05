import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useAuth = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("accessToken"),
    refresh: localStorage.getItem("refreshToken"),
  });

  // Refresh token every 4 minutes
  useEffect(() => {
    const refreshToken = async () => {
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          const res = await axios.post(
            "https://matchgen-backend-production.up.railway.app/api/token/refresh/",
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

  const login = useCallback(({ access, refresh }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setAuth({ token: access, refresh });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuth({ token: null, refresh: null });
    window.location.href = "/login";
  }, []);

  return { auth, login, logout };
};

export default useAuth;
