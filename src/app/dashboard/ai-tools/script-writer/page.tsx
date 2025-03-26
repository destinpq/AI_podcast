'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { 
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  Mic as MicIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { WordnetPlugin } from '@/plugins/wordnet';
import { CircularWordnet } from '@/components/CircularWordnet';
import { TrendingContent } from '@/types/trends';

interface SelectedPoint {
  sectionIndex: number;
  pointIndex: number;
  text: string;
  elaboration?: string;
  promptType?: 'life_experience' | 'joke' | 'analogy' | 'example' | 'statistic' | 'quote';
}

interface Outline {
  title: string;
  sections: Array<{
    title: string;
    points: string[];
  }>;
}

const PROMPT_TYPES = [
  { value: 'life_experience', label: 'Life Experience' },
  { value: 'joke', label: 'Joke or Humor' },
  { value: 'analogy', label: 'Analogy' },
  { value: 'example', label: 'Real-world Example' },
  { value: 'statistic', label: 'Statistic or Fact' },
  { value: 'quote', label: 'Quote' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

const MEMBER_OPTIONS = [
  { value: 1, label: 'Solo' },
  { value: 2, label: '2 Members' },
  { value: 3, label: '3 Members' },
  { value: 4, label: '4 Members' },
];

interface GenerationStep {
  title: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

export default function ScriptWriter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [memberCount, setMemberCount] = useState<number>(1);
  const [activeStep, setActiveStep] = useState(0);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<SelectedPoint[]>([]);
  const [editingPoint, setEditingPoint] = useState<SelectedPoint | null>(null);
  const [elaborationDialog, setElaborationDialog] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [aiRating, setAiRating] = useState<{
    overall: number;
    categories: {
      content: number;
      structure: number;
      engagement: number;
      clarity: number;
      pacing: number;
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  } | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCircularWordnet, setShowCircularWordnet] = useState(false);
  const [selectedTrends, setSelectedTrends] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }>({
    news: [],
    discussions: [],
    relatedQueries: [],
  });

  const handleTrendsSelected = (trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => {
    setSelectedTrends(trends);
  };

  const handleGenerateOutline = async () => {
    if (!topic) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setOutline(null);
    setScript('');
    setSelectedPoints([]);

    const steps = outline?.sections.map(section => ({
      title: section.title,
      status: 'pending' as const,
      progress: 0
    })) || [];
    setGenerationSteps(steps);
    setCurrentStepIndex(0);

    try {
      let trendsData = selectedTrends;
      
      if (Object.values(selectedTrends).every(arr => arr.length === 0)) {
        const trendsResponse = await fetch('/api/trends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });

        if (!trendsResponse.ok) {
          throw new Error('Failed to fetch trends data');
        }

        trendsData = await trendsResponse.json();
        setSelectedTrends(trendsData);
      }

      const outlineResponse = await fetch('/api/script/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, trendsData, duration }),
      });

      if (!outlineResponse.ok) {
        throw new Error('Failed to generate outline');
      }

      const outlineData = await outlineResponse.json();
      if (!outlineData || !outlineData.title || !Array.isArray(outlineData.sections)) {
        throw new Error('Invalid outline data received');
      }
      setOutline(outlineData);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const flowCards = [
    {
      title: "Enter Topic",
      icon: <EditIcon fontSize="large" />,
      color: theme.palette.primary.main,
      active: activeStep === 0,
      completed: activeStep > 0,
    },
    {
      title: "Select Points",
      icon: <TrendingUpIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      active: activeStep === 1,
      completed: activeStep > 1,
    },
    {
      title: "Final Script",
      icon: <MicIcon fontSize="large" />,
      color: theme.palette.success.main,
      active: activeStep === 2,
      completed: activeStep > 2,
    }
  ];

  const handleGenerateScript = async () => {
    if (!outline) {
      setError('No outline available');
      return;
    }

    setLoading(true);
    setError('');
    setAiRating(null);

    const steps = outline.sections.map(section => ({
      title: section.title,
      status: 'pending' as const,
      progress: 0
    }));
    setGenerationSteps(steps);
    setCurrentStepIndex(0);

    try {
      const scriptPartPromises = outline.sections.map((section, sectionIndex) => {
        return new Promise<string>(async (resolve, reject) => {
          try {
            setGenerationSteps(current => 
              current.map((step, i) => ({
                ...step,
                status: i === sectionIndex ? 'active' : step.status
              }))
            );

            const progressInterval = setInterval(() => {
              setGenerationSteps(current => 
                current.map((step, i) => ({
                  ...step,
                  progress: i === sectionIndex ? Math.min(step.progress + 2, 90) : step.progress
                }))
              );
            }, 200);

            const response = await fetch('/api/script/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                outline: { title: outline.title, sections: [section] },
                selectedPoints: selectedPoints.filter(p => p.sectionIndex === sectionIndex),
                duration: duration / outline.sections.length,
                memberCount,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate script section');
            }

            const data = await response.json();
            
            clearInterval(progressInterval);
            setGenerationSteps(current => 
              current.map((step, i) => ({
                ...step,
                status: i === sectionIndex ? 'completed' : step.status,
                progress: i === sectionIndex ? 100 : step.progress
              }))
            );
            setCurrentStepIndex(sectionIndex + 1);

            resolve(data.script);
          } catch (error) {
            reject(error);
          }
        });
      });

      const scriptParts = await Promise.all(scriptPartPromises);
      const fullScript = scriptParts.join('\n\n[Smooth Transition]\n\n');
      setScript(fullScript);

      const ratingResponse = await fetch('/api/script/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          script: fullScript, 
          duration,
          memberCount,
        }),
      });

      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        setAiRating(ratingData);
      }

      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const handlePointSelect = (sectionIndex: number, pointIndex: number, text: string) => {
    const isSelected = selectedPoints.some(
      point => point.sectionIndex === sectionIndex && point.pointIndex === pointIndex
    );

    if (isSelected) {
      setSelectedPoints(selectedPoints.filter(
        point => !(point.sectionIndex === sectionIndex && point.pointIndex === pointIndex)
      ));
    } else {
      setSelectedPoints([...selectedPoints, { 
        sectionIndex, 
        pointIndex, 
        text,
        promptType: 'example'
      }]);
    }
  };

  const handlePromptTypeChange = (sectionIndex: number, pointIndex: number, promptType: SelectedPoint['promptType']) => {
    setSelectedPoints(selectedPoints.map(point =>
      point.sectionIndex === sectionIndex && point.pointIndex === pointIndex
        ? { ...point, promptType }
        : point
    ));
  };

  const handleEditElaboration = (point: SelectedPoint) => {
    setEditingPoint(point);
    setElaborationDialog(true);
  };

  const handleSaveElaboration = () => {
    if (!editingPoint) return;

    setSelectedPoints(selectedPoints.map(point => 
      point.sectionIndex === editingPoint.sectionIndex && 
      point.pointIndex === editingPoint.pointIndex
        ? { ...point, elaboration: editingPoint.elaboration }
        : point
    ));

    setElaborationDialog(false);
    setEditingPoint(null);
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 3 }, 
      maxWidth: 1200, 
      mx: 'auto',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          height: { xs: 'auto', sm: '100vh' },
          overflow: 'auto',
          bgcolor: 'background.default',
          p: { xs: 1, sm: 1.5 },
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 500,
              }}
            >
              AI Script Writer
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => {
                setTopic('');
                setScript('');
                setSelectedPoints([]);
                setActiveStep(0);
                setOutline(null);
                setSelectedTrends({
                  news: [],
                  discussions: [],
                  relatedQueries: [],
                });
              }}
              size="small"
            >
              Reset
            </Button>
          </Box>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mb: 3 }}
            justifyContent="center"
          >
            {flowCards.map((card, index) => (
              <Card 
                key={index}
                sx={{ 
                  width: { xs: '100%', sm: 0 },
                  flexGrow: 1,
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: card.active || card.completed ? 'pointer' : 'default',
                  bgcolor: card.active ? `${card.color}15` : 'background.paper',
                  borderLeft: card.active ? `4px solid ${card.color}` : 'none',
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

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: { xs: 1, sm: 1.5 } }}>
              {error}
            </Alert>
          )}

          <Card sx={{ 
            mb: { xs: 2, sm: 3 },
            boxShadow: { xs: 0, sm: 1 }
          }}>
            <CardContent sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              '&:last-child': { pb: { xs: 1.5, sm: 2 } } 
            }}>
              {activeStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1.5, sm: 1 }
                  }}>
                    <TextField
                      fullWidth
                      placeholder="Enter your podcast topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={loading}
                      sx={{ 
                        flex: { xs: '1 1 100%', sm: '1 1 auto' },
                        '& .MuiInputBase-root': {
                          height: { xs: 48, sm: 56 }
                        }
                      }}
                    />
                    <FormControl 
                      fullWidth 
                      sx={{ 
                        minWidth: { xs: '100%', sm: 150 },
                        '& .MuiInputBase-root': {
                          height: { xs: 48, sm: 56 }
                        }
                      }}
                    >
                      <InputLabel>Duration</InputLabel>
                      <Select
                        value={duration}
                        label="Duration"
                        onChange={(e) => setDuration(e.target.value as number)}
                        disabled={loading}
                      >
                        {DURATION_OPTIONS.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl 
                      fullWidth 
                      sx={{ 
                        minWidth: { xs: '100%', sm: 150 },
                        '& .MuiInputBase-root': {
                          height: { xs: 48, sm: 56 }
                        }
                      }}
                    >
                      <InputLabel>Members</InputLabel>
                      <Select
                        value={memberCount}
                        label="Members"
                        onChange={(e) => setMemberCount(e.target.value as number)}
                        disabled={loading}
                      >
                        {MEMBER_OPTIONS.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={handleGenerateOutline}
                      disabled={loading || !topic.trim()}
                      fullWidth={isMobile}
                      sx={{ 
                        height: { xs: 48, sm: 56 },
                        mt: { xs: 1, sm: 0 }
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Generate Outline'
                      )}
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Select your desired podcast duration and number of speakers. The AI will optimize the content and pacing accordingly.
                    </Typography>
                    
                    {topic.trim() && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<TrendingUpIcon />}
                        onClick={() => setShowCircularWordnet(true)}
                        sx={{ 
                          ml: 2,
                          boxShadow: 2,
                          '&:hover': {
                            boxShadow: 4
                          }
                        }}
                      >
                        View Visualization
                      </Button>
                    )}
                  </Box>
                  
                  {topic.trim() && (
                    <Box sx={{ 
                      mt: 3, 
                      border: '1px solid',
                      borderColor: theme.palette.primary.light,
                      borderRadius: 2,
                      p: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      bgcolor: 'background.paper',
                    }}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          fontWeight: 500,
                          color: theme.palette.primary.main
                        }}
                      >
                        <TrendingUpIcon color="primary" fontSize="small" />
                        Trending Topics for &ldquo;{topic}&rdquo;
                      </Typography>
                      <WordnetPlugin topic={topic} onTrendsSelected={handleTrendsSelected} />
                    </Box>
                  )}
                </Box>
              )}

              {activeStep === 1 && outline && (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {outline.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Select points and choose how to enhance them in the script
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        if (selectedPoints.length === outline.sections.reduce((acc, section) => acc + section.points.length, 0)) {
                          setSelectedPoints([]);
                        } else {
                          const allPoints: SelectedPoint[] = [];
                          outline.sections.forEach((section, sectionIndex) => {
                            section.points.forEach((point, pointIndex) => {
                              allPoints.push({
                                sectionIndex,
                                pointIndex,
                                text: point,
                                promptType: 'example'
                              });
                            });
                          });
                          setSelectedPoints(allPoints);
                        }
                      }}
                      sx={{ 
                        minWidth: { xs: '100%', sm: 'auto' },
                        height: { xs: 36, sm: 32 }
                      }}
                    >
                      {selectedPoints.length === outline.sections.reduce((acc, section) => acc + section.points.length, 0)
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </Box>

                  {(outline.sections || []).map((section, sectionIndex) => (
                    <Box key={sectionIndex} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {section.title}
                      </Typography>
                      <Box component="ul" sx={{ pl: { xs: 0, sm: 2 }, listStyle: 'none' }}>
                        {(section.points || []).map((point, pointIndex) => {
                          const isSelected = selectedPoints.some(
                            sp => sp.sectionIndex === sectionIndex && sp.pointIndex === pointIndex
                          );
                          const selectedPoint = selectedPoints.find(
                            sp => sp.sectionIndex === sectionIndex && sp.pointIndex === pointIndex
                          );

                          return (
                            <Box
                              component="li"
                              key={pointIndex}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                mb: 2,
                                p: 1,
                                bgcolor: isSelected ? 'action.selected' : 'transparent',
                                borderRadius: 1,
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handlePointSelect(sectionIndex, pointIndex, point)}
                                  />
                                }
                                label={
                                  <Typography sx={{ wordBreak: 'break-word' }}>
                                    {point}
                                  </Typography>
                                }
                              />
                              {isSelected && (
                                <Box sx={{ 
                                  pl: 4,
                                  display: 'flex', 
                                  flexDirection: { xs: 'column', md: 'row' },
                                  alignItems: { xs: 'stretch', md: 'center' },
                                  gap: 1 
                                }}>
                                  <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Enhancement Type</InputLabel>
                                    <Select
                                      value={selectedPoint?.promptType || 'example'}
                                      label="Enhancement Type"
                                      onChange={(e) => handlePromptTypeChange(
                                        sectionIndex,
                                        pointIndex,
                                        e.target.value as SelectedPoint['promptType']
                                      )}
                                    >
                                      {PROMPT_TYPES.map(type => (
                                        <MenuItem key={type.value} value={type.value}>
                                          {type.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                  <Box sx={{ 
                                    display: 'flex',
                                    flex: 1,
                                    gap: 1
                                  }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      placeholder="Add elaboration (optional)"
                                      value={selectedPoint?.elaboration || ''}
                                      onChange={(e) => {
                                        const newPoint = { ...selectedPoint!, elaboration: e.target.value };
                                        setSelectedPoints(selectedPoints.map(p =>
                                          p.sectionIndex === sectionIndex && p.pointIndex === pointIndex
                                            ? newPoint
                                            : p
                                        ));
                                      }}
                                    />
                                    <Tooltip title="Edit elaboration">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditElaboration(selectedPoint!)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleGenerateScript}
                      disabled={loading}
                      fullWidth={isMobile}
                    >
                      Generate Script
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && script && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Generated Script
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      whiteSpace: 'pre-wrap', 
                      mb: 3,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {script}
                  </Paper>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 2,
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography variant="h6">
                          Your Rating
                        </Typography>
                        <Rating
                          value={rating}
                          onChange={(_, newValue) => setRating(newValue)}
                          precision={0.5}
                          size={isMobile ? "medium" : "large"}
                          emptyIcon={<StarBorderIcon fontSize="inherit" />}
                          icon={<StarIcon fontSize="inherit" />}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {rating ? `You rated this script ${rating} stars` : 'Click to rate'}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          AI Evaluation
                        </Typography>
                        {aiRating ? (
                          <Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Overall Score: {aiRating.overall.toFixed(1)}/5
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={(aiRating.overall / 5) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              {Object.entries(aiRating.categories).map(([category, score]) => (
                                <Grid item xs={6} key={category}>
                                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {category}: {score}/5
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(score / 5) * 100}
                                    sx={{ height: 4, borderRadius: 2 }}
                                  />
                                </Grid>
                              ))}
                            </Grid>

                            <Box>
                              <Typography variant="subtitle2" color="success.main" gutterBottom>
                                Strengths:
                              </Typography>
                              <List dense>
                                {aiRating.feedback.strengths.map((strength, index) => (
                                  <ListItem key={index}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <CheckCircleIcon color="success" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={strength} />
                                  </ListItem>
                                ))}
                              </List>

                              <Typography variant="subtitle2" color="info.main" gutterBottom sx={{ mt: 1 }}>
                                Suggested Improvements:
                              </Typography>
                              <List dense>
                                {aiRating.feedback.improvements.map((improvement, index) => (
                                  <ListItem key={index}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <LightbulbIcon color="info" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={improvement} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <CircularProgress />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {loading && (
                <Box sx={{ 
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2, sm: 4 }
                }}>
                  <Paper sx={{ 
                    p: { xs: 2, sm: 4 }, 
                    maxWidth: 600, 
                    width: '100%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: { xs: 2, sm: 3 }
                    }}>
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [-5, 5, -5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <MicIcon sx={{ 
                          fontSize: { xs: 36, sm: 48 }, 
                          color: 'primary.main' 
                        }} />
                      </motion.div>
                    </Box>

                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      Generating Your {memberCount > 1 ? `${memberCount}-Person ` : ''}Podcast Script
                    </Typography>

                    <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                      <AnimatePresence>
                        {generationSteps.map((step) => (
                          <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 1,
                                flexWrap: 'wrap',
                                gap: 1
                              }}>
                                <Typography 
                                  variant="body1"
                                  sx={{ 
                                    flex: 1,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    color: step.status === 'completed' 
                                      ? 'success.main' 
                                      : step.status === 'active' 
                                      ? 'primary.main' 
                                      : 'text.secondary'
                                  }}
                                >
                                  {step.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    ml: { xs: 0, sm: 2 },
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }}
                                >
                                  {step.progress}%
                                </Typography>
                              </Box>
                              <Box 
                                component={motion.div}
                                sx={{ 
                                  height: { xs: 4, sm: 6 }, 
                                  bgcolor: 'background.default',
                                  borderRadius: 3,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  component={motion.div}
                                  animate={{ 
                                    width: `${step.progress}%`,
                                    backgroundColor: step.status === 'completed' 
                                      ? '#4caf50' 
                                      : step.status === 'active' 
                                      ? '#2196f3' 
                                      : '#9e9e9e'
                                  }}
                                  initial={{ width: 0 }}
                                  transition={{ duration: 0.5 }}
                                  sx={{ 
                                    height: '100%',
                                    borderRadius: 3
                                  }}
                                />
                              </Box>
                            </Box>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        mt: { xs: 2, sm: 3 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {currentStepIndex === generationSteps.length 
                        ? 'Finalizing your script...'
                        : `Generating section ${currentStepIndex + 1} of ${generationSteps.length}`
                      }
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      <CircularWordnet
        open={showCircularWordnet}
        onClose={() => setShowCircularWordnet(false)}
        topic={topic || ''}
        trends={selectedTrends || { news: [], discussions: [], relatedQueries: [] }}
        onTrendsSelected={handleTrendsSelected}
      />

      <Dialog 
        open={elaborationDialog} 
        onClose={() => setElaborationDialog(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Elaboration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 8 : 4}
            value={editingPoint?.elaboration || ''}
            onChange={(e) => setEditingPoint(prev => prev ? { ...prev, elaboration: e.target.value } : null)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setElaborationDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveElaboration} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 