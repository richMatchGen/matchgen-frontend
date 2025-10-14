import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SportsIcon from '@mui/icons-material/Sports';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [match, setMatch] = React.useState(null);

  React.useEffect(() => {
    const fetchLastMatch = async () => {
      try {
        const res = await axios.get('https://matchgen-backend-production.up.railway.app/api/content/matches/last/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Or however you store your JWT
          },
        });
        console.log('ResultCard - API response:', res.data);
        // Check if the response indicates no matches found
        if (res.data && res.data.detail && (
          res.data.detail.includes('No past matches found') ||
          res.data.detail.includes('No matches found') ||
          res.data.detail.includes('not found')
        )) {
          console.log('ResultCard - Setting match to null (no matches found)');
          setMatch(null);
        } else if (res.data && Object.keys(res.data).length === 1 && res.data.detail) {
          // If response only has a detail field (error message), treat as no match
          console.log('ResultCard - Setting match to null (only detail field present)');
          setMatch(null);
        } else {
          console.log('ResultCard - Setting match to data:', res.data);
          setMatch(res.data);
        }

      } catch (err) {
        console.error('Failed to fetch last match:', err);
        setMatch(null); // Explicitly set to null on error
      }
    };

    fetchLastMatch();
  }, []);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <SportsIcon sx={{ mb: 1 }} />
          <Typography
            component="h2"
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: '600' }}
          >
            Last Match
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
            to={match ? `/gen/posts/${match.id}/fulltime` : "/gen/posts"}
            onClick={() => console.log('ResultCard button clicked - match:', match, 'disabled:', !match)}
          >
            Generate Post
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
