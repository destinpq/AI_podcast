'use client';

import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { useState } from 'react';

export default function WebinarsPage() {
  const [webinars] = useState([
    {
      title: 'AI Podcast Production Best Practices',
      description: 'Join us for an in-depth discussion on creating professional AI-powered podcasts',
      date: '2024-04-15',
      time: '2:00 PM EST',
      status: 'Upcoming',
    },
    {
      title: 'Maximizing Content Research with AI',
      description: 'Learn advanced techniques for content research using our AI tools',
      date: '2024-04-22',
      time: '3:00 PM EST',
      status: 'Upcoming',
    },
    {
      title: 'Voice Generation Masterclass',
      description: 'Master the art of AI voice generation for your podcasts',
      date: '2024-03-20',
      time: '2:00 PM EST',
      status: 'Recorded',
    },
  ]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Webinars
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Join our live webinars or watch recorded sessions to enhance your podcasting skills.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {webinars.map((webinar, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {webinar.title}
                  </Typography>
                  <Chip 
                    label={webinar.status} 
                    color={webinar.status === 'Upcoming' ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {webinar.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {webinar.date}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Time: {webinar.time}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  {webinar.status === 'Upcoming' ? 'Register Now' : 'Watch Recording'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 