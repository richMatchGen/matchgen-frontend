const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchMatches() {
    const response = await fetch(`${API_BASE_URL}/api/matches/`);
    return response.json();
}

export async function fetchTeams() {
    const response = await fetch(`${API_BASE_URL}/api/teams/`);
    return response.json();
}
