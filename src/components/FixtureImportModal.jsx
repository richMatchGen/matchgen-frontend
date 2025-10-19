import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Link as LinkIcon,
  SportsCricket as CricketIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import axios from 'axios';

const FixtureImportModal = ({ open, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importOptions, setImportOptions] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // CSV Upload state
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);

  // FA Fulltime state
  const [faUrl, setFaUrl] = useState('');

  // Play Cricket state
  const [teamId, setTeamId] = useState('');

  // AI Import state
  const [fixtureText, setFixtureText] = useState('');
  const [aiPreview, setAiPreview] = useState(null);

  useEffect(() => {
    if (open) {
      fetchImportOptions();
    }
  }, [open]);

  const fetchImportOptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import-options/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setImportOptions(response.data);
    } catch (error) {
      console.error('Error fetching import options:', error);
      setError('Failed to load import options');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleCsvFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      previewCsvFile(file);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const previewCsvFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').slice(0, 5); // Preview first 5 lines
      setCsvPreview(lines);
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const csvContent = `opponent,date,location,venue,time_start,match_type,home_away
Arsenal,15/03/2024,Emirates Stadium,Home,15:00,League,HOME
Chelsea,22/03/2024,Stamford Bridge,Away,17:30,League,AWAY
Manchester United,29/03/2024,Old Trafford,Away,14:00,League,AWAY`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fixtures_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/csv/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(`Successfully imported ${response.data.created.length} fixtures`);
      onImportSuccess && onImportSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('CSV import error:', error);
      setError(error.response?.data?.error || 'Failed to import fixtures');
    } finally {
      setLoading(false);
    }
  };

  const handleFaImport = async () => {
    if (!faUrl) {
      setError('Please enter a valid FA Fulltime URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/fa-fulltime/`,
        { fa_url: faUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Successfully imported ${response.data.created.length} fixtures from FA Fulltime`);
      onImportSuccess && onImportSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('FA import error:', error);
      setError(error.response?.data?.error || 'Failed to import fixtures from FA Fulltime');
    } finally {
      setLoading(false);
    }
  };

  const handleCricketImport = async () => {
    if (!teamId) {
      setError('Please enter a valid Play Cricket team ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/play-cricket/`,
        { team_id: teamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Successfully imported ${response.data.created.length} fixtures from Play Cricket`);
      onImportSuccess && onImportSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('Cricket import error:', error);
      setError(error.response?.data?.error || 'Failed to import fixtures from Play Cricket');
    } finally {
      setLoading(false);
    }
  };

  const handleAITest = async () => {
    if (!fixtureText.trim()) {
      setError('Please enter fixture text to test');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/ai/test/`,
        { fixture_text: fixtureText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiPreview(response.data.fixtures);
      setSuccess(`AI found ${response.data.fixtures_found} fixtures`);
    } catch (error) {
      console.error('AI test error:', error);
      setError(error.response?.data?.error || 'Failed to test AI fixture parsing');
    } finally {
      setLoading(false);
    }
  };

  const handleAIImport = async () => {
    if (!fixtureText.trim()) {
      setError('Please enter fixture text to import');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/ai/`,
        { fixture_text: fixtureText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Successfully imported ${response.data.created.length} fixtures using AI`);
      onImportSuccess && onImportSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('AI import error:', error);
      setError(error.response?.data?.error || 'Failed to import fixtures using AI');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab(0);
    setCsvFile(null);
    setCsvPreview(null);
    setFaUrl('');
    setTeamId('');
    setFixtureText('');
    setAiPreview(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const renderCsvTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        CSV Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a CSV file with your fixture data. Download the template below for the correct format.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadCsvTemplate}
            >
              Download Template
            </Button>
            <Typography variant="body2" color="text.secondary">
              Required columns: opponent, date
            </Typography>
          </Box>

          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-input"
            type="file"
            onChange={handleCsvFileChange}
          />
          <label htmlFor="csv-file-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              {csvFile ? csvFile.name : 'Choose CSV File'}
            </Button>
          </label>

          {csvPreview && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                File Preview:
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {csvPreview.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button
            onClick={handleCsvImport}
            disabled={!csvFile || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {loading ? 'Importing...' : 'Import Fixtures'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderFaTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        FA Fulltime Scraper
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Automatically import fixtures from your club's FA Fulltime page.
      </Typography>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="FA Fulltime URL"
            value={faUrl}
            onChange={(e) => setFaUrl(e.target.value)}
            placeholder="https://fulltime.thefa.com/displayTeam.html?id=562720767"
            helperText="Paste your club's FA Fulltime team page URL"
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Find your club's FA Fulltime page and copy the URL. The scraper will automatically
              extract fixture information including dates, opponents, and venues.
            </Typography>
          </Alert>

          <Box display="flex" alignItems="center" gap={1}>
            <LinkIcon color="primary" />
            <Link
              href="https://fulltime.thefa.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit FA Fulltime
            </Link>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleFaImport}
            disabled={!faUrl || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
          >
            {loading ? 'Scraping...' : 'Import from FA Fulltime'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderCricketTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Play Cricket API
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Import fixtures from Play Cricket API for cricket clubs.
      </Typography>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="12345"
            helperText="Get your team ID from your Play Cricket club page URL"
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Find your team ID in your Play Cricket club page URL. The API will fetch
              all upcoming fixtures for your team.
            </Typography>
          </Alert>

          <Box display="flex" alignItems="center" gap={1}>
            <CricketIcon color="primary" />
            <Link
              href="https://play-cricket.ecb.co.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Play Cricket
            </Link>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleCricketImport}
            disabled={!teamId || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <CricketIcon />}
          >
            {loading ? 'Fetching...' : 'Import from Play Cricket'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderAITab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        AI-Powered Import
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Use AI to automatically parse fixture data from natural language text. 
        Simply paste or type your fixture information in any format.
      </Typography>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Fixture Text"
            value={fixtureText}
            onChange={(e) => setFixtureText(e.target.value)}
            placeholder="Arsenal vs Chelsea on 15/03/2024 at 15:00, Manchester United vs Liverpool on 22/03/2024 at Old Trafford, Tottenham vs Brighton on 29/03/2024 at 14:00"
            helperText="Enter fixture information in any format. AI will automatically extract dates, opponents, venues, and times."
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Examples of supported formats:</strong><br/>
              • "Arsenal vs Chelsea on 15/03/2024 at 15:00"<br/>
              • "Manchester United vs Liverpool, 22/03/2024, Old Trafford"<br/>
              • "Tottenham vs Brighton, 29/03/2024, 14:00"<br/>
              • "Home: Arsenal, Away: Chelsea, Date: 15/03/2024, Time: 15:00"
            </Typography>
          </Alert>

          {aiPreview && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                AI Preview ({aiPreview.length} fixtures found):
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                {aiPreview.map((fixture, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'white', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {fixture.opponent} ({fixture.home_away})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fixture.date} at {fixture.time_start} - {fixture.venue}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <AIIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              Powered by OpenAI GPT-3.5 Turbo
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleAITest}
            disabled={!fixtureText.trim() || loading}
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
          >
            {loading ? 'Testing...' : 'Test AI Parsing'}
          </Button>
          <Button
            onClick={handleAIImport}
            disabled={!fixtureText.trim() || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
          >
            {loading ? 'Importing...' : 'Import with AI'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Import Fixtures</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              label="CSV Upload"
              icon={<UploadIcon />}
              iconPosition="start"
            />
            <Tab
              label="FA Fulltime"
              icon={<LinkIcon />}
              iconPosition="start"
            />
            <Tab
              label="Play Cricket"
              icon={<CricketIcon />}
              iconPosition="start"
            />
            <Tab
              label="AI Import"
              icon={<AIIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {activeTab === 0 && renderCsvTab()}
        {activeTab === 1 && renderFaTab()}
        {activeTab === 2 && renderCricketTab()}
        {activeTab === 3 && renderAITab()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FixtureImportModal;
