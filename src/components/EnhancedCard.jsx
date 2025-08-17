import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Box, 
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Skeleton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@mui/system";

// Subtle glow animation
const glow = keyframes`
  0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
  50% { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15); }
`;

const StyledCard = styled(Card)(({ theme, variant, elevation = 2 }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  overflow: "hidden",
  
  // Default styling
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  
  // Hover effects
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[elevation + 2],
    borderColor: theme.palette.primary.light,
  },
  
  // Variant-specific styling
  ...(variant === "gradient" && {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
    border: `1px solid ${theme.palette.primary.light}30`,
  }),
  
  ...(variant === "outlined" && {
    border: `2px solid ${theme.palette.divider}`,
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light + "10",
    },
  }),
  
  ...(variant === "glass" && {
    backgroundColor: theme.palette.background.paper + "CC",
    backdropFilter: "blur(10px)",
    border: `1px solid ${theme.palette.divider}40`,
  }),
}));

const EnhancedCard = ({
  title,
  subtitle,
  content,
  actions,
  avatar,
  badge,
  status,
  loading = false,
  variant = "default",
  elevation = 2,
  onClick,
  children,
  sx = {},
  headerProps = {},
  contentProps = {},
  actionsProps = {},
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "error";
      case "info": return "info";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <StyledCard variant={variant} elevation={elevation} sx={sx}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          subheader={<Skeleton variant="text" width="40%" />}
        />
        <CardContent>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <Fade in timeout={300}>
      <StyledCard 
        variant={variant} 
        elevation={elevation} 
        onClick={onClick}
        sx={{
          ...sx,
          ...(onClick && {
            cursor: "pointer",
            "&:active": {
              transform: "translateY(-2px)",
            },
          }),
        }}
      >
        {/* Badge */}
        {badge && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 1,
            }}
          >
            <Chip
              label={badge}
              size="small"
              color="primary"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                height: 24,
              }}
            />
          </Box>
        )}

        {/* Header */}
        {(title || subtitle || avatar) && (
          <CardHeader
            avatar={
              avatar && (
                <Avatar
                  src={typeof avatar === "string" ? avatar : undefined}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "primary.main",
                  }}
                >
                  {typeof avatar !== "string" ? avatar : undefined}
                </Avatar>
              )
            }
            title={
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {title}
                {status && (
                  <Chip
                    label={status}
                    size="small"
                    color={getStatusColor(status)}
                    sx={{ fontSize: "0.7rem", height: 20 }}
                  />
                )}
              </Typography>
            }
            subheader={
              subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )
            }
            {...headerProps}
          />
        )}

        {/* Content */}
        <CardContent
          sx={{
            pt: !title && !subtitle ? 2 : 0,
            pb: actions ? 1 : 2,
          }}
          {...contentProps}
        >
          {content || children}
        </CardContent>

        {/* Actions */}
        {actions && (
          <CardActions
            sx={{
              pt: 0,
              pb: 2,
              px: 2,
              justifyContent: "flex-end",
            }}
            {...actionsProps}
          >
            {actions}
          </CardActions>
        )}
      </StyledCard>
    </Fade>
  );
};

export default EnhancedCard;
