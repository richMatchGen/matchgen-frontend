import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/Components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './ResultCard';
import MatchDayCard from './MatchdayCard';
import FixtureCard from './FixtureCard';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';


export default function MainGrid() {
  return (

    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
      <Link
        component={RouterLink}
        to="/results"
        underline="none"
        color="inherit"
        sx={{ marginRight: 1 }}
      >
        Results
      </Link>
      &amp;
      <Link
        component={RouterLink}
        to="/fixtures"
        underline="none"
        color="inherit"
        sx={{ marginLeft: 1 }}
      >
        Fixtures
      </Link>
    </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (AppTheme) => AppTheme.spacing(2) }}
      >
        {/* {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))} */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MatchDayCard />
        </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <FixtureCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
       </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
           {/* <PageViewsBarChart /> */}
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Squad Management
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
            <CustomizedDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            {/* <CustomizedTreeView /> */}
{/*             <ChartUserByCountry /> */}
          </Stack>
        </Grid>
      </Grid>

<Copyright sx={{ my: 4 }} />
    </Box>
  );
}
