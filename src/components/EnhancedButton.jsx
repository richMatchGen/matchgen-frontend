import React from "react";
import { 
  Button, 
  CircularProgress, 
  Tooltip, 
  Fade,
  Box 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@mui/system";

// Ripple animation
const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const StyledButton = styled(Button)(({ theme, variant, size, loading }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  fontWeight: 600,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  
  // Disable pointer events when loading
  ...(loading && {
    pointerEvents: "none",
  }),
  
  // Size-specific styling
  ...(size === "small" && {
    fontSize: "0.875rem",
    padding: "6px 16px",
    minHeight: 32,
  }),
  
  ...(size === "medium" && {
    fontSize: "0.875rem",
    padding: "8px 20px",
    minHeight: 40,
  }),
  
  ...(size === "large" && {
    fontSize: "1rem",
    padding: "12px 24px",
    minHeight: 48,
  }),
  
  // Variant-specific styling
  ...(variant === "gradient" && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.primary.contrastText,
    border: "none",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows[4],
    },
  }),
  
  ...(variant === "glass" && {
    backgroundColor: theme.palette.background.paper + "CC",
    backdropFilter: "blur(10px)",
    border: `1px solid ${theme.palette.divider}40`,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.background.paper + "FF",
      borderColor: theme.palette.primary.main,
    },
  }),
  
  ...(variant === "soft" && {
    backgroundColor: theme.palette.primary.light + "20",
    color: theme.palette.primary.main,
    border: "none",
    "&:hover": {
      backgroundColor: theme.palette.primary.light + "30",
      transform: "translateY(-1px)",
    },
  }),
  
  // Loading state
  ...(loading && {
    "& .MuiButton-startIcon, & .MuiButton-endIcon": {
      opacity: 0,
    },
  }),
  
  // Ripple effect
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: "translate(-50%, -50%)",
    transition: "width 0.3s, height 0.3s",
  },
  
  "&:active::before": {
    width: 300,
    height: 300,
    animation: `${ripple} 0.6s ease-out`,
  },
}));

const EnhancedButton = ({
  children,
  loading = false,
  loadingText = "Loading...",
  variant = "contained",
  size = "medium",
  startIcon,
  endIcon,
  tooltip,
  disabled,
  onClick,
  sx = {},
  ...props
}) => {
  const buttonContent = (
    <StyledButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          startIcon
        )
      }
      endIcon={loading ? null : endIcon}
      sx={{
        ...sx,
        ...(loading && {
          "& .MuiCircularProgress-root": {
            color: "inherit",
          },
        }),
      }}
      {...props}
    >
      {loading ? loadingText : children}
    </StyledButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        <Box component="span">
          {buttonContent}
        </Box>
      </Tooltip>
    );
  }

  return buttonContent;
};

export default EnhancedButton;
