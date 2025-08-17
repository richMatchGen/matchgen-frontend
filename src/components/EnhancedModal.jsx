import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Fade,
  Slide,
  Backdrop,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  Fullscreen,
  FullscreenExit,
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

// Enhanced backdrop animation
const backdropAnimation = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

// Enhanced dialog animation
const dialogAnimation = keyframes`
  0% { 
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  animation: `${backdropAnimation} 0.3s ease-out`,
}));

const StyledDialog = styled(Dialog)(({ theme, variant, fullHeight }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[8],
    animation: `${dialogAnimation} 0.3s ease-out`,
    maxHeight: fullHeight ? '100vh' : '90vh',
    
    // Variant-specific styling
    ...(variant === 'glass' && {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
    
    ...(variant === 'dark' && {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    }),
  },
}));

const EnhancedModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  variant = 'default',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  showCloseButton = true,
  showFullscreenButton = false,
  showDownloadButton = false,
  showPrintButton = false,
  showShareButton = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  fullHeight = false,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    }
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' && disableBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) {
      return;
    }
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(event, reason);
    }, 300);
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download clicked');
  };

  const handlePrint = () => {
    // Implement print functionality
    window.print();
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: title,
        text: subtitle,
        url: window.location.href,
      });
    }
  };

  const defaultActions = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      {onCancel && (
        <button
          onClick={handleCancel}
          style={{
            padding: '8px 16px',
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {cancelText}
        </button>
      )}
      {onConfirm && (
        <button
          onClick={handleConfirm}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: theme.palette[confirmColor].main,
            color: theme.palette[confirmColor].contrastText,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {confirmText}
        </button>
      )}
    </Box>
  );

  const headerActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {showShareButton && (
        <IconButton size="small" onClick={handleShare}>
          <Share fontSize="small" />
        </IconButton>
      )}
      {showPrintButton && (
        <IconButton size="small" onClick={handlePrint}>
          <Print fontSize="small" />
        </IconButton>
      )}
      {showDownloadButton && (
        <IconButton size="small" onClick={handleDownload}>
          <Download fontSize="small" />
        </IconButton>
      )}
      {showFullscreenButton && (
        <IconButton size="small" onClick={handleFullscreen}>
          {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
        </IconButton>
      )}
      {showCloseButton && (
        <IconButton size="small" onClick={handleClose}>
          <Close fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen || isFullscreen}
      variant={variant}
      fullHeight={fullHeight}
      BackdropComponent={StyledBackdrop}
      TransitionComponent={Slide}
      transitionDuration={300}
      sx={sx}
    >
      <Fade in={isVisible} timeout={300}>
        <Box>
          {/* Header */}
          {(title || subtitle || headerActions) && (
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                pb: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                {title && (
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0 }}>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {headerActions}
            </DialogTitle>
          )}

          {/* Content */}
          <DialogContent
            sx={{
              pt: (title || subtitle) ? 0 : 2,
              pb: actions ? 1 : 2,
              minHeight: fullHeight ? '60vh' : 'auto',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <div>Loading...</div>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error" variant="h6" gutterBottom>
                  Error
                </Typography>
                <Typography color="text.secondary">
                  {error}
                </Typography>
              </Box>
            ) : (
              children
            )}
          </DialogContent>

          {/* Actions */}
          {actions && (
            <DialogActions sx={{ px: 3, pb: 2 }}>
              {actions}
            </DialogActions>
          )}
          {!actions && (onConfirm || onCancel) && (
            <DialogActions sx={{ px: 3, pb: 2 }}>
              {defaultActions}
            </DialogActions>
          )}
        </Box>
      </Fade>
    </StyledDialog>
  );
};

// Quick confirmation dialog
const ConfirmDialog = ({
  open,
  onClose,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  onConfirm,
  severity = 'warning',
}) => {
  const theme = useTheme();
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  };

  return (
    <EnhancedModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={message}
      onConfirm={onConfirm}
      onCancel={onClose}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmColor={getSeverityColor(severity)}
      maxWidth="xs"
      fullWidth={false}
    />
  );
};

// Form dialog with enhanced styling
const FormDialog = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  maxWidth = 'md',
  fullHeight = false,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  return (
    <EnhancedModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth={maxWidth}
      fullHeight={fullHeight}
      loading={loading}
    >
      <Box component="form" onSubmit={handleSubmit}>
        {children}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <button
            type="button"
            onClick={onCancel || onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#1976d2',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Submitting...' : submitText}
          </button>
        </DialogActions>
      </Box>
    </EnhancedModal>
  );
};

export { EnhancedModal, ConfirmDialog, FormDialog };
export default EnhancedModal;
