import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import EnhancedCard from "./EnhancedCard";
import EnhancedButton from "./EnhancedButton";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import EnhancedNavigation from "./EnhancedNavigation";
import { usePageAuth } from "../hooks/usePageAuth";

// Stagger animation for cards
const staggerIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledDashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  backgroundImage: `radial-gradient(circle at 20% 80%, ${theme.palette.primary.light}10 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${theme.palette.secondary.light}10 0%, transparent 50%)`,
  backgroundAttachment: "fixed",
}));

const StyledContentArea = styled(Box)(({ theme }) => ({
  paddingTop: 80, // Account for fixed navigation
  paddingBottom: theme.spacing(4),
  minHeight: "calc(100vh - 80px)",
}));

const DashboardCard = ({ 
  title, 
  subtitle, 
  content, 
  actions, 
  variant = "default",
  delay = 0,
  ...props 
}) => {
  return (
    <Slide direction="up" in timeout={300 + delay}>
      <Box>
        <Fade in timeout={500 + delay}>
          <Box>
            <EnhancedCard
              title={title}
              subtitle={subtitle}
              variant={variant}
              actions={actions}
              sx={{
                height: "100%",
                animation: `${staggerIn} 0.6s ease-out ${delay}ms both`,
              }}
              {...props}
            >
              {content}
            </EnhancedCard>
          </Box>
        </Fade>
      </Box>
    </Slide>
  );
};

const EnhancedDashboard = ({
  title = "Dashboard",
  subtitle,
  cards = [],
  loading = false,
  error = null,
  onRetry,
  user,
  onLogout,
  onThemeToggle,
  notifications = [],
  navigationItems = [],
  children,
  maxWidth = "lg",
  showNavigation = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Default cards if none provided
  const defaultCards = [
    {
      title: "Welcome Back!",
      subtitle: "Here's what's happening today",
      content: (
        <Typography variant="body2" color="text.secondary">
          You have 3 upcoming matches and 2 pending results to review.
        </Typography>
      ),
      variant: "gradient",
      actions: (
        <EnhancedButton size="small" variant="soft">
          View All
        </EnhancedButton>
      ),
    },
    {
      title: "Quick Actions",
      subtitle: "Common tasks",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <EnhancedButton variant="outlined" size="small" fullWidth>
            Create Match
          </EnhancedButton>
          <EnhancedButton variant="outlined" size="small" fullWidth>
            Add Player
          </EnhancedButton>
          <EnhancedButton variant="outlined" size="small" fullWidth>
            Generate Content
          </EnhancedButton>
        </Box>
      ),
      variant: "outlined",
    },
    {
      title: "Recent Activity",
      subtitle: "Latest updates",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { text: "Match result uploaded", time: "2 hours ago" },
            { text: "New player added", time: "4 hours ago" },
            { text: "Content generated", time: "1 day ago" },
          ].map((item, index) => (
            <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">{item.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Box>
          ))}
        </Box>
      ),
      variant: "glass",
    },
  ];

  const displayCards = cards.length > 0 ? cards : defaultCards;

  if (loading) {
    return (
      <StyledDashboardContainer>
        {showNavigation && (
          <EnhancedNavigation
            title={title}
            user={user}
            onLogout={onLogout}
            onThemeToggle={onThemeToggle}
            notifications={notifications}
            navigationItems={navigationItems}
          />
        )}
        <StyledContentArea>
          <Container maxWidth={maxWidth}>
            <LoadingSpinner 
              message="Loading your dashboard..." 
              fullScreen={false}
              variant="dots"
            />
          </Container>
        </StyledContentArea>
      </StyledDashboardContainer>
    );
  }

  if (error) {
    return (
      <StyledDashboardContainer>
        {showNavigation && (
          <EnhancedNavigation
            title={title}
            user={user}
            onLogout={onLogout}
            onThemeToggle={onThemeToggle}
            notifications={notifications}
            navigationItems={navigationItems}
          />
        )}
        <StyledContentArea>
          <Container maxWidth={maxWidth}>
            <ErrorMessage
              message={error}
              onRetry={onRetry}
              variant="card"
              fullWidth
            />
          </Container>
        </StyledContentArea>
      </StyledDashboardContainer>
    );
  }

  return (
    <StyledDashboardContainer>
      {showNavigation && (
        <EnhancedNavigation
          title={title}
          user={user}
          onLogout={onLogout}
          onThemeToggle={onThemeToggle}
          notifications={notifications}
          navigationItems={navigationItems}
        />
      )}
      
      <StyledContentArea>
        <Container maxWidth={maxWidth}>
          {/* Header */}
          <Fade in timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Fade>

          {/* Content */}
          {children ? (
            <Fade in timeout={500}>
              <Box>{children}</Box>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {displayCards.map((card, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <DashboardCard
                    {...card}
                    delay={index * 100}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </StyledContentArea>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledDashboardContainer>
  );
};

export default EnhancedDashboard;
