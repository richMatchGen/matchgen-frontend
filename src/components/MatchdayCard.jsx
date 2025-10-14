import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SportsIcon from '@mui/icons-material/Sports';
import TodayIcon from '@mui/icons-material/Today';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import NestedModal from './AddPlayerModal';

export default function MatchDayCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [match, setMatch] = React.useState(null);

  // Debug: Log whenever match state changes
  React.useEffect(() => {
    console.log('MatchdayCard - match state changed to:', match);
    console.log('MatchdayCard - !match evaluates to:', !match);
  }, [match]);

  React.useEffect(() => {
    const fetchMatchDay = async () => {
      try {
        const res = await axios.get('https://matchgen-backend-production.up.railway.app/api/content/matches/matchday/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Or however you store your JWT
          },
        });
        console.log('MatchdayCard - API response:', res.data);
        console.log('MatchdayCard - res.data type:', typeof res.data);
        console.log('MatchdayCard - res.data.detail:', res.data?.detail);
        
        // Check if the response indicates no matches found
        if (res.data && res.data.detail && (
          res.data.detail.includes('No upcoming matches found') ||
          res.data.detail.includes('No matches found') ||
          res.data.detail.includes('not found')
        )) {
          console.log('MatchdayCard - Setting match to null (no matches found)');
          setMatch(null);
        } else if (res.data && Object.keys(res.data).length === 1 && res.data.detail) {
          // If response only has a detail field (error message), treat as no match
          console.log('MatchdayCard - Setting match to null (only detail field present)');
          setMatch(null);
        } else {
          console.log('MatchdayCard - Setting match to data:', res.data);
          setMatch(res.data);
        }

      } catch (err) {
        console.error('Failed to fetch Matchday:', err);
        setMatch(null); // Explicitly set to null on error
      }
    };

    fetchMatchDay();
  }, []);

  return (
<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
    <Box sx={{ flexGrow: 1 }}>
      <TodayIcon />
      <Typography
        component="h2"
        variant="subtitle2"
        gutterBottom
        sx={{ fontWeight: '600' }}
      >
        Matchday
      </Typography>

      {match ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              vs {match.opponent}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
            {match.date ? new Date(match.date).toLocaleDateString('en-GB') : 'No match'} — {match.venue || 'TBD'}
            </Typography>
          </Box>

          {match.opponent_logo && (
            <Box
              component="img"
              src={match.opponent_logo}
              alt={`${match.opponent} logo`}
              sx={{ width: 64, height: 64, ml: 2 }}
            />
          )}
        </Box>
      ) : (
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          No matches available.
        </Typography>
      )}
    </Box>

    <Box sx={{ marginTop: 'auto', pt: 2 }}>
      <Button
        variant="contained"
        size="small"
        color="primary"
        endIcon={<ChevronRightRoundedIcon />}
        fullWidth={isSmallScreen}
        disabled={!match}
        component={RouterLink}
        to={match ? `/gen/posts/${match.id}/matchday` : "/gen/posts"}
        onClick={() => {
          console.log('MatchdayCard button clicked - match:', match);
          console.log('MatchdayCard button clicked - !match:', !match);
          console.log('MatchdayCard button clicked - disabled:', !match);
        }}
      >
        Generate Post
      </Button>
    </Box>
  </CardContent>
</Card>

  );
}
