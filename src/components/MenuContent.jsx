import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import EventIcon from '@mui/icons-material/Event';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import PaymentIcon from '@mui/icons-material/Payment';
import { getToken } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';

const MenuSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#999999',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(0.5),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.25, 1),

  color: '#666666',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    color: '#000000',
  },
  '&.Mui-selected': {
    backgroundColor: '#f0f0f0',
    color: '#000000',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'inherit !important',
    minWidth: 40,
  },
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
}));

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, link: '/dashboard' },
  // { text: 'Gen Posts', icon: <AnalyticsRoundedIcon />, link: '/gen/posts' },
  { text: 'Club', icon: <PeopleRoundedIcon />, link: '/club' },
  // { text: 'Fixtures', icon: <EventIcon />, link: '/fixtures-management' },
  { text: 'Templates', icon: <AssignmentRoundedIcon />, link: '/gen/templates' },
];

const secondaryListItems = [
  { text: 'Subscription', icon: <PaymentIcon />, link: '/subscription' },
  { text: 'Settings', icon: <SettingsRoundedIcon />, link: '/settings' },
  { text: 'About', icon: <InfoRoundedIcon />, link: '/about' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, link: '/feedback' },
];

export default function MenuContent() {
  const location = useLocation();

  const isActive = (link) => {
    if (link === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(link);
  };

  return (
    <Stack sx={{ flexGrow: 1, justifyContent: 'space-between' }}>
      {/* Main Navigation */}
      <MenuSection>
        <SectionTitle>Main</SectionTitle>
        <List dense disablePadding>
          {mainListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <StyledListItemButton 
                component={Link} 
                to={item.link} 
                selected={isActive(item.link)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
      </MenuSection>

      {/* Secondary Navigation */}
      <MenuSection>
        <SectionTitle>Account</SectionTitle>
        <List dense disablePadding>
          {secondaryListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <StyledListItemButton 
                component={Link} 
                to={item.link} 
                selected={isActive(item.link)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
      </MenuSection>
    </Stack>
  );
}
