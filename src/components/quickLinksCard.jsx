import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SportsIcon from '@mui/icons-material/Sports';
import TodayIcon from '@mui/icons-material/Today';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';  
import NestedModal from './AddPlayerModal';
import AddFixtureModal from './AddFixtureModal';
import AddResultModal from './AddResultModal';
import PSDProcessorLink from './PSDProcessorLink';

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
            Quick Links
          </Typography>
          <Stack spacing={1} direction="column">
            <NestedModal />
            <AddFixtureModal />
            {/* <AddResultModal />
            <PSDProcessorLink /> */}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
