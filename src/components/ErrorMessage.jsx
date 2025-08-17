import React from "react";
import { Box, Typography, Button, Paper, Fade, Alert } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { keyframes } from "@mui/system";

// Shake animation for error emphasis
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

const ErrorMessage = ({ 
  message = "Something went wrong", 
  onRetry, 
  showRetry = true,
  variant = "card", // "card" or "alert"
  severity = "error",
  fullWidth = false,
  showIcon = true,
  actionText = "Try Again"
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
      p={3}
      sx={{ width: fullWidth ? "100%" : "auto" }}
    >
      {showIcon && (
        <Box
          sx={{
            animation: `${shake} 0.5s ease-in-out`,
            color: "error.main",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 48 }} />
        </Box>
      )}
      <Typography 
        variant="h6" 
        color="error" 
        textAlign="center"
        sx={{ fontWeight: 600 }}
      >
        {message}
      </Typography>
      {showRetry && onRetry && (
        <Button 
          variant="outlined" 
          onClick={onRetry}
          startIcon={<RefreshIcon />}
          sx={{ 
            mt: 1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );

  if (variant === "alert") {
    return (
      <Fade in timeout={500}>
        <Alert 
          severity={severity}
          action={
            showRetry && onRetry ? (
              <Button 
                color="inherit" 
                size="small" 
                onClick={onRetry}
                startIcon={<RefreshIcon />}
              >
                {actionText}
              </Button>
            ) : null
          }
          sx={{ 
            width: fullWidth ? "100%" : "auto",
            borderRadius: 2,
            "& .MuiAlert-icon": {
              fontSize: 24,
            },
          }}
        >
          {message}
        </Alert>
      </Fade>
    );
  }

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "error.light",
          bgcolor: "error.50",
          width: fullWidth ? "100%" : "auto",
        }}
      >
        {content}
      </Paper>
    </Fade>
  );
};

export default ErrorMessage;
