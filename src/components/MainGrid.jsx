import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/Components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './CustomizedTreeView';
import ClubProfileDetails from './ClubProfileDetails';
import HighlightedCard from './ResultCard';
import MatchDayCard from './MatchdayCard';
import FixtureCard from './FixtureCard';
import QuickLinksCard from './quickLinksCard';
import MediaManager from './MediaManager';
import SocialMediaConnect from './SocialMediaConnect';
import ScheduledPosts from './ScheduledPosts';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import TodoList from './TodoList';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';


export default function MainGrid() {
  console.log('🏢 MainGrid component rendering');
  
  return (

    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Todo List for new users */}
      <TodoList />
      
      {/* 1st Row: 3 Fixture Cards */}
      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MatchDayCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <FixtureCard />
        </Grid>
      </Grid>

      {/* 2nd Row: Quick Links + Social Media (Left) | Media Manager (Right) */}
      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 2 }}>
          <Stack spacing={2}>
            <QuickLinksCard />
            <SocialMediaConnect />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 10}}>
          <MediaManager />
        </Grid>
      </Grid>

      {/* 3rd Row: Scheduled Posts + Calendar */}
      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12 }}>
          <ScheduledPosts />
        </Grid>
      </Grid>

<Copyright sx={{ my: 4 }} />
    </Box>
  );
}
