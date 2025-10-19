import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Link as LinkIcon,
  SportsCricket as CricketIcon,
  SportsSoccer as FootballIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import Papa from 'papaparse';

const BulkFixtureImport = ({ open, onClose, onFixturesImported }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // FA Fulltime integration
  const [faUrl, setFaUrl] = useState('');
  const [faLoading, setFaLoading] = useState(false);
  
  // Play Cricket integration
  const [cricketUrl, setCricketUrl] = useState('');
  const [cricketLoading, setCricketLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setError(null);
      
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
            return;
          }
          setCsvData(results.data);
          setSuccess(`Successfully parsed ${results.data.length} fixtures from CSV`);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    } else {
      setError('Please select a valid CSV file');
    }
  }, []);

  const handleCSVImport = async () => {
    if (csvData.length === 0) {
      setError('No data to import');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const fixtures = csvData.map(row => ({
        match_type: row.match_type || 'League',
        opponent: row.opponent || '',
        date: row.date || '',
        time: row.time || '',
        venue: row.venue || 'Home',
        competition: row.competition || '',
        notes: row.notes || ''
      }));

      // Import fixtures in batches
      const batchSize = 5;
      for (let i = 0; i < fixtures.length; i += batchSize) {
        const batch = fixtures.slice(i, i + batchSize);
        await Promise.all(
          batch.map(fixture => 
            fetch('https://matchgen-backend-production.up.railway.app/api/content/matches/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(fixture)
            })
          )
        );
      }

      setSuccess(`Successfully imported ${fixtures.length} fixtures`);
      onFixturesImported();
    } catch (error) {
      setError(`Failed to import fixtures: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFAImport = async () => {
    if (!faUrl) {
      setError('Please enter a valid FA Fulltime URL');
      return;
    }

    setFaLoading(true);
    try {
      // This would need backend implementation to scrape FA Fulltime
      const response = await fetch('/api/fixtures/import-fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ url: faUrl })
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Successfully imported ${result.count} fixtures from FA Fulltime`);
        onFixturesImported();
      } else {
        throw new Error('Failed to import from FA Fulltime');
      }
    } catch (error) {
      setError(`Failed to import from FA Fulltime: ${error.message}`);
    } finally {
      setFaLoading(false);
    }
  };

  const handleCricketImport = async () => {
    if (!cricketUrl) {
      setError('Please enter a valid Play Cricket URL');
      return;
    }

    setCricketLoading(true);
    try {
      // This would need backend implementation to use Play Cricket API
      const response = await fetch('/api/fixtures/import-cricket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ url: cricketUrl })
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Successfully imported ${result.count} fixtures from Play Cricket`);
        onFixturesImported();
      } else {
        throw new Error('Failed to import from Play Cricket');
      }
    } catch (error) {
      setError(`Failed to import from Play Cricket: ${error.message}`);
    } finally {
      setCricketLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const template = [
      {
        match_type: 'League',
        opponent: 'Example Team',
        date: '2024-01-15',
        time: '15:00',
        venue: 'Home',
        competition: 'Premier League',
        notes: 'Example fixture'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fixture_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Bulk Import Fixtures</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="CSV Upload" icon={<CloudUploadIcon />} />
          <Tab label="FA Fulltime" icon={<FootballIcon />} />
          <Tab label="Play Cricket" icon={<CricketIcon />} />
        </Tabs>

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

        {/* CSV Upload Tab */}
        {activeTab === 0 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                CSV Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a CSV file with your fixtures. Download the template below to see the required format.
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadCSVTemplate}
                >
                  Download Template
                </Button>
                <Tooltip title="CSV should include columns: match_type, opponent, date, time, venue, competition, notes">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Choose CSV File
                </Button>
              </label>

              {csvFile && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${csvFile.name} (${csvData.length} fixtures)`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Paper>

            {csvData.length > 0 && (
              <Button
                variant="contained"
                onClick={handleCSVImport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                fullWidth
              >
                {loading ? 'Importing...' : `Import ${csvData.length} Fixtures`}
              </Button>
            )}
          </Box>
        )}

        {/* FA Fulltime Tab */}
        {activeTab === 1 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                FA Fulltime Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Import fixtures directly from your team's FA Fulltime page.
              </Typography>

              <TextField
                fullWidth
                label="FA Fulltime Team URL"
                placeholder="https://fulltime.thefa.com/displayTeam.html?id=562720767"
                value={faUrl}
                onChange={(e) => setFaUrl(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>How to get your URL:</strong><br />
                  1. Go to your team's page on FA Fulltime<br />
                  2. Copy the URL from your browser<br />
                  3. Paste it above
                </Typography>
              </Alert>
            </Paper>

            <Button
              variant="contained"
              onClick={handleFAImport}
              disabled={faLoading || !faUrl}
              startIcon={faLoading ? <CircularProgress size={20} /> : <LinkIcon />}
              fullWidth
            >
              {faLoading ? 'Importing from FA Fulltime...' : 'Import from FA Fulltime'}
            </Button>
          </Box>
        )}

        {/* Play Cricket Tab */}
        {activeTab === 2 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Play Cricket Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Import fixtures from your club's Play Cricket page.
              </Typography>

              <TextField
                fullWidth
                label="Play Cricket Club URL"
                placeholder="https://play-cricket.ecb.co.uk/website/web_pages/123456"
                value={cricketUrl}
                onChange={(e) => setCricketUrl(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>How to get your URL:</strong><br />
                  1. Go to your club's page on Play Cricket<br />
                  2. Copy the URL from your browser<br />
                  3. Paste it above
                </Typography>
              </Alert>
            </Paper>

            <Button
              variant="contained"
              onClick={handleCricketImport}
              disabled={cricketLoading || !cricketUrl}
              startIcon={cricketLoading ? <CircularProgress size={20} /> : <CricketIcon />}
              fullWidth
            >
              {cricketLoading ? 'Importing from Play Cricket...' : 'Import from Play Cricket'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkFixtureImport;
