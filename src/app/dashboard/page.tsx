'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import {
  AutoStories as AutoStoriesIcon,
  Podcasts as PodcastsIcon,
  Insights as InsightsIcon,
  Group as GroupIcon,
  LiveTv as LiveTvIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// Feature cards content
const features = [
  {
    title: 'Script Writer',
    description: 'Create podcast scripts',
    link: '/dashboard/ai-tools/script-writer',
  },
  {
    title: 'Research Generator',
    description: 'Generate research content',
    link: '/dashboard/ai-tools/research-generator',
  },
  {
    title: 'Saved Scripts',
    description: 'View saved scripts',
    link: '/dashboard/ai-tools/saved-scripts',
  },
  {
    title: 'Content Enhancer',
    description: 'Improve your content',
    link: '/dashboard/ai-tools/script',
  },
];

export default function DashboardPage() {
  const { user, loading, configError } = useAuth();
  const router = useRouter();
  
  // Demo mode flag - true enables access without login
  const isDemoMode = true;
  
  // Redirect to login if not authenticated and not in demo mode
  useEffect(() => {
    if (!loading && !user && !configError && !isDemoMode) {
      router.push('/');
    }
  }, [user, loading, router, configError, isDemoMode]);
  
  if (loading) {
    return <Box p={4}>Loading...</Box>;
  }
  
  if (!user && !configError && !isDemoMode) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        {/* Show configuration alerts */}
        {(configError || (isDemoMode && !user && !configError)) && (
          <Grid item xs={12}>
            {configError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  Firebase is not configured properly. Running in demo mode.
                </Typography>
                <Typography variant="body2">
                  Some features requiring authentication will be limited.
                </Typography>
              </Alert>
            )}
            
            {isDemoMode && !user && !configError && (
              <Alert severity="info">
                <Typography variant="body1" fontWeight="medium">
                  Running in demonstration mode
                </Typography>
                <Typography variant="body2">
                  This is a demo instance with limited functionality. Sign in for full access.
                </Typography>
              </Alert>
            )}
          </Grid>
        )}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              AI Tools
            </Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={6} key={index}>
                  <Card
                    component={Link}
                    href={feature.link}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InsightsIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Activity</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display.
              </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Team Collaboration</Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 1 }}
              >
                Invite Team Members
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LiveTvIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Upcoming Webinars</Typography>
              </Box>
              <Typography variant="body2">
                No upcoming webinars.
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth
                sx={{ mt: 2 }}
              >
                Browse Resources
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
} 