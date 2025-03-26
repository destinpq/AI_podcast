'use client';

import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useState } from 'react';

export default function TutorialsPage() {
  const [tutorials] = useState([
    {
      title: 'Getting Started with AI Podcast',
      description: 'Learn the basics of creating your first AI-powered podcast',
      duration: '10 min',
    },
    {
      title: 'Advanced Script Writing',
      description: 'Master the art of crafting engaging podcast scripts',
      duration: '15 min',
    },
    {
      title: 'Research Tools Deep Dive',
      description: 'Explore our powerful research tools for better content',
      duration: '12 min',
    },
  ]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tutorials
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Learn how to make the most of our AI podcast tools with these step-by-step tutorials.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {tutorials.map((tutorial, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {tutorial.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {tutorial.description}
                </Typography>
                <Typography variant="caption" color="primary">
                  Duration: {tutorial.duration}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 