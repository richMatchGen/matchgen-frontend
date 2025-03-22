import { useEffect, useState } from "react";
import axios from "axios";

const useAuth = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    refresh: localStorage.getItem("refresh"),
  });

  // Refresh token every 4 minutes
  useEffect(() => {
    const refreshToken = async () => {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post(
            "https://matchgen-backend-production.up.railway.app/api/token/refresh/",
            { refresh }
          );
          localStorage.setItem("token", res.data.access);
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

  const login = ({ access, refresh }) => {
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    setAuth({ token: access, refresh });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    setAuth({ token: null, refresh: null });
    window.location.href = "/login";
  };

  return { auth, login, logout };
};

export default useAuth;
