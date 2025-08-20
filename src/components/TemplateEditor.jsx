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
  Switch,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Slider,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  TextFields,
  Save,
  Cancel,
  Preview,
  Download,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Undo,
  Redo
} from '@mui/icons-material';
import axios from 'axios';

const TemplateEditor = ({ templateId, onSave, onCancel }) => {
  const [template, setTemplate] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [canvasRef] = useState(useRef(null));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
      addToHistory(response.data.elements || []);
    } catch (error) {
      console.error('Error loading template:', error);
      setError('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newElements));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(history[newIndex]));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(history[newIndex]));
    }
  };

  // Render preview
  useEffect(() => {
    if (template && elements.length > 0) {
      renderPreview();
    }
  }, [template, elements, zoom]);

  const renderPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 800 * zoom;
    const height = 600 * zoom;

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
      } else if (element.type === 'image') {
        drawImageElement(ctx, element);
      }
    });
  };

  const drawTextElement = (ctx, element) => {
    const stringElement = element.string_elements?.[0];
    if (!stringElement) return;

    // Calculate position
    let x = element.x * zoom;
    let y = element.y * zoom;
    
    if (element.use_percentage) {
      x = (x / 100) * 800 * zoom;
      y = (y / 100) * 600 * zoom;
    }

    // Set font
    const fontSize = (stringElement.font_size || 24) * zoom;
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
      
      // Draw resize handles
      const handleSize = 8;
      ctx.fillStyle = '#1976d2';
      ctx.fillRect(x - handleSize/2, y - fontSize - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + bbox.width - handleSize/2, y - fontSize - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + bbox.width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    }
  };

  const drawImageElement = (ctx, element) => {
    let x = element.x * zoom;
    let y = element.y * zoom;
    
    if (element.use_percentage) {
      x = (x / 100) * 800 * zoom;
      y = (y / 100) * 600 * zoom;
    }

    const width = (element.width || 100) * zoom;
    const height = (element.height || 100) * zoom;

    // Draw placeholder rectangle
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(x, y, width, height);

    // Draw selection indicator
    if (selectedElement?.id === element.id) {
      ctx.strokeStyle = '#1976d2';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
      
      // Draw resize handles
      const handleSize = 8;
      ctx.fillStyle = '#1976d2';
      ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    }
  };

  const handleCanvasClick = (event) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

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

  const handleMouseDown = (event) => {
    if (!selectedElement) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    
    setDragStart({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !selectedElement) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    updateElement(selectedElement.id, {
      x: selectedElement.x + deltaX,
      y: selectedElement.y + deltaY
    });
    
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      addToHistory(elements);
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

  const handleTestGeneration = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/api/graphicpack/generate/', {
        content_type: template?.content_type,
        match_id: 1, // Use a test match ID
        test_mode: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.url) {
        setPreviewUrl(response.data.url);
      }
    } catch (error) {
      console.error('Error testing generation:', error);
      setError('Failed to test template generation');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Template Editor - {template?.template_name}
      </Typography>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Undo">
            <IconButton onClick={undo} disabled={historyIndex <= 0}>
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem />
          
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton onClick={handleResetZoom}>
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
          
          <Typography variant="body2" sx={{ ml: 2 }}>
            {Math.round(zoom * 100)}%
          </Typography>
          
          <Divider orientation="vertical" flexItem />
          
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={handleTestGeneration}
            size="small"
          >
            Test Generation
          </Button>
          {previewUrl && (
            <Button
              variant="outlined"
              startIcon={<Download />}
              href={previewUrl}
              target="_blank"
              size="small"
            >
              Download
            </Button>
          )}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Preview Canvas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview (Click and drag elements to move them)
              </Typography>
              
              <Box sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 1, 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <canvas
                  ref={canvasRef}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    cursor: isDragging ? 'grabbing' : 'pointer',
                    maxHeight: '600px'
                  }}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                💡 Tip: Click on elements to select them, then drag to move. Use the controls on the right to adjust properties.
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
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) })}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Y"
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) })}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* Position Sliders */}
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
        <Button variant="outlined" onClick={onCancel} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          startIcon={<Save />}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

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
    </Box>
  );
};

export default TemplateEditor;
