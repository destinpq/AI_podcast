'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface TrendData {
  title: string;
  traffic: string;
  articles: string[];
}

export default function ResearchGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!topic) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, get Google Trends data
      const trendsResponse = await fetch('/api/research/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!trendsResponse.ok) {
        throw new Error('Failed to fetch trends data');
      }

      const trendsData = await trendsResponse.json();
      setTrends(trendsData.trends);
      setSelectedTrends([]); // Reset selections when new trends are fetched
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (selectedTrends.length === 0) {
      setError('Please select at least one topic to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedTrendsData = trends.filter(trend => 
        selectedTrends.includes(trend.title)
      );

      const recommendationsResponse = await fetch('/api/research/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic,
          trends: selectedTrendsData
        }),
      });

      if (!recommendationsResponse.ok) {
        throw new Error('Failed to get recommendations');
      }

      const recommendationsData = await recommendationsResponse.json();
      setRecommendations(recommendationsData.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelection = (trendTitle: string) => {
    setSelectedTrends(prev => {
      if (prev.includes(trendTitle)) {
        return prev.filter(t => t !== trendTitle);
      } else {
        return [...prev, trendTitle];
      }
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Research Generator
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Enter your research topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Artificial Intelligence in Healthcare"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleResearch}
              disabled={loading || !topic}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? 'Searching...' : 'Search Topics'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {trends.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Topics to Analyze
          </Typography>
          <FormGroup>
            {trends.map((trend, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={selectedTrends.includes(trend.title)}
                    onChange={() => handleTrendSelection(trend.title)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{trend.title}</Typography>
                    <Chip 
                      label={`Traffic: ${trend.traffic}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                }
              />
            ))}
          </FormGroup>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGetRecommendations}
              disabled={loading || selectedTrends.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? 'Analyzing...' : 'Analyze Selected Topics'}
            </Button>
          </Box>
        </Paper>
      )}

      {recommendations && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            AI Recommendations
          </Typography>
          <Typography
            component="div"
            sx={{ whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{ __html: recommendations.replace(/\n/g, '<br />') }}
          />
        </Paper>
      )}

      {trends.length > 0 && (
        <Grid container spacing={3}>
          {trends.map((trend, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {trend.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Traffic: {trend.traffic}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Related Articles:
                  </Typography>
                  <List>
                    {trend.articles.map((article, articleIndex) => (
                      <ListItem key={articleIndex}>
                        <ListItemText primary={article} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 