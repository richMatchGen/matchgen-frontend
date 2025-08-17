import React, { useState } from "react";
import {
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Chip,
  Fade,
  Collapse,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Info,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)(({ theme, variant, error, success }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 2,
    transition: "all 0.2s ease",
    
    // Default state
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    
    // Focus state
    "&.Mui-focused": {
      borderColor: success ? theme.palette.success.main : theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${success ? theme.palette.success.light : theme.palette.primary.light}20`,
    },
    
    // Error state
    ...(error && {
      borderColor: theme.palette.error.main,
      "&.Mui-focused": {
        borderColor: theme.palette.error.main,
        boxShadow: `0 0 0 2px ${theme.palette.error.light}20`,
      },
    }),
    
    // Success state
    ...(success && {
      borderColor: theme.palette.success.main,
      "&.Mui-focused": {
        borderColor: theme.palette.success.main,
        boxShadow: `0 0 0 2px ${theme.palette.success.light}20`,
      },
    }),
    
    // Variant-specific styling
    ...(variant === "glass" && {
      backgroundColor: theme.palette.background.paper + "CC",
      backdropFilter: "blur(10px)",
      border: `1px solid ${theme.palette.divider}40`,
    }),
    
    ...(variant === "filled" && {
      backgroundColor: theme.palette.action.hover,
      border: "none",
      "&:hover": {
        backgroundColor: theme.palette.action.selected,
      },
    }),
  },
  
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    "&.Mui-focused": {
      color: success ? theme.palette.success.main : theme.palette.primary.main,
    },
    ...(error && {
      color: theme.palette.error.main,
    }),
    ...(success && {
      color: theme.palette.success.main,
    }),
  },
}));

const EnhancedTextField = ({
  label,
  value,
  onChange,
  error,
  success,
  helperText,
  variant = "outlined",
  type = "text",
  required = false,
  disabled = false,
  fullWidth = true,
  startIcon,
  endIcon,
  showPasswordToggle = false,
  validationRules = [],
  onValidationChange,
  sx = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const validateField = (value) => {
    const errors = [];
    
    validationRules.forEach((rule) => {
      if (rule.required && !value) {
        errors.push(rule.message || "This field is required");
      } else if (rule.minLength && value && value.length < rule.minLength) {
        errors.push(rule.message || `Minimum ${rule.minLength} characters required`);
      } else if (rule.maxLength && value && value.length > rule.maxLength) {
        errors.push(rule.message || `Maximum ${rule.maxLength} characters allowed`);
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.push(rule.message || "Invalid format");
      } else if (rule.custom && !rule.custom(value)) {
        errors.push(rule.message || "Invalid value");
      }
    });
    
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    
    if (onValidationChange) {
      onValidationChange(errors.length === 0, errors);
    }
    
    return errors.length === 0;
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    onChange?.(event);
    validateField(newValue);
  };

  const handleBlur = () => {
    validateField(value);
  };

  const displayError = error || validationErrors.length > 0;
  const displaySuccess = success || (isValid && value && validationRules.length > 0);

  const inputType = type === "password" && showPasswordToggle 
    ? (showPassword ? "text" : "password") 
    : type;

  const endAdornment = (
    <>
      {type === "password" && showPasswordToggle && (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )}
      {endIcon && (
        <InputAdornment position="end">
          {endIcon}
        </InputAdornment>
      )}
      {displaySuccess && (
        <InputAdornment position="end">
          <CheckCircle color="success" fontSize="small" />
        </InputAdornment>
      )}
      {displayError && (
        <InputAdornment position="end">
          <Error color="error" fontSize="small" />
        </InputAdornment>
      )}
    </>
  );

  const displayHelperText = displayError 
    ? (error || validationErrors[0]) 
    : helperText;

  return (
    <FormControl 
      error={displayError} 
      fullWidth={fullWidth}
      sx={{ mb: 2 }}
    >
      <StyledTextField
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        variant={variant}
        type={inputType}
        required={required}
        disabled={disabled}
        error={displayError}
        success={displaySuccess}
        helperText={displayHelperText}
        startAdornment={startIcon && (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        )}
        endAdornment={endAdornment}
        sx={sx}
        {...props}
      />
      
      {/* Validation errors */}
      <Collapse in={validationErrors.length > 1}>
        <Box sx={{ mt: 1 }}>
          {validationErrors.slice(1).map((error, index) => (
            <Chip
              key={index}
              label={error}
              size="small"
              color="error"
              variant="outlined"
              sx={{ mr: 1, mb: 0.5 }}
            />
          ))}
        </Box>
      </Collapse>
    </FormControl>
  );
};

const FormSection = ({ title, subtitle, children, collapsible = false, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (collapsible) {
    return (
      <Box sx={{ mb: 3 }}>
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderRadius: 1,
            backgroundColor: "action.hover",
            "&:hover": {
              backgroundColor: "action.selected",
            },
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Collapse in={expanded}>
          <Box sx={{ p: 2 }}>
            {children}
          </Box>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  );
};

const FormActions = ({ children, sx = {} }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "flex-end",
        mt: 3,
        pt: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export { EnhancedTextField, FormSection, FormActions };
export default EnhancedTextField;
