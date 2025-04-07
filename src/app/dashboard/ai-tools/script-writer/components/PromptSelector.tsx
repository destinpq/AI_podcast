'use client';

import React from 'react';
import {
  Box,
  Typography,
  // Removed unused MUI components
  // Card,
  // CardContent,
  // Button,
  // Grid,
  // CircularProgress,
} from '@mui/material';

// Removed unused PromptSelectorProps interface

export default function PromptSelector() {
  // Removed unused state
  // const [selectedStyle, setSelectedStyle] = React.useState<string>('expert');
  // const [selectedFormat, setSelectedFormat] = React.useState<string>('interview');
  // const [customRequirements, setCustomRequirements] = React.useState<string>('');
  // const [loading, setLoading] = React.useState(false);

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Select Content Style & Format (Step Removed/Needs Update)
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This step is currently being refactored. Prompt generation now happens in the previous step.
      </Typography>
      {/* UI elements removed for now */}
    </Box>
  );
} 