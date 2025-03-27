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
  Button
} from '@mui/material';
import { useAuth } from '@/providers/AuthProvider';
import { Outline, UserReference, GenerationStep, SelectedPoint } from './types';
import { formatScriptContent } from './utils';
import ErrorBoundary from './components/ErrorBoundary';
import ScriptFormStep from './components/ScriptFormStep';
import AiRatingCard from './components/AiRatingCard';
import UserRatingCard from './components/UserRatingCard';
import ArticlePreviewDialog from './components/ArticlePreviewDialog';
import PromptPreviewDialog from './components/PromptPreviewDialog';
import GenerationLoading from './components/GenerationLoading';

export default function ScriptWriter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State definitions
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [memberCount, setMemberCount] = useState<number>(1);
  const [activeStep, setActiveStep] = useState(0);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<SelectedPoint[]>([]);
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
  const [tabValue, setTabValue] = useState(0);
  const [featureProgress, setFeatureProgress] = useState<number>(0);
  
  // User reference states
  const [userReferences, setUserReferences] = useState<UserReference[]>([]);
  
  // Facts states
  const [aiGeneratingFacts, setAiGeneratingFacts] = useState(false);
  const [aiGeneratingNews, setAiGeneratingNews] = useState(false);
  
  // Content selection states
  const [contentSelectionOpen, setContentSelectionOpen] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [previewArticle, setPreviewArticle] = useState<UserReference | null>(null);
  const [promptPreview, setPromptPreview] = useState<string>('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Define wizard steps
  const steps = ['Enter Topic', 'Select News Articles', 'Add Unique Facts', 'Choose Content Points', 'Generated Script'];

  // Initialize selectedReferences with all existing references by default
  useEffect(() => {
    setSelectedReferences(userReferences.map(ref => ref.id));
  }, [userReferences]);

  // Mock implementations for unused state setters
  useEffect(() => {
    // Initialize some sample data for the script generation process
    setUserReferences([
      { 
        id: 'ref1', 
        type: 'article', 
        content: 'Sample article content',
        source: 'Sample Source',
        url: 'https://example.com'
      }
    ]);
    
    setGenerationSteps([
      { title: 'Analyzing topic', status: 'completed', progress: 100 },
      { title: 'Gathering information', status: 'active', progress: 65 },
      { title: 'Creating script structure', status: 'pending', progress: 0 }
    ]);
    
    // Sample point for the initial state
    setSelectedPoints([
      { 
        sectionIndex: 0, 
        pointIndex: 0, 
        text: 'Sample discussion point' 
      }
    ]);
  }, []);

  // Event handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleReferenceSelection = (id: string) => {
    setSelectedReferences(prev => 
      prev.includes(id) 
        ? prev.filter(refId => refId !== id)
        : [...prev, id]
    );
  };

  const handleArticlePreview = (event: React.MouseEvent, article: UserReference) => {
    event.stopPropagation(); // Prevent toggling selection
    setPreviewArticle(article);
  };

  const handleGenerateOutline = async () => {
    // Implementation details omitted for brevity
    console.log("Generate outline with topic:", topic);
    
    // Set feature progress based on topic input
    setFeatureProgress(Math.min(100, (topic.length * 5)));
    
    // Simulate outline generation
    setOutline({
      title: topic,
      sections: [
        { title: "Introduction", points: ["Point 1", "Point 2"] },
        { title: "Main Topic", points: ["Point 3", "Point 4"] },
        { title: "Conclusion", points: ["Point 5", "Point 6"] }
      ]
    });
    
    // Move to next step
    setActiveStep(3);
  };

  const handleGenerateScript = async () => {
    if (!outline) {
      setError('No outline available');
      return;
    }

    if (selectedPoints.length === 0) {
      setError('Please select at least one content point');
      return;
    }
    
    // Show content selection popup
    setContentSelectionOpen(true);
    setTabValue(0); // Start on first tab
  };

  const generatePromptPreview = () => {
    // Create a sample of what the prompt will include
    const selectedArticles = userReferences
      .filter(ref => ref.type === 'article' && selectedReferences.includes(ref.id))
      .map(article => `- ${article.content}`).join('\n');
    
    const selectedFacts = userReferences
      .filter(ref => (ref.type === 'factoid' || ref.type === 'stat') && selectedReferences.includes(ref.id))
      .map(fact => `- ${fact.content} ${fact.source ? `[Source: ${fact.source}]` : ''}`).join('\n');
    
    const selectedContentPoints = selectedPoints
      .map(point => `- ${point.text} ${point.elaboration ? `(Note: ${point.elaboration})` : ''}`).join('\n');

    // Create the preview
    const preview = `
# Podcast Script Generation Prompt

## Topic
${topic}

## Format
- Duration: ${duration} minutes
- Speakers: ${memberCount} ${memberCount > 1 ? 'people' : 'person'}

## Selected News Articles
${selectedArticles || 'No news articles selected'}

## Selected Facts
${selectedFacts || 'No facts selected'}

## Content Points to Cover
${selectedContentPoints || 'No content points selected'}

## Instructions
Please create a conversational podcast script that covers the topic and incorporates the selected news, facts, and content points. The script should be engaging, educational, and follow good podcasting practices with natural transitions between topics.
`;

    setPromptPreview(preview);
    setShowPromptPreview(true);
  };

  const proceedWithScriptGeneration = async () => {
    // Close content selection UI
    setContentSelectionOpen(false);
    
    // Filter references to only use selected ones
    const filteredReferences = userReferences.filter(ref => 
      selectedReferences.includes(ref.id)
    );
    
    // Start loading state
    setLoading(true);
    
    // Update AI generation status
    setAiGeneratingFacts(true);
    setAiGeneratingNews(true);
    
    // Simulate script generation with a delay
    setTimeout(() => {
      // Reset generation states
      setAiGeneratingFacts(false);
      setAiGeneratingNews(false);
      
      // Create a sample script
      const generatedScript = `
[INTRODUCTION]

HOST: Welcome to the podcast about ${topic}! I'm your host, and today we're going to discuss this fascinating topic for about ${duration} minutes.

GUEST: Thanks for having me. I'm excited to share my thoughts on ${topic}.

[MAIN CONTENT]

HOST: Let's start by discussing the first point: ${selectedPoints[0]?.text || 'our main topic'}.

GUEST: Absolutely. One interesting fact about this is ${filteredReferences.find(ref => ref.type === 'factoid')?.content || 'something fascinating'}.

HOST: That's really interesting! And according to recent news, ${filteredReferences.find(ref => ref.type === 'article')?.content || 'there have been some developments'}.

[CONCLUSION]

HOST: Well, that's all the time we have for today. Thanks for listening to our discussion about ${topic}!

GUEST: It was a pleasure. Thank you for having me.

HOST: See you next time!
      `;
      
      setScript(generatedScript);
      setLoading(false);
      setActiveStep(4);
      
      // Set a simple AI rating
      setAiRating({
        overall: 4.2,
        categories: {
          content: 4.5,
          structure: 4.0,
          engagement: 4.3,
          clarity: 4.1,
          pacing: 4.1
        },
        feedback: {
          strengths: ["Great structure", "Good use of references", "Engaging dialogue"],
          improvements: ["Could include more transition phrases", "Consider adding more personal anecdotes"]
        }
      });
    }, 3000);
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
                  <ScriptFormStep
                    topic={topic}
                    setTopic={setTopic}
                    duration={duration}
                    setDuration={setDuration}
                    memberCount={memberCount}
                    setMemberCount={setMemberCount}
                    loading={loading}
                    featureProgress={featureProgress}
                    handleGenerateOutline={handleGenerateOutline}
                    isMobile={isMobile}
                  />
                )}

                {activeStep === 3 && outline && (
                  <Box>
                    {/* Content Points Selection UI would go here */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleGenerateScript}
                      >
                        Generate Script
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
                          rating={rating}
                          setRating={setRating}
                          user={user}
                          topic={topic}
                          script={script}
                          outline={outline ? {
                            intro: outline.sections[0]?.title || 'Introduction',
                            topics: outline.sections.map(s => s.title),
                            conclusion: outline.sections[outline.sections.length - 1]?.title || 'Conclusion'
                          } : { intro: 'Introduction', topics: [topic], conclusion: 'Conclusion' }}
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
            tabValue={tabValue}
            handleTabChange={handleTabChange}
            generationSteps={generationSteps}
            userReferences={userReferences}
            selectedReferences={selectedReferences}
            aiGeneratingNews={aiGeneratingNews}
            aiGeneratingFacts={aiGeneratingFacts}
            handleArticlePreview={handleArticlePreview}
            toggleReferenceSelection={toggleReferenceSelection}
            theme={theme}
          />
        )}

        {/* Dialogs */}
        <ArticlePreviewDialog
          previewArticle={previewArticle}
          selectedReferences={selectedReferences}
          setPreviewArticle={setPreviewArticle}
          toggleReferenceSelection={toggleReferenceSelection}
        />

        <PromptPreviewDialog
          showPromptPreview={showPromptPreview}
          setShowPromptPreview={setShowPromptPreview}
          promptPreview={promptPreview}
          proceedWithScriptGeneration={proceedWithScriptGeneration}
        />

        {/* Content Selection UI */}
        {contentSelectionOpen && (
          <Box sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Paper sx={{ maxWidth: 600, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Review Content Selection
              </Typography>
              <Typography paragraph>
                Select which content to include in your podcast script.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={() => setContentSelectionOpen(false)} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={generatePromptPreview} variant="outlined" color="info">
                  Preview Prompt
                </Button>
                <Button onClick={proceedWithScriptGeneration} variant="contained" color="primary">
                  Generate Script
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
} 