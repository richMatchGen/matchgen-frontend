import * as React from 'react';
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './AddPlayers';
import CustomizedDataGrid from './CustomizedDataGrid';
import AddPlayers from './AddPlayers';
import HighlightedCard from './HighlightedCard';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import { addPlayer, getSquad,getClub } from "../services/club";  // ✅ Ensure this is correctly imported
import { getToken } from "../services/auth";
import { useNavigate } from "react-router-dom";

import { getProfile } from '../services/auth'; // Ensure this function exists

export default function MainGrid({ user }) {

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [userClub, setUserClub] = useState(null); // ✅ Declare userProfile state



    useEffect(() => {
    const fetchClub = async () => {
      const ClubData  = await getClub();
      console.log("Fetched Club:", ClubData );
      setUserClub(ClubData);
    };
    fetchClub();
  }, []);

return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {userClub?.name}
      </Typography>
{/*       <Grid */}
{/*         container */}
{/*         spacing={2} */}
{/*         columns={12} */}
{/*         sx={{ mb: (AppTheme) => AppTheme.spacing(2) }} */}
{/*       > */}
{/*         {data.map((card, index) => ( */}
{/*           <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}> */}
{/*             <StatCard {...card} /> */}
{/*           </Grid> */}
{/*         ))} */}
{/*         <Grid size={{ xs: 12, sm: 6, lg: 3 }}> */}
{/*           <HighlightedCard /> */}
{/*         </Grid> */}
{/*         <Grid size={{ xs: 12, md: 6 }}> */}
{/*           <SessionsChart /> */}
{/*         </Grid> */}
{/*         <Grid size={{ xs: 12, md: 6 }}> */}
{/*           <PageViewsBarChart /> */}
{/*         </Grid> */}
{/*       </Grid> */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Squad Management
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
            <CustomizedDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <CustomizedTreeView />
{/*             <ChartUserByCountry /> */}
          </Stack>
        </Grid>
      </Grid>

<Copyright sx={{ my: 4 }} />
    </Box>
  );
}
