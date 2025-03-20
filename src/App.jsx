import { useEffect, useState } from "react";
import { fetchMatches } from "./api";

function App() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetchMatches().then(data => setMatches(data));
    }, []);

    return (
        <div>
            <h1>MatchGen - Upcoming Matches</h1>
            <ul>
                {matches.map(match => (
                    <li key={match.id}>
                        {match.home_team} vs {match.away_team} on {match.match_date}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
