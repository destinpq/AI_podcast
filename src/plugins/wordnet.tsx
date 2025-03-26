'use client';

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { TrendingContent } from '@/types/trends';

interface WordnetPluginProps {
  topic: string;
  onTrendsSelected?: (trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => void;
}

export const WordnetPlugin = ({ topic, onTrendsSelected }: WordnetPluginProps) => {
  useEffect(() => {
    // This is a placeholder for actual API calls
    // In a real implementation, this would fetch real trend data
    
    if (topic && onTrendsSelected) {
      // Simulate data loading with empty data
      onTrendsSelected({
        news: [],
        discussions: [],
        relatedQueries: []
      });
    }
  }, [topic, onTrendsSelected]);
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2">
        Analyzing related topics for &quot;{topic}&quot;...
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    </Box>
  );
}; 