import axios from "axios";

const API_URL = "https://matchgen-backend-production.up.railway.app/api/users/";

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, {
      username,
      password,
    });

    if (response.data.access) {
      localStorage.setItem("token", response.data.access);  // ✅ Save Token
      return { success: true, token: response.data.access };
    }
  } catch (error) {
    return { success: false, error: error.response?.data };
  }
};


export const logout = () => {
  localStorage.removeItem("token"); // ✅ Remove Token on Logout
};

export const getToken = () => localStorage.getItem("accessToken");


export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      username,
      email,
      password,
    });

    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || "Signup failed." };
  }
};


export async function getProfile() {
  let token = localStorage.getItem("accessToken") || localStorage.getItem("access");

  if (!token) {
    console.error("No authentication token found - getProfile");
    return null;
  }

  try {
    const response = await axios.get(`${API_URL}me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data || error.message);
    return null;
  }
}


export function getUser() {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export const updateProfile = async (token, profileData) => {
  try {
    const response = await axios.put(`${API_URL}profile/update/`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || "Error updating profile." };
  }
};

export const changePassword = async (token, oldPassword, newPassword) => {
  try {
    const response = await axios.put(`${API_URL}change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || "Error changing password." };
  }
};