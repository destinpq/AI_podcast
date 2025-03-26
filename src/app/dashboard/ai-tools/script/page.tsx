'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Paper,
  Alert,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  Divider,
  Chip,
  Stack,
  useTheme,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { TrendingContent } from '@/types/trends';
import { WordnetPlugin } from '@/plugins/wordnet';
import CircularWordnet from '@/components/CircularWordnet';

export default function ScriptGenerator() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [selectedTrends, setSelectedTrends] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }>({
    news: [],
    discussions: [],
    relatedQueries: [],
  });
  const [duration, setDuration] = useState(30);
  const [members, setMembers] = useState('Solo');
  const [showCircularWordnet, setShowCircularWordnet] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setTopic('');
    setScript(null);
    setSelectedTrends({
      news: [],
      discussions: [],
      relatedQueries: [],
    });
    setActiveStep(0);
  };

  const handleTrendsSelected = (trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => {
    setSelectedTrends(trends);
    handleNext();
  };

  const handleGenerateScript = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outline: {
            topic,
            duration,
            members,
          },
          selectedPoints: selectedTrends,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setScript(data.script);
      handleNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (script) {
      navigator.clipboard.writeText(script);
    }
  };

  // Define flow cards for navigation
  const flowCards = [
    {
      title: "Enter Topic",
      icon: <EditNoteIcon fontSize="large" />,
      color: theme.palette.primary.main,
      active: activeStep === 0,
      completed: activeStep > 0,
    },
    {
      title: "Select Trends",
      icon: <TrendingUpIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      active: activeStep === 1,
      completed: activeStep > 1,
    },
    {
      title: "Generate Script",
      icon: <AutoStoriesIcon fontSize="large" />,
      color: theme.palette.success.main,
      active: activeStep === 2,
      completed: activeStep > 2,
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header with title and reset button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          AI Script Writer
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleReset}
          size="small"
        >
          Reset
        </Button>
      </Box>
      
      {/* Flow cards for navigation */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ mb: 4 }}
        justifyContent="center"
      >
        {flowCards.map((card, index) => (
          <Card 
            key={index}
            sx={{ 
              width: { xs: '100%', sm: 0 },
              flexGrow: 1,
              height: 100,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: card.active || card.completed ? 'pointer' : 'default',
              bgcolor: card.active ? `${card.color}15` : 'background.paper',
              borderLeft: card.active ? `5px solid ${card.color}` : 'none',
              boxShadow: card.active ? 3 : 1,
              transition: 'all 0.3s ease',
              opacity: card.active || card.completed ? 1 : 0.6,
              '&:hover': {
                boxShadow: card.active || card.completed ? 4 : 1,
                opacity: 1,
              }
            }}
            onClick={() => {
              if (card.completed) {
                setActiveStep(index);
              }
            }}
          >
            <Box sx={{ color: card.color, mb: 1 }}>
              {card.icon}
            </Box>
            <Typography variant="subtitle1" align="center">
              {card.title}
            </Typography>
            {card.completed && !card.active && (
              <Chip 
                label="Completed" 
                size="small" 
                sx={{ 
                  mt: 1, 
                  bgcolor: `${card.color}20`, 
                  color: card.color,
                  fontSize: '0.7rem',
                  height: 20,
                }} 
              />
            )}
          </Card>
        ))}
      </Stack>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Step 1: Enter topic */}
      {activeStep === 0 && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardHeader 
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <EditNoteIcon />
              </Avatar>
            }
            title="What's your podcast about?"
            subheader="Enter a topic to get started"
            action={
              topic.trim() && (
                <Button 
                  variant="contained" 
                  onClick={() => setShowCircularWordnet(true)}
                  startIcon={<TrendingUpIcon />}
                  size="medium"
                  color="primary"
                  sx={{ 
                    mt: 1,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  View Visualization
                </Button>
              )
            }
          />
          <CardContent>
            <TextField
              fullWidth
              placeholder="Enter your podcast topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Duration
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as number)}
                  >
                    <MenuItem value={10}>10 minutes</MenuItem>
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Members
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={members}
                    onChange={(e) => setMembers(e.target.value as string)}
                  >
                    <MenuItem value="Solo">Solo</MenuItem>
                    <MenuItem value="Two Hosts">Two Hosts</MenuItem>
                    <MenuItem value="Host and Guest">Host and Guest</MenuItem>
                    <MenuItem value="Panel">Panel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {topic.trim() && (
              <Box sx={{ 
                mt: 4, 
                mb: 2, 
                border: '1px solid',
                borderColor: theme.palette.primary.light,
                borderRadius: 2,
                p: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                bgcolor: 'background.paper',
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  Trending Topics for &ldquo;{topic}&rdquo;
                </Typography>
                <WordnetPlugin topic={topic} onTrendsSelected={handleTrendsSelected} />
              </Box>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={!topic.trim()}
              endIcon={<TrendingUpIcon />}
              color="primary"
            >
              Next
            </Button>
          </CardActions>
        </Card>
      )}
      
      {/* Step 2: Select trends */}
      {activeStep === 1 && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardHeader 
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                <TrendingUpIcon />
              </Avatar>
            }
            title={`Trending Topics for "${topic}"`}
            subheader="Select trends to include in your script"
            action={
              <Button 
                variant="contained" 
                startIcon={<TrendingUpIcon />}
                onClick={() => setShowCircularWordnet(true)}
                sx={{ mt: 1 }}
                color="secondary"
              >
                View Visualization
              </Button>
            }
          />
          <CardContent>
            {topic && (
              <WordnetPlugin topic={topic} onTrendsSelected={handleTrendsSelected} />
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGenerateScript}
              disabled={loading}
              color="secondary"
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoStoriesIcon />}
            >
              {loading ? 'Generating...' : 'Generate Script'}
            </Button>
          </CardActions>
          {loading && <LinearProgress color="secondary" />}
        </Card>
      )}
      
      {/* Step 3: Generated script */}
      {activeStep === 2 && (
        <Card elevation={3}>
          <CardHeader 
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                <AutoStoriesIcon />
              </Avatar>
            }
            title="Your Script is Ready!"
            subheader={`${duration}-minute ${members} podcast script on "${topic}"`}
            action={
              <Tooltip title="Copy to clipboard">
                <IconButton onClick={handleCopyScript} color="primary">
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent>
            {error ? (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  minHeight: '300px',
                  maxHeight: '60vh',
                  overflow: 'auto',
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {script}
                </Typography>
              </Paper>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button 
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
            >
              Start Recording
            </Button>
          </CardActions>
        </Card>
      )}
      
      {/* Circular Wordnet Visualization */}
      <CircularWordnet
        open={showCircularWordnet}
        onClose={() => setShowCircularWordnet(false)}
        topic={topic || ''}
        trends={selectedTrends || { news: [], discussions: [], relatedQueries: [] }}
        onTrendsSelected={handleTrendsSelected}
      />
    </Box>
  );
} 