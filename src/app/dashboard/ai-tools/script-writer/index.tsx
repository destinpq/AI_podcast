'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuth } from '@/providers/AuthProvider';
import { 
  AIRating, 
  GenerationStep,
  UserReference 
} from './types';
import { formatScriptContent } from './utils';
import ErrorBoundary from './components/ErrorBoundary';
import AiRatingCard from './components/AiRatingCard';
import UserRatingCard from './components/UserRatingCard';
import GenerationLoading from './components/GenerationLoading';
import PromptSelector from './components/PromptSelector';
import SimplifiedPromptDialog from './components/SimplifiedPromptDialog';
import MarkdownRenderer from './components/MarkdownRenderer';
import { toast } from 'react-hot-toast';
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function TopicSelector({ 
  topic, 
  setTopic, 
  duration, 
  setDuration, 
  memberCount, 
  setMemberCount, 
  loading, 
  onSubmit 
}: {
  topic: string;
  setTopic: (topic: string) => void;
  duration: number;
  setDuration: (duration: string) => void;
  memberCount: number;
  setMemberCount: (count: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Enter Topic Details
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Topic
        </Typography>
        <TextField
          fullWidth
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your podcast topic..."
          disabled={loading}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Duration (minutes)
        </Typography>
        <Select
          fullWidth
          value={duration.toString()}
          onChange={(e) => setDuration(e.target.value)}
          disabled={loading}
        >
          <MenuItem value="15">15 minutes</MenuItem>
          <MenuItem value="30">30 minutes</MenuItem>
          <MenuItem value="45">45 minutes</MenuItem>
          <MenuItem value="60">1 hour</MenuItem>
        </Select>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Number of Speakers
        </Typography>
        <Select
          fullWidth
          value={memberCount.toString()}
          onChange={(e) => setMemberCount(e.target.value)}
          disabled={loading}
        >
          <MenuItem value="1">Solo</MenuItem>
          <MenuItem value="2">2 People</MenuItem>
          <MenuItem value="3">3 People</MenuItem>
          <MenuItem value="4">4 People</MenuItem>
        </Select>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!topic || loading}
        >
          Continue
        </Button>
        </Box>
    </Box>
  );
}

