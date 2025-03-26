'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid, useTheme, Alert, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SavedScripts from '@/components/SavedScripts';
import { useAuth } from '@/providers/AuthProvider';
import { saveScript } from '@/services/podcastService';

export default function SavedScriptsPage() {
  const { user, loading: authLoading } = useAuth();
  const theme = useTheme();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to create a sample script
  const createSampleScript = async () => {
    if (!user) return;
    
    setCreating(true);
    setError(null);
    
    try {
      const sampleScript = {
        title: "Sample Podcast Script",
        topic: "Introduction to Podcasting",
        script: "Welcome to your first podcast script! This is a sample script to help you get started with the AI Podcast Studio platform.\n\nIn this episode, we'll discuss the basics of podcasting and how to create engaging content for your audience.\n\nLet's get started!",
        outline: {
          intro: "Welcome and introduction",
          topics: [
            "Why podcasting is popular",
            "Equipment needed to start",
            "Content planning tips"
          ],
          conclusion: "Call to action and next steps"
        },
        duration: 15,
        memberCount: 1,
        userId: user.uid
      };
      
      await saveScript(sampleScript);
      window.location.reload(); // Reload to show the new script
    } catch (err) {
      console.error('Error creating sample script:', err);
      setError('Failed to create sample script. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please sign in to view your saved scripts.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}>
          My Podcast Scripts
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={createSampleScript}
          disabled={creating}
          sx={{ borderRadius: 2 }}
        >
          {creating ? 'Creating...' : 'Create Sample Script'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, mb: 4 }}>
            <Typography variant="body1" paragraph>
              View and manage your saved podcast scripts. You can also collaborate with team members
              by sharing scripts and adding notes.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> If you&apos;re seeing database index errors, this means the application is still setting up. 
              These indexes are typically created automatically the first time the app runs.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <SavedScripts userId={user.uid} />
        </Grid>
      </Grid>
    </Box>
  );
} 