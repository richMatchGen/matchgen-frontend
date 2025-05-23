import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SportsIcon from '@mui/icons-material/Sports';
import TodayIcon from '@mui/icons-material/Today';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';  
import NestedModal from './AddPlayerModal';
import AddFixtureModal from './AddFixtureModal';
import AddResultModal from './AddResultModal';

export default function QuickLinksCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [match, setMatch] = React.useState(null);

  React.useEffect(() => {
    const fetchMatchDay = async () => {
      try {
        const res = await axios.get('https://matchgen-backend-production.up.railway.app/api/content/matches/matchday/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Or however you store your JWT
          },
        });
        setMatch(res.data);

      } catch (err) {
        console.error('Failed to fetch Matchday:', err);
      }
    };

    fetchMatchDay();
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
          Quick Links
        </Typography>
        <Stack spacing={1} direction="column">
          <NestedModal />
          <AddFixtureModal />
          <AddResultModal />
          </Stack>
      </CardContent>
    </Card>
  );
}
