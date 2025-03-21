const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    return response.json();
}

export async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return response.json();
}