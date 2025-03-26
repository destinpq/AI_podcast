'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function ScriptGenerator() {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        AI Script Generator
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          The AI Script Generator feature is currently being deployed. 
          Please check back soon for the complete functionality.
        </Typography>
      </Paper>
    </Box>
  );
} 