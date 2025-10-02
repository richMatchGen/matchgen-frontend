import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchIcon from '@mui/icons-material/Search';
import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from '../themes/shared-theme/ColorModeIconDropdown';
import Search from './Search';
import { useLocation } from 'react-router-dom';

const HeaderContainer = styled(Stack)(({ theme }) => ({
  display: { xs: 'none', md: 'flex' },
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: '1700px',
  padding: theme.spacing(2, 3),
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e0e0e0',
  margin: theme.spacing(0, 2),
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#000000',
  letterSpacing: '-0.02em',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: '#666666',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    color: '#000000',
  },
  width: 40,
  height: 40,
}));

const getPageTitle = (pathname) => {
  const pathMap = {
    '/dashboard': 'Dashboard',
    '/gen/posts': 'Generate Posts',
    '/club': 'Club Overview',
    '/fixtures-management': 'Fixtures',
    '/gen/templates': 'Templates',
    '/subscription': 'Subscription',
    '/settings': 'Settings',
    '/profile': 'Profile',
    '/settings/account': 'Account Settings',
    '/settings/profile': 'User Profile',
    '/team-management': 'Team Management',
  };

  // Check for exact matches first
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Check for partial matches
  for (const [path, title] of Object.entries(pathMap)) {
    if (pathname.startsWith(path)) {
      return title;
    }
  }

  // Default fallback
  return 'MatchGen';
};

export default function Header() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <HeaderContainer direction="row" spacing={2}>
      {/* Left Section - Page Title */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <PageTitle variant="h4">
          {pageTitle}
        </PageTitle>
      </Stack>

      {/* Right Section - Actions */}
      {/* <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Search">
          <ActionButton size="small">
            <SearchIcon fontSize="small" />
          </ActionButton>
        </Tooltip>
        
        <CustomDatePicker />
        
        <Tooltip title="Notifications">
          <ActionButton size="small">
            <Badge badgeContent={3} color="error" max={99}>
              <NotificationsRoundedIcon fontSize="small" />
            </Badge>
          </ActionButton>
        </Tooltip>
        
        <ColorModeIconDropdown />
      </Stack> */}
    </HeaderContainer>
  );
}
