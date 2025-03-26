'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaveScriptButton from '@/components/SaveScriptButton';
import { PodcastOutline } from '@/services/podcastService';

export default function TempScriptWriter() {
  const [topic] = useState('Sample Topic');
  const [script] = useState('This is a sample script.');
  const userId = 'demo-user';
  
  // Simple outline that matches PodcastOutline structure
  const outline: PodcastOutline = {
    intro: 'Introduction',
    topics: ['Topic 1', 'Topic 2'],
    conclusion: 'Conclusion'
  };
  
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Script Writer (Temporary Version)
      </Typography>
      
      <Typography paragraph>
        This is a simplified version of the script writer. The full version will be available soon.
      </Typography>
      
      <Box mt={4}>
        <SaveScriptButton 
          topic={topic}
          script={script}
          outline={outline}
          duration={30}
          memberCount={1}
          userId={userId}
        />
      </Box>
    </Box>
  );
} 