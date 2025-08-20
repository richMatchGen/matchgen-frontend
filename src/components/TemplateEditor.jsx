import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ColorPicker,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  DragIndicator,
  ColorLens,
  FormatBold,
  FormatItalic,
  TextFields
} from '@mui/icons-material';

const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const canvasRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null);

  useEffect(() => {
    if (template) {
      setElements(template.elements || []);
    }
  }, [template]);

  useEffect(() => {
    renderPreview();
  }, [elements]);

  const renderPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background (placeholder)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw template image if available
    if (template?.image_url) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawElements(ctx);
      };
      img.src = template.image_url;
    } else {
      drawElements(ctx);
    }
  };

  const drawElements = (ctx) => {
    elements.forEach(element => {
      if (!element.visible) return;

      if (element.type === 'text') {
        drawTextElement(ctx, element);
      } else if (element.type === 'image') {
        drawImageElement(ctx, element);
      }
    });
  };

  const drawTextElement = (ctx, element) => {
    const stringElement = element.string_elements?.[0];
    if (!stringElement) return;

    // Calculate position
    let x = element.x;
    let y = element.y;
    
    if (element.use_percentage) {
      x = (x / 100) * 800;
      y = (y / 100) * 600;
    }

    // Set font
    const fontSize = stringElement.font_size || 24;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = stringElement.color || '#FFFFFF';
    ctx.textAlign = stringElement.alignment || 'left';

    // Draw text
    ctx.fillText(stringElement.content_key || 'Sample Text', x, y);

    // Draw selection indicator
    if (selectedElement?.id === element.id) {
      ctx.strokeStyle = '#1976d2';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 5, y - fontSize - 5, 200, fontSize + 10);
    }
  };

  const drawImageElement = (ctx, element) => {
    let x = element.x;
    let y = element.y;
    
    if (element.use_percentage) {
      x = (x / 100) * 800;
      y = (y / 100) * 600;
    }

    // Draw placeholder rectangle
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, element.width || 100, element.height || 100);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(x, y, element.width || 100, element.height || 100);

    // Draw selection indicator
    if (selectedElement?.id === element.id) {
      ctx.strokeStyle = '#1976d2';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, (element.width || 100) + 4, (element.height || 100) + 4);
    }
  };

  const handleElementClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked element
    const clickedElement = elements.find(element => {
      if (!element.visible) return false;

      let elementX = element.x;
      let elementY = element.y;
      
      if (element.use_percentage) {
        elementX = (elementX / 100) * 800;
        elementY = (elementY / 100) * 600;
      }

      if (element.type === 'text') {
        return x >= elementX - 10 && x <= elementX + 200 && 
               y >= elementY - 30 && y <= elementY + 10;
      } else if (element.type === 'image') {
        return x >= elementX && x <= elementX + (element.width || 100) &&
               y >= elementY && y <= elementY + (element.height || 100);
      }
      return false;
    });

    setSelectedElement(clickedElement || null);
  };

  const updateElement = (elementId, updates) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const updateStringElement = (elementId, stringId, updates) => {
    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          string_elements: el.string_elements?.map(str => 
            str.id === stringId ? { ...str, ...updates } : str
          ) || []
        };
      }
      return el;
    }));
  };

  const toggleElementVisibility = (elementId) => {
    updateElement(elementId, { visible: !elements.find(el => el.id === elementId)?.visible });
  };

  const handleColorChange = (color) => {
    if (colorPickerTarget) {
      const { elementId, stringId, field } = colorPickerTarget;
      if (stringId) {
        updateStringElement(elementId, stringId, { [field]: color });
      } else {
        updateElement(elementId, { [field]: color });
      }
    }
    setShowColorPicker(false);
    setColorPickerTarget(null);
  };

  const openColorPicker = (elementId, stringId = null, field = 'color') => {
    setColorPickerTarget({ elementId, stringId, field });
    setShowColorPicker(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Template Editor
      </Typography>

      <Grid container spacing={3}>
        {/* Preview Canvas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                <canvas
                  ref={canvasRef}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    cursor: 'pointer',
                    maxHeight: '600px'
                  }}
                  onClick={handleElementClick}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click on elements to select them for editing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Element Properties */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Element Properties
              </Typography>

              {selectedElement ? (
                <Stack spacing={2}>
                  {/* Element Type */}
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedElement.type.toUpperCase()} Element
                  </Typography>

                  {/* Visibility Toggle */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedElement.visible}
                        onChange={() => toggleElementVisibility(selectedElement.id)}
                      />
                    }
                    label="Visible"
                  />

                  {/* Position Controls */}
                  <Typography variant="subtitle2">Position</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        label="X"
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) })}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Y"
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) })}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedElement.use_percentage}
                        onChange={(e) => updateElement(selectedElement.id, { use_percentage: e.target.checked })}
                      />
                    }
                    label="Use Percentage"
                  />

                  {/* Text-specific properties */}
                  {selectedElement.type === 'text' && selectedElement.string_elements?.[0] && (
                    <>
                      <Divider />
                      <Typography variant="subtitle2">Text Styling</Typography>
                      
                      {selectedElement.string_elements.map((stringEl, index) => (
                        <Stack key={stringEl.id || index} spacing={2}>
                          <TextField
                            label="Font Size"
                            type="number"
                            value={stringEl.font_size}
                            onChange={(e) => updateStringElement(selectedElement.id, stringEl.id, { font_size: parseInt(e.target.value) })}
                            size="small"
                          />

                          <FormControl size="small">
                            <InputLabel>Alignment</InputLabel>
                            <Select
                              value={stringEl.alignment}
                              onChange={(e) => updateStringElement(selectedElement.id, stringEl.id, { alignment: e.target.value })}
                              label="Alignment"
                            >
                              <MenuItem value="left">Left</MenuItem>
                              <MenuItem value="center">Center</MenuItem>
                              <MenuItem value="right">Right</MenuItem>
                            </Select>
                          </FormControl>

                          {/* Color Picker */}
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              Text Color
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<ColorLens />}
                              onClick={() => openColorPicker(selectedElement.id, stringEl.id, 'color')}
                              sx={{ 
                                backgroundColor: stringEl.color,
                                color: stringEl.color === '#FFFFFF' ? '#000' : '#fff',
                                '&:hover': { backgroundColor: stringEl.color }
                              }}
                            >
                              {stringEl.color}
                            </Button>
                          </Box>

                          {/* Text Shadow */}
                          <FormControlLabel
                            control={
                              <Switch
                                checked={stringEl.text_shadow}
                                onChange={(e) => updateStringElement(selectedElement.id, stringEl.id, { text_shadow: e.target.checked })}
                              />
                            }
                            label="Text Shadow"
                          />

                          {stringEl.text_shadow && (
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <TextField
                                  label="Shadow X"
                                  type="number"
                                  value={stringEl.shadow_offset_x}
                                  onChange={(e) => updateStringElement(selectedElement.id, stringEl.id, { shadow_offset_x: parseInt(e.target.value) })}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="Shadow Y"
                                  type="number"
                                  value={stringEl.shadow_offset_y}
                                  onChange={(e) => updateStringElement(selectedElement.id, stringEl.id, { shadow_offset_y: parseInt(e.target.value) })}
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                          )}
                        </Stack>
                      ))}
                    </>
                  )}

                  {/* Image-specific properties */}
                  {selectedElement.type === 'image' && (
                    <>
                      <Divider />
                      <Typography variant="subtitle2">Image Properties</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            label="Width"
                            type="number"
                            value={selectedElement.width}
                            onChange={(e) => updateElement(selectedElement.id, { width: parseFloat(e.target.value) })}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Height"
                            type="number"
                            value={selectedElement.height}
                            onChange={(e) => updateElement(selectedElement.id, { height: parseFloat(e.target.value) })}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select an element to edit its properties
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Element List */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Elements
              </Typography>
              <Stack spacing={1}>
                {elements.map((element) => (
                  <Box
                    key={element.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      border: selectedElement?.id === element.id ? '2px solid #1976d2' : '1px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: selectedElement?.id === element.id ? '#f3f6ff' : 'transparent'
                    }}
                    onClick={() => setSelectedElement(element)}
                  >
                    <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        {element.content_key || `${element.type} element`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {element.type} • {element.visible ? 'Visible' : 'Hidden'}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleElementVisibility(element.id);
                      }}
                    >
                      {element.visible ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onSave(elements)}>
          Save Changes
        </Button>
      </Box>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onClose={() => setShowColorPicker(false)}>
        <DialogTitle>Choose Color</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {/* Simple color picker - you can enhance this with a proper color picker library */}
            <Grid container spacing={1}>
              {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                <Grid item key={color}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: color,
                      border: '2px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => handleColorChange(color)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowColorPicker(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;
