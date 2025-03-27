'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import PromptTemplates from '../components/PromptTemplates';

export default function PromptTemplatesPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </Link>
          <Link href="/dashboard/ai-tools/script-writer" color="inherit" underline="hover">
            Script Writer
          </Link>
          <Typography color="text.primary">Prompt Templates</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          AI Prompt Templates
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Use these ready-made prompt templates to generate different types of content for your podcast scripts.
        </Typography>
        
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <PromptTemplates />
        </Paper>
      </Container>
    </Box>
  );
} 