import React from "react";
import { Box, CircularProgress, Typography, Skeleton, Fade } from "@mui/material";
import { keyframes } from "@mui/system";

// Custom pulse animation
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = 40, 
  variant = "spinner",
  skeletonRows = 3,
  skeletonHeight = 20,
  fullScreen = false 
}) => {
  if (variant === "skeleton") {
    return (
      <Box sx={{ width: "100%" }}>
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={skeletonHeight}
            sx={{
              mb: 1,
              borderRadius: 1,
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }}
          />
        ))}
      </Box>
    );
  }

  if (variant === "dots") {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={fullScreen ? "100vh" : "200px"}
        gap={2}
      >
        <Box display="flex" gap={1}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: `${pulse} 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={300}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={fullScreen ? "100vh" : "200px"}
        gap={2}
      >
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{
            color: "primary.main",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 200,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

export default LoadingSpinner;
