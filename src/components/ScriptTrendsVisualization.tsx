'use client';

import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { TrendingContent } from '../types/trends';

interface ScriptTrendsVisualizationProps {
  topic: string;
  trendsData: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  };
  loading?: boolean;
  error?: string | null;
}

/**
 * A simplified version of TrendsWordnet specifically for the Script Writer
 */
export default function ScriptTrendsVisualization({ 
  topic, 
  trendsData, 
  loading = false,
  error = null
}: ScriptTrendsVisualizationProps) {
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Trending Topics for &quot;{topic}&quot;
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            News
          </Typography>
          <List dense>
            {trendsData.news.slice(0, 5).map((item, index) => (
              <ListItem key={index} divider={index !== Math.min(4, trendsData.news.length - 1)}>
                <ListItemText 
                  primary={item.title} 
                  secondary={item.source}
                  primaryTypographyProps={{
                    variant: 'body2',
                    style: { fontWeight: 500 }
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Discussions
          </Typography>
          <List dense>
            {trendsData.discussions.slice(0, 5).map((item, index) => (
              <ListItem key={index} divider={index !== Math.min(4, trendsData.discussions.length - 1)}>
                <ListItemText 
                  primary={item.title} 
                  secondary={item.source}
                  primaryTypographyProps={{
                    variant: 'body2',
                    style: { fontWeight: 500 }
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Related Queries
          </Typography>
          <List dense>
            {trendsData.relatedQueries.slice(0, 5).map((query, index) => (
              <ListItem key={index} divider={index !== Math.min(4, trendsData.relatedQueries.length - 1)}>
                <ListItemText 
                  primary={query}
                  primaryTypographyProps={{
                    variant: 'body2',
                    style: { fontWeight: 500 }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
} 