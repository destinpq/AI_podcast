'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import SaveScriptButton from '@/components/SaveScriptButton';

// Define a local interface that matches SaveScriptButton's expectation
interface PodcastOutline {
  intro?: string;
  topics?: string[];
  conclusion?: string;
  [key: string]: string | string[] | undefined;
}

export default function TempScriptWriter() {
  const [topic] = useState('Sample Topic');
  const [script] = useState('This is a sample script.');
  const userId = 'demo-user';
  
  // Simple outline with the correct structure
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