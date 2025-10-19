import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Link as LinkIcon,
  Preview as PreviewIcon,
  CloudDownload as ImportIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function FullTimeImport({ onImportSuccess, onClose }) {
  const [url, setUrl] = useState('');
  const [clubName, setClubName] = useState('');
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handlePreview = async () => {
    if (!url || !clubName) {
      setError('Please enter both URL and club name');
      return;
    }

    setLoading(true);
    setError(null);
    setFixtures([]);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/fulltime/preview/`,
        {
          competition_url: url,
          club_display_name: clubName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFixtures(response.data);
      setPreviewMode(true);
      setSuccess(`Found ${response.data.length} fixtures`);
    } catch (error) {
      console.error('Preview error:', error);
      const errorData = error.response?.data;
      
      if (errorData?.alternatives) {
        // Show enhanced error with alternatives
        setError(
          <Box>
            <Typography variant="body2" color="error" gutterBottom>
              {errorData.error}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {errorData.message}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Available Alternatives:
            </Typography>
            {errorData.alternatives.map((alt, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {alt.method}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alt.description}
                </Typography>
                <Typography variant="caption" color="primary" display="block">
                  {alt.benefits}
                </Typography>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {errorData.setup_required}
            </Typography>
          </Box>
        );
      } else {
        setError(errorData?.error || 'Failed to preview fixtures');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!url || !clubName) {
      setError('Please enter both URL and club name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/content/fixtures/import/fulltime/import/`,
        {
          competition_url: url,
          club_display_name: clubName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(
        `Successfully imported ${response.data.created} new fixtures and updated ${response.data.updated} existing fixtures`
      );
      
      if (onImportSuccess) {
        onImportSuccess(response.data);
      }
      
      // Reset form
      setUrl('');
      setClubName('');
      setFixtures([]);
      setPreviewMode(false);
    } catch (error) {
      console.error('Import error:', error);
      const errorData = error.response?.data;
      
      if (errorData?.alternatives) {
        // Show enhanced error with alternatives
        setError(
          <Box>
            <Typography variant="body2" color="error" gutterBottom>
              {errorData.error}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {errorData.message}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Available Alternatives:
            </Typography>
            {errorData.alternatives.map((alt, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {alt.method}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alt.description}
                </Typography>
                <Typography variant="caption" color="primary" display="block">
                  {alt.benefits}
                </Typography>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {errorData.setup_required}
            </Typography>
          </Box>
        );
      } else {
        setError(errorData?.error || 'Failed to import fixtures');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setClubName('');
    setFixtures([]);
    setError(null);
    setSuccess(null);
    setPreviewMode(false);
  };

  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getHomeAwayColor = (homeAway) => {
    switch (homeAway) {
      case 'H': return 'success';
      case 'A': return 'warning';
      default: return 'default';
    }
  };

  const getHomeAwayLabel = (homeAway) => {
    switch (homeAway) {
      case 'H': return 'Home';
      case 'A': return 'Away';
      default: return 'Unknown';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        FA Fulltime Import (Proxy Method)
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Import fixtures from FA Fulltime using our reliable proxy service with caching.
        This method is more stable than direct scraping.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> We use a Cloudflare Worker proxy to fetch and cache 
          FA Fulltime pages, avoiding timeout issues and providing better reliability.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="FA Fulltime Competition URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://fulltime.thefa.com/displayTeam.html?id=562720767"
            helperText="Paste your club's FA Fulltime team page URL"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Club Display Name"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Leafield Athletic Women"
            helperText="Enter your team name exactly as it appears on the FA Fulltime page"
          />
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handlePreview}
            disabled={!url || !clubName || loading}
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <PreviewIcon />}
            sx={{ mr: 1 }}
          >
            {loading ? 'Loading...' : 'Preview Fixtures'}
          </Button>
          
          {fixtures.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={loading}
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <ImportIcon />}
              sx={{ mr: 1 }}
            >
              {loading ? 'Importing...' : 'Import Fixtures'}
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            variant="text"
            disabled={loading}
          >
            Reset
          </Button>
        </CardActions>
      </Card>

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

      {fixtures.length > 0 && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SuccessIcon color="success" />
              <Typography variant="h6">
                Preview: {fixtures.length} Fixtures Found
              </Typography>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Home Team</TableCell>
                    <TableCell>Away Team</TableCell>
                    <TableCell>H/A</TableCell>
                    <TableCell>Opponent</TableCell>
                    <TableCell>Venue</TableCell>
                    <TableCell>Competition</TableCell>
                    <TableCell>Round</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fixtures.map((fixture, index) => (
                    <TableRow key={fixture.fixture_key || index}>
                      <TableCell>
                        {formatDateTime(fixture.kickoff_utc)}
                      </TableCell>
                      <TableCell>{fixture.home_team}</TableCell>
                      <TableCell>{fixture.away_team}</TableCell>
                      <TableCell>
                        <Chip
                          label={getHomeAwayLabel(fixture.home_away)}
                          color={getHomeAwayColor(fixture.home_away)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{fixture.opponent_name}</TableCell>
                      <TableCell>{fixture.venue}</TableCell>
                      <TableCell>{fixture.competition}</TableCell>
                      <TableCell>{fixture.round_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Box mt={3}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Benefits of Proxy Method:</strong>
        </Typography>
        <ul>
          <li>✅ Reliable caching (3-hour cache)</li>
          <li>✅ No timeout issues</li>
          <li>✅ CORS support for web requests</li>
          <li>✅ Automatic retry logic</li>
          <li>✅ Better error handling</li>
        </ul>
      </Box>
    </Box>
  );
}
