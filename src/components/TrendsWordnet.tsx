import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { TrendingContent } from '../types/trends';

interface TrendsWordnetProps {
  topic: string;
  onTrendsSelected: (selectedTrends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => void;
}

export default function TrendsWordnet({ topic, onTrendsSelected }: TrendsWordnetProps) {
  const [trends, setTrends] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrends, setSelectedTrends] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }>({
    news: [],
    discussions: [],
    relatedQueries: [],
  });

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/research/trends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }

        const data = await response.json();
        setTrends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends');
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchTrends();
    }
  }, [topic]);

  const handleTrendSelect = (
    type: 'news' | 'discussions' | 'relatedQueries',
    item: TrendingContent | string,
    selected: boolean
  ) => {
    setSelectedTrends(prev => {
      const newSelected = { ...prev };
      if (selected) {
        if (type === 'relatedQueries') {
          newSelected[type] = [...prev[type], item as string];
        } else {
          newSelected[type] = [...prev[type], item as TrendingContent];
        }
      } else {
        if (type === 'relatedQueries') {
          newSelected[type] = prev[type].filter(q => q !== item);
        } else {
          newSelected[type] = prev[type].filter(
            t => (t as TrendingContent).title !== (item as TrendingContent).title
          );
        }
      }
      return newSelected;
    });
  };

  const handleProceed = () => {
    onTrendsSelected(selectedTrends);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!trends) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Latest Trends for &ldquo;{topic}&rdquo;
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          News Articles
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {trends.news.map((news) => (
            <Chip
              key={news.title}
              label={news.title}
              onClick={() => handleTrendSelect('news', news, !selectedTrends.news.some(n => n.title === news.title))}
              color={selectedTrends.news.some(n => n.title === news.title) ? 'primary' : 'default'}
              sx={{ maxWidth: '300px' }}
            />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Discussions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {trends.discussions.map((discussion) => (
            <Chip
              key={discussion.title}
              label={discussion.title}
              onClick={() => handleTrendSelect('discussions', discussion, !selectedTrends.discussions.some(d => d.title === discussion.title))}
              color={selectedTrends.discussions.some(d => d.title === discussion.title) ? 'primary' : 'default'}
              sx={{ maxWidth: '300px' }}
            />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Related Topics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {trends.relatedQueries.map((query) => (
            <Chip
              key={query}
              label={query}
              onClick={() => handleTrendSelect('relatedQueries', query, !selectedTrends.relatedQueries.includes(query))}
              color={selectedTrends.relatedQueries.includes(query) ? 'primary' : 'default'}
            />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Chip
          label="Proceed with Selected Trends"
          onClick={handleProceed}
          color="primary"
          variant="filled"
          disabled={
            selectedTrends.news.length === 0 &&
            selectedTrends.discussions.length === 0 &&
            selectedTrends.relatedQueries.length === 0
          }
        />
      </Box>
    </Box>
  );
} 