import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  SportsSoccer,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
  Search,
  Brightness4,
  Brightness7,
  CloudUpload,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backdropFilter: "blur(10px)",
  boxShadow: "none",
  
  "& .MuiToolbar-root": {
    minHeight: 64,
    padding: theme.spacing(0, 2),
  },
}));

const NavigationItem = ({ icon, text, path, active, onClick, badge }) => {
  const theme = useTheme();
  
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
          backgroundColor: active ? theme.palette.primary.light + "20" : "transparent",
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          "&:hover": {
            backgroundColor: active 
              ? theme.palette.primary.light + "30" 
              : theme.palette.action.hover,
          },
          transition: "all 0.2s ease",
        }}
      >
        <ListItemIcon
          sx={{
            color: "inherit",
            minWidth: 40,
          }}
        >
          {badge ? (
            <Badge badgeContent={badge} color="error">
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </ListItemIcon>
        <ListItemText
          primary={text}
          primaryTypographyProps={{
            fontWeight: active ? 600 : 400,
            fontSize: "0.875rem",
          }}
        />
        {active && (
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.main,
              ml: 1,
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const EnhancedNavigation = ({
  title = "MatchGen",
  user,
  onLogout,
  onThemeToggle,
  notifications = [],
  navigationItems = [],
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const defaultNavigationItems = [
    { icon: <Dashboard />, text: "Dashboard", path: "/dashboard" },
    { icon: <SportsSoccer />, text: "Fixtures", path: "/fixtures" },
    { icon: <People />, text: "Results", path: "/results" },
    { icon: <Settings />, text: "Settings", path: "/settings" },
    { icon: <CloudUpload />, text: "PSD Processor", path: "/psd-processor" },
  ];

  const items = navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      <StyledAppBar position="fixed" elevation={0}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Title */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            {title}
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {items.map((item) => (
                <Chip
                  key={item.path}
                  label={item.text}
                  icon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  variant={location.pathname === item.path ? "filled" : "outlined"}
                  color={location.pathname === item.path ? "primary" : "default"}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light + "20",
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
            {/* Search */}
            <IconButton color="inherit" size="large">
              <Search />
            </IconButton>

            {/* Notifications */}
            <IconButton
              color="inherit"
              size="large"
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Theme Toggle */}
            <IconButton color="inherit" size="large" onClick={onThemeToggle}>
              {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* User Menu */}
            <IconButton
              color="inherit"
              size="large"
              onClick={handleUserMenuOpen}
            >
              {user?.avatar ? (
                <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          
          <List>
            {items.map((item) => (
              <NavigationItem
                key={item.path}
                icon={item.icon}
                text={item.text}
                path={item.path}
                active={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                badge={item.badge}
              />
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {user && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar src={user.avatar} sx={{ width: 40, height: 40 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name || user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role || "User"}
                  </Typography>
                </Box>
              </Box>
              
              <NavigationItem
                icon={<Logout />}
                text="Logout"
                onClick={onLogout}
              />
            </Box>
          )}
        </Box>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        {user && (
          <MenuItem disabled>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user.name || user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role || "User"}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { handleUserMenuClose(); navigate("/profile"); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleUserMenuClose(); navigate("/settings"); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleUserMenuClose(); onLogout(); }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxHeight: 400,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications ({notifications.length})
          </Typography>
        </MenuItem>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem
              key={index}
              sx={{
                backgroundColor: notification.read ? "transparent" : theme.palette.primary.light + "10",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default EnhancedNavigation;
