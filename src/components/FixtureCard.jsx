import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SportsIcon from '@mui/icons-material/Sports';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TodayIcon from '@mui/icons-material/Today';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

export default function FixtureCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [match, setMatch] = React.useState(null);

  React.useEffect(() => {
    const fetchLastMatch = async () => {
      try {
        const res = await axios.get('/api/matches/last/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`, // Or however you store your JWT
          },
        });
        setMatch(res.data);
      } catch (err) {
        console.error('Failed to fetch last match:', err);
      }
    };

    fetchLastMatch();
  }, []);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <DateRangeIcon />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          Upcoming Fixture
        </Typography>

        {match ? (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              vs {match.opponent}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
              {match.date} — {match.result}
            </Typography>
          </>
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
        >
          Get insights
        </Button>
      </CardContent>
    </Card>
  );
}