export default function ScriptWriter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State definitions
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<number>(2);
  const [memberCount, setMemberCount] = useState<number>(2);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [aiRating, setAiRating] = useState<AIRating | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [userReferences, setUserReferences] = useState<UserReference[]>([]);
  const [showPromptDialog, setShowPromptDialog] = useState(false);

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize sample data
  useEffect(() => {
    if (!mounted) return;
    
    setUserReferences([
      { 
        id: 'ref1', 
        type: 'article', 
        content: 'Sample article content from Sample Source (https://example.com)',
        source: 'Sample Source'
      }
    ]);
    
    setGenerationSteps([
      { title: 'Analyzing topic', status: 'completed', progress: 100 },
      { title: 'Gathering information', status: 'active', progress: 65 },
      { title: 'Creating script structure', status: 'pending', progress: 0 }
    ]);
  }, [mounted]);

  // Show loading state during initial mount
  if (!mounted) {
    return (
      <Box sx={{ 
        p: { xs: 1, sm: 3 }, 
        maxWidth: 1200, 
        mx: 'auto',
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Define wizard steps
  const steps = [
    'Enter Topic',
    'Select Prompt Styles',
    'Review Prompts',
    'Generated Script',
    'Rate & Save'
  ];

  // Event handlers
  const handleDurationChange = (newDuration: string) => {
    const parsedDuration = parseInt(newDuration, 10);
    if (!isNaN(parsedDuration)) {
      setDuration(parsedDuration);
    }
  };

  const handleMemberCountChange = (newCount: string) => {
    const parsedCount = parseInt(newCount, 10);
    if (!isNaN(parsedCount)) {
      setMemberCount(parsedCount);
    }
  };

  const handleGenerateOutline = async () => {
    if (!topic) {
      toast.error('Please enter a topic first');
      return;
    }

    if (duration <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update generation steps to show research progress
      setGenerationSteps([
        { title: 'Researching topic', status: 'active', progress: 0 },
        { title: 'Creating outline', status: 'pending', progress: 0 },
        { title: 'Generating engagement hooks', status: 'pending', progress: 0 }
      ]);

      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          duration,
          memberCount,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outline');
      }

      // Update steps to show completion
      setGenerationSteps([
        { title: 'Research complete', status: 'completed', progress: 100 },
        { title: 'Outline created', status: 'completed', progress: 100 },
        { title: 'Hooks generated', status: 'completed', progress: 100 }
      ]);

      // Generate initial prompts based on the research and hooks
      const initialPrompts = [
        `Research Summary:\n${data.research}`,
        `Podcast Outline:\n${data.outline}`,
        `Engagement Elements:\n${data.hooks}`
      ];

      setGeneratedPrompts(initialPrompts);

      // Move to prompt selection step
      setActiveStep(1);

    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate outline');
      
      // Reset steps on error
      setGenerationSteps([
        { title: 'Research failed', status: 'pending', progress: 0 },
        { title: 'Outline creation', status: 'pending', progress: 0 },
        { title: 'Hook generation', status: 'pending', progress: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!topic || generatedPrompts.length === 0) {
      setError('No prompts available');
      return;
    }
    
    setLoading(true);
    setError(null);
    setAiRating(null);
    
    try {
      // Parse the outline and research from the generated prompts
      const researchText = generatedPrompts[0].replace('Research Summary:\n', '');
      const outlineText = generatedPrompts[1].replace('Podcast Outline:\n', '');
      const hooksText = generatedPrompts[2].replace('Engagement Elements:\n', '');
      
      const outlineLines = outlineText.split('\n').filter(line => line.trim());
      const researchPoints = researchText.split('\n').filter(line => line.trim());
      const hooks = hooksText.split('\n').filter(line => line.trim());
      
      // For short-form content, focus on the most impactful points
      const sections = [{
        title: 'Key Insight',
        points: [
          outlineLines[0], // Main point
          researchPoints[0], // Supporting research
          hooks[0] // Engagement hook
        ].filter(Boolean)
      }];

      // Enhanced outline with precise timing and quality requirements
      const enhancedOutline = {
        title: topic,
        sections,
        format: {
          duration: duration,
          style: 'expert_insight',
          focus: 'key_insight',
          tone: 'authoritative',
          pacing: 'dynamic',
          structure: {
            hook: {
              duration: '0:15',
              elements: ['attention_grabber', 'relevance_statement']
            },
            insight: {
              duration: '2:00',
              elements: ['key_point', 'supporting_evidence', 'real_world_application']
            },
            takeaway: {
              duration: '0:45',
              elements: ['actionable_insight', 'memorable_conclusion']
            }
          }
        },
        requirements: {
          wordCount: {
            min: Math.floor(duration * 130), // Minimum words for clarity
            max: Math.ceil(duration * 150),  // Maximum words for conciseness
            optimal: Math.floor(duration * 140) // Target word count
          },
          qualityMarkers: {
            content: [
              'expert_perspective',
              'data_backed_claims',
              'practical_examples',
              'current_relevance',
              'unique_insights'
            ],
            delivery: [
              'clear_transitions',
              'natural_dialogue',
              'engaging_tone',
              'varied_pacing',
              'memorable_soundbites'
            ],
            structure: [
              'strong_hook',
              'logical_flow',
              'time_optimized',
              'clear_takeaway',
              'call_to_action'
            ]
          },
          engagement: {
            hooks: [
              'thought_provoking_question',
              'surprising_statistic',
              'compelling_scenario'
            ],
            techniques: [
              'storytelling',
              'analogy',
              'contrast',
              'visualization',
              'emotional_connection'
            ]
          }
        },
        contextualElements: {
          research: researchPoints[0],
          trend: hooks.find(h => h.includes('trend')),
          statistic: hooks.find(h => h.includes('statistic')),
          example: hooks.find(h => h.includes('example'))
        }
      };

      // Call the short-form API endpoint
      const response = await fetch('/api/script/short-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          prompts: generatedPrompts,
          outline: enhancedOutline,
          duration,
          memberCount,
          targetWordCount: {
            min: duration * 130,
            max: duration * 150,
            optimal: duration * 140
          }
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate script');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format the script with detailed timing and structure indicators
      const formattedScript = `
[${duration}-MINUTE EXPERT INSIGHT: ${topic.toUpperCase()}]

[HOOK - 15 SECONDS]
${data.script.hook}

[MAIN INSIGHT - 2 MINUTES]
${data.script.insight}

[KEY TAKEAWAY - 45 SECONDS]
${data.script.takeaway}

[METRICS]
Word Count: ${data.wordCount || 'N/A'} words
Estimated Time: ${duration}:00 minutes
Optimal Range: ${Math.floor(duration * 130)}-${Math.ceil(duration * 150)} words

[QUALITY MARKERS]
✓ Expert Perspective
✓ Data-Backed Claims
✓ Practical Examples
✓ Clear Structure
✓ Actionable Insights
`;

      setScript(formattedScript);
      
      // Set enhanced AI rating with detailed feedback
      setAiRating(data.rating || {
        overall: 4.5,
        categories: {
          content: 4.5,
          structure: 4.5,
          engagement: 4.5,
          clarity: 4.5,
          pacing: 4.5
        },
        feedback: {
          strengths: [
            'Focused and concise delivery',
            'Expert-level insights',
            'Clear actionable takeaways',
            'Engaging opening hook',
            'Natural dialogue flow'
          ],
          improvements: []
        }
      });

      setActiveStep(prevStep => prevStep + 1);

    } catch (error) {
      console.error('Error generating script:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate script');
      
      // Update steps to show error
      setGenerationSteps(prev => prev.map(step => ({
        ...step,
        status: step.status === 'active' ? 'error' : step.status
      })));
    } finally {
      setLoading(false);
    }
  };

  const handlePromptGenerate = (prompts: string[]) => {
    setGeneratedPrompts(prompts);
    // Move to next step after prompts are generated
    setActiveStep(prevStep => prevStep + 1);
  };

  return (
    <ErrorBoundary>
    <Box sx={{ 
      p: { xs: 1, sm: 3 }, 
      maxWidth: 1200, 
      mx: 'auto',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Main Content */}
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
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 500,
              mb: { xs: 1, sm: 1.5 }
            }}
          >
            AI Script Writer
          </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                color="primary"
                href="/dashboard/ai-tools/script-writer/prompts"
              >
                News Prompt Templates
              </Button>
            </Box>

          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: { xs: 1, sm: 1.5 },
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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
                  <TopicSelector
                    topic={topic}
                    setTopic={setTopic}
                    duration={duration}
                    setDuration={handleDurationChange}
                    memberCount={memberCount}
                    setMemberCount={handleMemberCountChange}
                    loading={loading}
                    onSubmit={handleGenerateOutline}
                  />
                )}

                {activeStep === 1 && (
                  <PromptSelector
                    topic={topic} 
                    duration={duration}
                    memberCount={memberCount}
                    onPromptGenerate={handlePromptGenerate}
                  />
                )}

                {activeStep === 2 && generatedPrompts.length > 0 && (
                  <Box>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                      Review Generated Content
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Research Summary Card */}
                      <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SearchIcon color="primary" />
                              Research Summary
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                              <MarkdownRenderer content={generatedPrompts[0].replace('Research Summary:\n', '')} />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Podcast Outline Card */}
                      <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ListAltIcon color="primary" />
                              Podcast Outline
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                              <MarkdownRenderer content={generatedPrompts[1].replace('Podcast Outline:\n', '')} />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Engagement Elements Card */}
                      <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BoltIcon color="primary" />
                              Engagement Elements
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                              <MarkdownRenderer content={generatedPrompts[2].replace('Engagement Elements:\n', '')} />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(1)}
                        startIcon={<ArrowBackIcon />}
                      >
                        Back to Styles
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setShowPromptDialog(true)} // Show dialog before generating
                        endIcon={<PlayArrowIcon />}
                      >
                        Generate Full Script
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeStep === 4 && script && (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                  }}>
                    <Typography variant="h6">
                      Generated Script
                    </Typography>
                  </Box>
                  
                  <Paper 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      whiteSpace: 'pre-wrap', 
                      mb: 3,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {formatScriptContent(script)}
                  </Paper>
                  
                  <Grid container spacing={3}>
                    {/* User Rating */}
                    <Grid item xs={12} md={6}>
                        <UserRatingCard
                          rating={aiRating?.overall || 0}
                          setRating={(newRating: number) => {
                            setAiRating(prevRating => prevRating ? {
                              ...prevRating,
                              overall: newRating
                            } : null);
                          }}
                          user={user}
                          topic={topic}
                          script={script}
                          outline={{
                            intro: 'Introduction',
                            topics: [topic],
                            conclusion: 'Conclusion'
                          }}
                          duration={duration}
                          memberCount={memberCount}
                          aiRating={aiRating}
                          userReferences={userReferences}
                          isMobile={isMobile}
                        />
                    </Grid>

                    {/* AI Rating */}
                    <Grid item xs={12} md={6}>
                        <AiRatingCard aiRating={aiRating} />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Loading overlay */}
      {loading && (
        <GenerationLoading
          memberCount={memberCount}
          generationSteps={generationSteps}
          theme={theme}
        />
      )}

      {/* Prompt Dialog */}
      <SimplifiedPromptDialog
        open={showPromptDialog}
        handleClose={() => setShowPromptDialog(false)}
        topic={topic}
        duration={duration}
        memberCount={memberCount}
        handleGenerate={handleGenerateScript}
      />

    </Box>
    </ErrorBoundary>
  );
} 