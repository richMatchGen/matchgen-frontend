import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SportsIcon from '@mui/icons-material/Sports';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TodayIcon from '@mui/icons-material/Today';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

export default function FixtureCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [match, setMatch] = React.useState(null);

  React.useEffect(() => {
    const fetchUpcomingMatch = async () => {
      try {
        const res = await axios.get('https://matchgen-backend-production.up.railway.app/api/content/matches/upcoming/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Or however you store your JWT
          },
        });
        setMatch(res.data);
      } catch (err) {
        console.error('Failed to fetch upcoming fixtures', err);
      }
    };

    fetchUpcomingMatch();
  }, []);

  return (
<Card sx={{ height: '100%' }}>
  <CardContent>
    <TodayIcon />
    <Typography
      component="h2"
      variant="subtitle2"
      gutterBottom
      sx={{ fontWeight: '600' }}
    >
      Upcoming Fixture
    </Typography>

    {match ? (
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            vs {match.opponent}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {new Date(match.date).toLocaleDateString('en-GB')} — {match.venue}
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

    <Button
      variant="contained"
      size="small"
      color="primary"
      endIcon={<ChevronRightRoundedIcon />}
      fullWidth={isSmallScreen}
      component={RouterLink}
      to={match ? `/gen/posts/${match.id}/upcoming` : "/gen/posts"}
    >
      Generate Post
    </Button>
  </CardContent>
</Card>
  );
}
