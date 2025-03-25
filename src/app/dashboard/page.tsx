'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Science as ScienceIcon,
  Mic as MicIcon,
  AutoAwesome as AutoAwesomeIcon,
  School as SchoolIcon,
  LiveTv as LiveTvIcon
} from '@mui/icons-material';

export default function DashboardPage() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Welcome back!
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            href="/dashboard/my-projects/research-projects"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            New Research Project
          </Button>
          <Button
            component={Link}
            href="/dashboard/my-projects/podcast-projects"
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
          >
            New Podcast Project
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScienceIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Research Projects
                </Typography>
                <Typography variant="h4" color="primary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active projects
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MicIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Podcast Projects
                </Typography>
                <Typography variant="h4" color="success.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active projects
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, color: 'purple.main', mr: 2 }} />
              <Box>
                <Typography variant="h6" color="text.secondary">
                  AI Credits
                </Typography>
                <Typography variant="h4" color="purple.main">
                  1000
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Remaining credits
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <Typography color="text.secondary">
          No recent activity to show
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
              AI Tools
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card
                  component={Link}
                  href="/dashboard/ai-tools/research-generator"
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Research Generator
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate research content
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  component={Link}
                  href="/dashboard/ai-tools/script-writer"
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Script Writer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create podcast scripts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  component={Link}
                  href="/dashboard/ai-tools/voice-generator"
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Voice Generator
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate AI voices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  component={Link}
                  href="/dashboard/ai-tools/content-enhancer"
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Content Enhancer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Improve your content
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
              Learning Resources
            </Typography>
            <Stack spacing={2}>
              <Card
                component={Link}
                href="/dashboard/learning-hub/tutorials"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Tutorials
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Learn how to use our tools
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card
                component={Link}
                href="/dashboard/learning-hub/webinars"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LiveTvIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Webinars
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Watch live training sessions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 