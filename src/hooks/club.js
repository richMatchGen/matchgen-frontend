import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/users/";

export async function getClub() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No authentication token found");
    return null;
  }
  try {
    const response = await axios.get(`${API_URL}club/details/`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Attach token in headers
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data || error.message);
    return null;
  }
}

export const createClub = async (token, clubData) => {
  try {
    const response = await axios.post(`${API_URL}club/`, clubData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || "Error creating club." };
  }
};

export const updateClub = async (token, clubData) => {
  try {
    const response = await axios.put(`${API_URL}club/update/`, clubData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || "Error updating club." };
  }
};

export const uploadClubLogo = async (token, file) => {
  const formData = new FormData();
  formData.append("logo", file);

  try {
    const response = await axios.put(`${API_URL}club/upload-logo/`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    return { success: true, message: response.data.message, logoUrl: response.data.logo_url };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || "Error uploading logo." };
  }
};

export const getSquad = async (token) => {
  return axios.get(`${API_URL}squad/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addPlayer = async (token, playerData) => {
  return axios.post(`${API_URL}squad/add/`, playerData, { headers: { Authorization: `Bearer ${token}` } });
};

export const createMatch = async (token, matchData) => {
  return axios.post(`${API_URL}match/`, matchData, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateMatchScore = async (token, matchId, score) => {
  return axios.put(`${API_URL}match/update-score/${matchId}/`, { score }, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateStartingXI = async (token, startingXI) => {
  return axios.put(
    "http://127.0.0.1:8000/api/users/squad/update-starting-xi/",
    { starting_xi: startingXI },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const generateStartingXIGraphic = async (token, players) => {
  return axios.post(
    "http://127.0.0.1:8000/api/users/generate-starting-xi/",
    { players },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};