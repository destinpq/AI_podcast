'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
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
  Tabs,
  Tab,
  Chip,
  Link,
  Divider,
  Avatar,
  CardMedia,
  CardActions,
  Stack,
} from '@mui/material';
import { 
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  Mic as MicIcon,
  Article as ArticleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  NewReleases as NewReleasesIcon,
  Image as ImageIcon,
  Psychology as PsychologyIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ScriptTrendsVisualization from '@/components/ScriptTrendsVisualization';
import SaveScriptButton from '@/components/SaveScriptButton';
import { useAuth } from '@/providers/AuthProvider';

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

interface TrendingContent {
  title: string;
  source: string;
  url: string;
  score?: number;
  publishedAt?: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  urlToImage?: string;
  thumbnail?: string;
}

interface UserReference {
  id: string;
  type: 'article' | 'factoid' | 'stat';
  content: string;
  url?: string;
  source?: string;
  description?: string;
  thumbnail?: string;
  color?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
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
  const { user } = useAuth();
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
  const [tabValue, setTabValue] = useState(0);
  const [trendsData, setTrendsData] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  } | null>(null);
  const [showWordnet, setShowWordnet] = useState(false);
  const [featureProgress, setFeatureProgress] = useState<number>(0);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [factsError, setFactsError] = useState<string | null>(null);
  
  // User reference states
  const [userReferences, setUserReferences] = useState<UserReference[]>([]);
  const [referenceDialogOpen, setReferenceDialogOpen] = useState(false);
  const [newReference, setNewReference] = useState<Omit<UserReference, 'id'>>({
    type: 'article',
    content: '',
    url: '',
    source: ''
  });
  
  // Facts states
  const [factsDialogOpen, setFactsDialogOpen] = useState(false);
  const [aiGeneratingFacts, setAiGeneratingFacts] = useState(false);
  const [aiGeneratingNews, setAiGeneratingNews] = useState(false);
  
  // Define wizard steps
  const steps = ['Enter Topic', 'Select News Articles', 'Add Unique Facts', 'Choose Content Points', 'Generated Script'];

  // Fetch news articles for the topic
  useEffect(() => {
    const fetchNews = async () => {
      if (topic.trim().length < 3) return;
      
      setNewsLoading(true);
      setNewsError(null);
      
      try {
        const response = await fetch(`/api/news?q=${encodeURIComponent(topic)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNewsArticles(data.articles || []);
        
        // Update feature progress when news is loaded
        setFeatureProgress(prev => Math.min(80, prev + 20));
      } catch (err) {
        console.error('Error fetching news:', err);
        setNewsError('Failed to load news articles');
      } finally {
        setNewsLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      if (topic.trim().length >= 3) {
        fetchNews();
      }
    }, 800);
    
    return () => clearTimeout(debounceTimer);
  }, [topic]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
    setTrendsData(null);
    setShowWordnet(false);

    // Initialize generation steps
    const steps = outline?.sections.map(section => ({
      title: section.title,
      status: 'pending' as const,
      progress: 0
    })) || [];
    setGenerationSteps(steps);
    setCurrentStepIndex(0);

    try {
      // Fetch trends data
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

      const trendsResult = await trendsResponse.json();
      
      // Incorporate news articles into the trends data
      if (newsArticles.length > 0) {
        const newsItems = newsArticles.map(article => ({
          title: article.title,
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt
        }));
        
        // Merge with existing news or use as primary source
        if (trendsResult.news && trendsResult.news.length > 0) {
          trendsResult.news = [...newsItems, ...trendsResult.news].slice(0, 10);
        } else {
          trendsResult.news = newsItems;
        }
      }
      
      setTrendsData(trendsResult);
      setShowWordnet(true);
      
      // Update feature progress to maximum when trends are loaded
      setFeatureProgress(100);

      // Generate outline with trends data and duration
      const outlineResponse = await fetch('/api/script/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, trendsData: trendsResult, duration }),
      });

      if (!outlineResponse.ok) {
        throw new Error('Failed to generate outline');
      }

      const outlineData = await outlineResponse.json();
      if (!outlineData || !outlineData.title || !Array.isArray(outlineData.sections)) {
        throw new Error('Invalid outline data received');
      }
      setOutline(outlineData);
      
      // Move to news article selection step in new workflow
      setActiveStep(1);
      
      // Open news reference dialog automatically
      setReferenceDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a random color based on a string
  // const stringToColor = (string: string) => {
  //   let hash = 0;
  //   for (let i = 0; i < string.length; i++) {
  //     hash = string.charCodeAt(i) + ((hash << 5) - hash);
  //   }
    
  //   let color = '#';
  //   for (let i = 0; i < 3; i++) {
  //     const value = (hash >> (i * 8)) & 0xFF;
  //     color += ('00' + value.toString(16)).slice(-2);
  //   }
    
  //   return color;
  // };

  // Function to generate a random image URL for news
  // const generateNewsImage = (topic: string, title: string): string => {
  //   // Use a placeholder image service with the topic and a hash of the title for uniqueness
  //   const hash = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000);
  //   return `https://source.unsplash.com/featured/600x400?${encodeURIComponent(topic)}&sig=${hash}`;
  // };

  // Function to generate an icon for fact type
  // const getFactIcon = (factText: string) => {
  //   // Simple logic to choose an icon based on the content of the fact
  //   if (factText.includes('%') || factText.match(/\d+(\.\d+)?%/)) {
  //     return <PsychologyIcon />;
  //   } else if (factText.toLowerCase().includes('research') || factText.toLowerCase().includes('study')) {
  //     return <BookmarkIcon />;
  //   } else if (factText.includes('$') || factText.match(/\$\d+/) || 
  //              factText.toLowerCase().includes('billion') || 
  //              factText.toLowerCase().includes('million')) {
  //     return <PublicIcon />;
  //   } else if (factText.includes('"') || factText.includes('"') || factText.includes('"')) {
  //     return <FormatQuoteIcon />;
  //   } else {
  //     return <BoltIcon />;
  //   }
  // };

  // Handle adding a new reference
  const handleAddReference = () => {
    if (!newReference.content.trim()) return;
    
    // Generate a random color
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
    
    setUserReferences([
      ...userReferences,
      {
        ...newReference,
        id: `ref-${Date.now()}`,
        color: getRandomColor()
      }
    ]);
    
    // Reset form
    setNewReference({
      type: 'article',
      content: '',
      url: '',
      source: ''
    });
    
    // Close dialog
    setReferenceDialogOpen(false);
    
    // Update feature progress
    setFeatureProgress(prev => Math.min(90, prev + 5));
  };
  
  // Handle removing a reference
  const handleRemoveReference = (id: string) => {
    setUserReferences(userReferences.filter(ref => ref.id !== id));
  };

  const handleGenerateScript = async () => {
    if (!outline) {
      setError('No outline available');
      return;
    }

    // Check if user has selected articles 
    const hasArticles = userReferences.filter(ref => ref.type === 'article').length > 0;
    
    if (!hasArticles) {
      setError('Please select at least one news article in Step 2');
      setReferenceDialogOpen(true);
      setActiveStep(1);
      return;
    }
    
    // Facts are now optional, so we removed the hasFacts check

    if (selectedPoints.length === 0) {
      setError('Please select at least one content point in Step 4');
      return;
    }

    setLoading(true);
    setError('');
    setAiRating(null);

    // Calculate target word count based on duration (100-150 words per minute)
    const minWordCount = duration * 100;
    const maxWordCount = duration * 150;

    // Initialize generation steps
    const steps = outline.sections.map(section => ({
      title: section.title,
      status: 'pending' as const,
      progress: 0
    }));
    setGenerationSteps(steps);
    setCurrentStepIndex(0);

    try {
      // Generate each section in parallel
      const scriptPartPromises = outline.sections.map((section, sectionIndex) => {
        // Create a promise that updates progress for this section
        return new Promise<string>(async (resolve, reject) => {
          try {
            // Start the section generation
            setGenerationSteps(current => 
              current.map((step, i) => ({
                ...step,
                status: i === sectionIndex ? 'active' : step.status
              }))
            );

            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setGenerationSteps(current => 
                current.map((step, i) => ({
                  ...step,
                  progress: i === sectionIndex ? Math.min(step.progress + 2, 90) : step.progress
                }))
              );
            }, 200);
            
            // Get section-specific references
            // Distribute facts and news evenly across sections
            const totalSections = outline.sections.length;
            const sectionFacts = userReferences
              .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
              .filter((_, index) => index % totalSections === sectionIndex);
            
            const sectionNews = userReferences
              .filter(ref => ref.type === 'article')
              .filter((_, index) => index % totalSections === sectionIndex);
            
            // Combine section-specific references
            const sectionReferences = [...sectionFacts, ...sectionNews];

            // Generate the actual script part
            const response = await fetch('/api/script/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                outline: { title: outline.title, sections: [section] },
                selectedPoints: selectedPoints.filter(p => p.sectionIndex === sectionIndex),
                duration: duration / outline.sections.length, // Duration per section
                memberCount, // Add memberCount to the API call
                personalExperiences: selectedPoints
                  .filter(p => p.promptType === 'life_experience' && p.elaboration)
                  .map(p => p.elaboration || ''),
                trendsData: trendsData, // Pass trends data to the API
                userReferences: sectionReferences, // Include section-specific references
                targetWordCount: {
                  min: Math.floor(minWordCount / totalSections),
                  max: Math.ceil(maxWordCount / totalSections)
                }
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate script section');
            }

            const data = await response.json();
            
            // Mark section as completed
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

      // Wait for all sections to complete
      const scriptParts = await Promise.all(scriptPartPromises);
      const fullScript = scriptParts.join('\n\n[TRANSITION]\n\n');
      setScript(fullScript);

      // Get AI rating
      const ratingResponse = await fetch('/api/script/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          script: fullScript, 
          duration,
          memberCount, // Add memberCount to rating API call
        }),
      });

      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        setAiRating(ratingData);
      }

      // Move to last step
      setActiveStep(4);
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
        promptType: 'example' // Default prompt type
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

  // Function to generate facts using OpenAI
  const generateFacts = async () => {
    if (topic.trim().length < 3) {
      setFactsError('Please enter a more specific topic');
      return;
    }
    
    setAiGeneratingFacts(true);
    setFactsError(null);
    
    try {
      const response = await fetch('/api/generate-facts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate facts');
      }
      
      const data = await response.json();
      
      // Add the AI-generated facts to userReferences
      if (data.facts && Array.isArray(data.facts)) {
        // Generate a random color for each fact
        const getRandomColor = () => {
          const letters = '0123456789ABCDEF';
          let color = '#';
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        };
        
        const newFacts = data.facts.map((fact: string) => ({
          id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'factoid' as const,
          content: fact,
          source: 'AI Generated',
          color: getRandomColor()
        }));
        
        setUserReferences(prev => [...prev, ...newFacts]);
      }
      
      // Update feature progress
      setFeatureProgress(prev => Math.min(90, prev + 10));
    } catch (err) {
      console.error('Error generating facts:', err);
      setFactsError('Failed to generate facts. Please try again.');
    } finally {
      setAiGeneratingFacts(false);
    }
  };
  
  // Function to generate news summaries using OpenAI
  const generateNewsSummaries = async () => {
    if (topic.trim().length < 3) {
      setNewsError('Please enter a more specific topic');
      return;
    }
    
    setAiGeneratingNews(true);
    setNewsError(null);
    
    try {
      const response = await fetch('/api/generate-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate news summaries');
      }
      
      const data = await response.json();
      
      // Add the AI-generated news to userReferences
      if (data.news && Array.isArray(data.news)) {
        // Generate a random color for each article
        const getRandomColor = () => {
          const letters = '0123456789ABCDEF';
          let color = '#';
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        };
        
        // Generate a random image URL for news
        const getNewsImageUrl = (title: string) => {
          const hash = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000);
          return `https://source.unsplash.com/featured/600x400?${encodeURIComponent(topic)}&sig=${hash}`;
        };
        
        const newArticles = data.news.map((article: {title: string, content: string}) => ({
          id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'article' as const,
          content: article.title,
          url: '',
          source: 'AI Generated',
          description: article.content,
          thumbnail: getNewsImageUrl(article.title),
          color: getRandomColor()
        }));
        
        setUserReferences(prev => [...prev, ...newArticles]);
      }
      
      // Update feature progress
      setFeatureProgress(prev => Math.min(85, prev + 15));
    } catch (err) {
      console.error('Error generating news:', err);
      setNewsError('Failed to generate news summaries. Please try again.');
    } finally {
      setAiGeneratingNews(false);
    }
  };

  return (
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
                      onChange={(e) => {
                        setTopic(e.target.value);
                        // Update feature progress based on topic length
                        if (e.target.value.length > 0) {
                          setFeatureProgress(Math.min(20, e.target.value.length * 2));
                        } else {
                          setFeatureProgress(0);
                        }
                      }}
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
                        onChange={(e) => {
                          setDuration(e.target.value as number);
                          // Increase feature progress when duration is selected
                          setFeatureProgress(prev => Math.min(40, prev + 10));
                        }}
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
                        onChange={(e) => {
                          setMemberCount(e.target.value as number);
                          // Increase feature progress when member count is changed
                          setFeatureProgress(prev => Math.min(60, prev + 10));
                        }}
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
                  
                  {/* Feature progression bar */}
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Feature Progression
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {featureProgress}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={featureProgress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label="Topic Selection" 
                        size="small" 
                        color={featureProgress >= 20 ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                      <Chip 
                        label="Duration Setting" 
                        size="small" 
                        color={featureProgress >= 40 ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                      <Chip 
                        label="Member Configuration" 
                        size="small" 
                        color={featureProgress >= 60 ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                      <Chip 
                        label="News Integration" 
                        size="small" 
                        color={trendsData ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                      <Chip 
                        label="AI Generation" 
                        size="small" 
                        color={activeStep > 0 ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Select your desired podcast duration and number of speakers. The AI will optimize the content and pacing accordingly.
                  </Typography>
                  
                  {showWordnet && trendsData && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Trending Topics for &quot;{topic}&quot;
                      </Typography>
                      
                      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                        <Tab label="Visualization" />
                        <Tab label="News & Discussions" />
                      </Tabs>
                      
                      <TabPanel value={tabValue} index={0}>
                        <Box sx={{ height: 400, border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', p: 2 }}>
                          <ScriptTrendsVisualization 
                            topic={topic} 
                            trendsData={trendsData}
                          />
                        </Box>
                      </TabPanel>
                      
                      <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Latest News</Typography>
                            <List>
                              {trendsData.news.map((item, index) => (
                                <ListItem key={index} divider={index !== trendsData.news.length - 1}>
                                  <ListItemText 
                                    primary={item.title} 
                                    secondary={item.source}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Current Discussions</Typography>
                            <List>
                              {trendsData.discussions.map((item, index) => (
                                <ListItem key={index} divider={index !== trendsData.discussions.length - 1}>
                                  <ListItemText 
                                    primary={item.title} 
                                    secondary={item.source}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        </Grid>
                      </TabPanel>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => setReferenceDialogOpen(true)}
                        sx={{ height: { xs: 36, sm: 32 } }}
                      >
                        {userReferences.length > 0 
                          ? `References (${userReferences.length})` 
                          : 'Add References'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (selectedPoints.length === outline.sections.reduce((acc, section) => acc + section.points.length, 0)) {
                            // If all points are selected, deselect all
                            setSelectedPoints([]);
                          } else {
                            // Select all points
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
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                  }}>
                    <Typography variant="h6">
                      Generated Script
                    </Typography>
                    
                    <SaveScriptButton 
                      topic={topic}
                      script={script}
                      outline={outline ? {
                        intro: outline.sections[0]?.title || 'Introduction',
                        topics: outline.sections.map(s => s.title),
                        conclusion: outline.sections[outline.sections.length - 1]?.title || 'Conclusion'
                      } : { intro: 'Introduction', topics: [topic], conclusion: 'Conclusion' }}
                      duration={duration}
                      memberCount={memberCount}
                      userId={user?.uid}
                      trends={trendsData || undefined}
                    />
                  </Box>
                  
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
                    {/* User Rating */}
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
                        
                        <Button 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          onClick={() => {
                            if (user?.uid) {
                              // Save the script and provide feedback
                              const scriptData = {
                                topic,
                                script,
                                outline: outline ? {
                                  intro: outline.sections[0]?.title || 'Introduction',
                                  topics: outline.sections.map(s => s.title),
                                  conclusion: outline.sections[outline.sections.length - 1]?.title || 'Conclusion'
                                } : { intro: 'Introduction', topics: [topic], conclusion: 'Conclusion' },
                                duration,
                                memberCount,
                                userId: user.uid,
                                rating: rating || 0,
                                aiRating: aiRating || null,
                                createdAt: new Date().toISOString(),
                                references: userReferences
                              };
                              
                              fetch('/api/scripts/save', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(scriptData),
                              })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('Failed to save script');
                                }
                                return response.json();
                              })
                              .then(() => {
                                // Show success message
                                alert('Script saved successfully!');
                              })
                              .catch(err => {
                                console.error('Error saving script:', err);
                                alert('Failed to save script. Please try again.');
                              });
                            } else {
                              alert('You need to be logged in to save scripts');
                            }
                          }}
                          startIcon={<AssignmentIcon />}
                          sx={{ mt: 2 }}
                        >
                          Save & Download Report
                        </Button>
                      </Paper>
                    </Grid>

                    {/* AI Rating */}
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

              {activeStep === 3 && outline && (
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
                        Step 4: Select Content Points for {outline.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose points you want to include in your script and how they should be presented
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArticleIcon />}
                        onClick={() => {
                          setReferenceDialogOpen(true);
                          // Don't change the active step
                        }}
                        sx={{ height: { xs: 36, sm: 32 } }}
                      >
                        Edit News ({userReferences.filter(ref => ref.type === 'article').length})
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LightbulbIcon />}
                        onClick={() => {
                          setFactsDialogOpen(true);
                          // Don't change the active step
                        }}
                        sx={{ height: { xs: 36, sm: 32 } }}
                      >
                        Edit Facts ({userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length})
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (selectedPoints.length === outline.sections.reduce((acc, section) => acc + section.points.length, 0)) {
                            // If all points are selected, deselect all
                            setSelectedPoints([]);
                          } else {
                            // Select all points
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
                      Generate Final Script
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
                    
                    <SaveScriptButton 
                      topic={topic}
                      script={script}
                      outline={outline ? {
                        intro: outline.sections[0]?.title || 'Introduction',
                        topics: outline.sections.map(s => s.title),
                        conclusion: outline.sections[outline.sections.length - 1]?.title || 'Conclusion'
                      } : { intro: 'Introduction', topics: [topic], conclusion: 'Conclusion' }}
                      duration={duration}
                      memberCount={memberCount}
                      userId={user?.uid}
                      trends={trendsData || undefined}
                    />
                  </Box>
                  
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
                    {/* User Rating */}
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
                        
                        <Button 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          onClick={() => {
                            if (user?.uid) {
                              // Save the script and provide feedback
                              const scriptData = {
                                topic,
                                script,
                                outline: outline ? {
                                  intro: outline.sections[0]?.title || 'Introduction',
                                  topics: outline.sections.map(s => s.title),
                                  conclusion: outline.sections[outline.sections.length - 1]?.title || 'Conclusion'
                                } : { intro: 'Introduction', topics: [topic], conclusion: 'Conclusion' },
                                duration,
                                memberCount,
                                userId: user.uid,
                                rating: rating || 0,
                                aiRating: aiRating || null,
                                createdAt: new Date().toISOString(),
                                references: userReferences
                              };
                              
                              fetch('/api/scripts/save', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(scriptData),
                              })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('Failed to save script');
                                }
                                return response.json();
                              })
                              .then(() => {
                                // Show success message
                                alert('Script saved successfully!');
                              })
                              .catch(err => {
                                console.error('Error saving script:', err);
                                alert('Failed to save script. Please try again.');
                              });
                            } else {
                              alert('You need to be logged in to save scripts');
                            }
                          }}
                          startIcon={<AssignmentIcon />}
                          sx={{ mt: 2 }}
                        >
                          Save & Download Report
                        </Button>
                      </Paper>
                    </Grid>

                    {/* AI Rating */}
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

              {/* News Articles */}
              {topic.trim().length >= 3 && (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      <ArticleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Latest News on &quot;{topic}&quot;
                    </Typography>
                    
                    <Tooltip title="Refresh news">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setNewsArticles([]);
                          setFeatureProgress(prev => Math.max(40, prev - 20));
                          // Re-trigger the useEffect
                          const newTopic = topic + ' ';
                          setTopic(newTopic.trim());
                        }}
                        disabled={newsLoading}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {newsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : newsError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {newsError}
                    </Alert>
                  ) : newsArticles.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No news articles found for this topic.
                    </Alert>
                  ) : (
                    <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: 2, p: 2 }}>
                      <Grid container spacing={2}>
                        {newsArticles.slice(0, 6).map((article, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                                <Typography variant="subtitle1" gutterBottom noWrap>
                                  {article.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                  {article.description || 'No description available'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                                </Typography>
                              </CardContent>
                              <Box sx={{ p: 1, pt: 0 }}>
                                <Link href={article.url} target="_blank" rel="noopener" underline="none">
                                  <Button size="small" fullWidth>Read More</Button>
                                </Link>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

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

      {/* Reference Collection Dialog */}
      <Dialog
        open={referenceDialogOpen}
        onClose={() => setReferenceDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <ArticleIcon sx={{ mr: 1 }} />
          Step 2: Select News Articles & References
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Select news articles and references that will be used to create your podcast script. You must select at least one.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Reference Type</InputLabel>
              <Select
                value={newReference.type}
                label="Reference Type"
                onChange={(e) => setNewReference({...newReference, type: e.target.value as 'article' | 'factoid' | 'stat'})}
              >
                <MenuItem value="article">News Article</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Article Title/Summary"
              placeholder="Summarize the article or paste its title"
              value={newReference.content}
              onChange={(e) => setNewReference({...newReference, content: e.target.value})}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="URL (optional)"
              placeholder="https://example.com/article"
              value={newReference.url || ''}
              onChange={(e) => setNewReference({...newReference, url: e.target.value})}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Source (optional)"
              placeholder="E.g., The New York Times"
              value={newReference.source || ''}
              onChange={(e) => setNewReference({...newReference, source: e.target.value})}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddReference}
                disabled={!newReference.content.trim()}
                sx={{ flex: 1 }}
              >
                Add Article Reference
              </Button>
              
              <Button 
                variant="contained"
                startIcon={aiGeneratingNews ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={generateNewsSummaries}
                disabled={aiGeneratingNews || topic.trim().length < 3}
                sx={{ flex: 1 }}
                color="secondary"
              >
                {aiGeneratingNews ? 'Generating...' : 'Generate AI News'}
              </Button>
            </Box>
            
            {newsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {newsError}
              </Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {userReferences.filter(ref => ref.type === 'article').length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Selected News References ({userReferences.filter(ref => ref.type === 'article').length})
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {userReferences
                  .filter(ref => ref.type === 'article')
                  .map((ref) => (
                    <Grid item xs={12} sm={6} md={4} key={ref.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3
                          }
                        }}
                      >
                        {ref.thumbnail ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={ref.thumbnail}
                            alt={ref.content}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ 
                            height: 140, 
                            bgcolor: ref.color || 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <ArticleIcon sx={{ fontSize: 60, color: 'white' }} />
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                          <Typography variant="subtitle1" gutterBottom component="div" noWrap title={ref.content}>
                            {ref.content}
                          </Typography>
                          {ref.description && (
                            <Typography variant="body2" color="text.secondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}>
                              {ref.description}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                          <Chip 
                            size="small" 
                            label={ref.source}
                            icon={<NewReleasesIcon />}
                            color="primary"
                            variant="outlined"
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveReference(ref.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ImageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                No news references added yet. Select at least one article to continue!
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setReferenceDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={() => {
              setReferenceDialogOpen(false);
              // Move to the facts dialog
              setFactsDialogOpen(true);
              // Update step only if they've added references
              if (userReferences.filter(ref => ref.type === 'article').length > 0) {
                setActiveStep(2);
              }
            }}
            variant="contained"
          >
            Continue to Unique Facts
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crazy Facts Dialog */}
      <Dialog
        open={factsDialogOpen}
        onClose={() => setFactsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: 'secondary.main', color: 'white', py: 2 }}>
          <LightbulbIcon sx={{ mr: 1 }} />
          Step 3: Add Unique Facts & Statistics
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Add interesting facts or statistics to make your podcast stand out (optional). These facts will be woven into your script.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Fact Type</InputLabel>
              <Select
                value={newReference.type}
                label="Fact Type"
                onChange={(e) => setNewReference({...newReference, type: e.target.value as 'article' | 'factoid' | 'stat'})}
              >
                <MenuItem value="factoid">Crazy Fact</MenuItem>
                <MenuItem value="stat">Statistic</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Fact or Statistic"
              placeholder={
                newReference.type === 'factoid'
                  ? 'E.g., Coffee beans are actually seeds from a fruit called a coffee cherry'
                  : 'E.g., 72% of podcast listeners are more likely to support brands they hear advertised'
              }
              value={newReference.content}
              onChange={(e) => setNewReference({...newReference, content: e.target.value})}
              multiline
              rows={3}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Source (optional)"
              placeholder={
                newReference.type === 'factoid'
                  ? 'E.g., National Geographic'
                  : 'E.g., Edison Research, 2023'
              }
              value={newReference.source || ''}
              onChange={(e) => setNewReference({...newReference, source: e.target.value})}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddReference}
                disabled={!newReference.content.trim()}
                sx={{ flex: 1 }}
              >
                Add Fact
              </Button>
              
              <Button 
                variant="contained"
                startIcon={aiGeneratingFacts ? <CircularProgress size={20} /> : <LightbulbIcon />}
                onClick={generateFacts}
                disabled={aiGeneratingFacts || topic.trim().length < 3}
                sx={{ flex: 1 }}
                color="secondary"
              >
                {aiGeneratingFacts ? 'Generating...' : 'Generate AI Facts'}
              </Button>
            </Box>
            
            {factsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {factsError}
              </Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Unique Facts ({userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length})
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                {userReferences
                  .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
                  .map((ref) => (
                    <Paper
                      key={ref.id}
                      elevation={3}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '6px',
                          height: '100%',
                          bgcolor: ref.color || 'secondary.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            bgcolor: ref.color || 'secondary.main',
                            mr: 2
                          }}
                        >
                          {ref.type === 'factoid' ? <BoltIcon /> : <PsychologyIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                            {ref.content}
                          </Typography>
                          {ref.source && (
                            <Chip
                              size="small"
                              label={ref.source}
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveReference(ref.id)}
                          color="error"
                          sx={{
                            ml: 1,
                            alignSelf: 'flex-start'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
              </Stack>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <LightbulbIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                No unique facts added yet. Adding facts is optional but can enhance your podcast!
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setFactsDialogOpen(false);
              // Go back to news if needed
              setReferenceDialogOpen(true);
              setActiveStep(1);
            }}
            color="inherit"
          >
            Back to News Articles
          </Button>
          
          <Button 
            onClick={() => {
              setFactsDialogOpen(false);
              // Move to content points selection
              setActiveStep(3);
            }}
            variant="contained"
          >
            Continue to Content Selection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 