import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Divider
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  ColorLens,
  FormatBold,
  FormatItalic
} from '@mui/icons-material';
import axios from 'axios';

const QuickTextPositioner = ({ templateId, onSave, onCancel }) => {
  const [template, setTemplate] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const canvasRef = useRef(null);

  // Load template data
  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/graphicpack/template/${templateId}/edit/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplate(response.data);
      setElements(response.data.elements || []);
      if (response.data.elements?.length > 0) {
        setSelectedElement(response.data.elements[0]);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setError('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  // Render preview
  useEffect(() => {
    if (template && elements.length > 0) {
      renderPreview();
    }
  }, [template, elements]);

  const renderPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 400;
    const height = 300;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
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
      }
    });
  };

  const drawTextElement = (ctx, element) => {
    const stringElement = element.string_elements?.[0];
    if (!stringElement) return;

    // Scale positions for preview
    const scaleX = 400 / 800;
    const scaleY = 300 / 600;
    
    let x = element.x * scaleX;
    let y = element.y * scaleY;
    
    if (element.use_percentage) {
      x = (element.x / 100) * 400;
      y = (element.y / 100) * 300;
    }

    // Set font
    const fontSize = (stringElement.font_size || 24) * Math.min(scaleX, scaleY);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = stringElement.color || '#FFFFFF';
    ctx.textAlign = stringElement.alignment || 'left';

    // Draw text
    const text = stringElement.content_key || 'Sample Text';
    ctx.fillText(text, x, y);

    // Draw selection indicator
    if (selectedElement?.id === element.id) {
      ctx.strokeStyle = '#1976d2';
      ctx.lineWidth = 2;
      const bbox = ctx.measureText(text);
      ctx.strokeRect(x - 5, y - fontSize - 5, bbox.width + 10, fontSize + 10);
    }
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(`/api/graphicpack/template/${templateId}/edit/`, {
        elements: elements
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onSave) {
        onSave(elements);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Typography>Loading template...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Quick Text Positioner</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Preview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preview
                </Typography>
                <Box sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  p: 2
                }}>
                  <canvas
                    ref={canvasRef}
                    style={{ 
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Preview shows scaled version of your template
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Controls */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Text Elements
                </Typography>
                
                {elements.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No text elements found in this template
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {/* Element Selector */}
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Text Element</InputLabel>
                      <Select
                        value={selectedElement?.id || ''}
                        onChange={(e) => {
                          const element = elements.find(el => el.id === e.target.value);
                          setSelectedElement(element);
                        }}
                        label="Select Text Element"
                      >
                        {elements.filter(el => el.type === 'text').map((element) => (
                          <MenuItem key={element.id} value={element.id}>
                            {element.content_key || `${element.type} element`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedElement && (
                      <>
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
                        
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            X Position: {Math.round(selectedElement.x)}
                          </Typography>
                          <Slider
                            value={selectedElement.x}
                            onChange={(e, value) => updateElement(selectedElement.id, { x: value })}
                            min={0}
                            max={800}
                            step={1}
                            size="small"
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Y Position: {Math.round(selectedElement.y)}
                          </Typography>
                          <Slider
                            value={selectedElement.y}
                            onChange={(e, value) => updateElement(selectedElement.id, { y: value })}
                            min={0}
                            max={600}
                            step={1}
                            size="small"
                          />
                        </Box>

                        {/* Text Styling */}
                        {selectedElement.string_elements?.[0] && (
                          <>
                            <Divider />
                            <Typography variant="subtitle2">Text Styling</Typography>
                            
                            {selectedElement.string_elements.map((stringEl, index) => (
                              <Stack key={stringEl.id || index} spacing={2}>
                                <Box>
                                  <Typography variant="body2" gutterBottom>
                                    Font Size: {stringEl.font_size}
                                  </Typography>
                                  <Slider
                                    value={stringEl.font_size || 24}
                                    onChange={(e, value) => updateStringElement(selectedElement.id, stringEl.id, { font_size: value })}
                                    min={8}
                                    max={72}
                                    step={1}
                                    size="small"
                                  />
                                </Box>

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
                                    onClick={() => {
                                      setColorPickerTarget({ elementId: selectedElement.id, stringId: stringEl.id, field: 'color' });
                                      setShowColorPicker(true);
                                    }}
                                    sx={{ 
                                      backgroundColor: stringEl.color,
                                      color: stringEl.color === '#FFFFFF' ? '#000' : '#fff',
                                      '&:hover': { backgroundColor: stringEl.color }
                                    }}
                                  >
                                    {stringEl.color}
                                  </Button>
                                </Box>
                              </Stack>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          startIcon={<Save />}
          disabled={saving}
          variant="contained"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onClose={() => setShowColorPicker(false)}>
        <DialogTitle>Choose Color</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB'].map((color) => (
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
                    onClick={() => {
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
                    }}
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
    </Dialog>
  );
};

export default QuickTextPositioner;
