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
      
      // Automatically fetch AI news and facts in background
      // Start fetching news articles
      fetch('/api/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      .then(response => response.json())
      .then(data => {
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
      })
      .catch(err => console.error('Error generating news:', err));
      
      // Start fetching facts
      fetch('/api/generate-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      .then(response => response.json())
      .then(data => {
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
      })
      .catch(err => console.error('Error generating facts:', err));
      
      // Skip to content selection step directly
      setActiveStep(3);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!outline) {
      setError('No outline available');
      return;
    }

    // News articles are now optional, so we removed the check
    // const hasArticles = userReferences.filter(ref => ref.type === 'article').length > 0;
    
    // if (!hasArticles) {
    //   setError('Please select at least one news article in Step 2');
    //   setReferenceDialogOpen(true);
    //   setActiveStep(1);
    //   return;
    // }
    
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Podcast Script Writer
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box mt={2}>
          <TextField
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Number of Members</InputLabel>
                  <Select
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                  >
                    {MEMBER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateOutline}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Outline'}
            </Button>
          </Box>

          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
        </Box>
      )}

      {activeStep === 1 && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            News Articles
          </Typography>

          {newsLoading && <CircularProgress />}
          {newsError && <Alert severity="error">{newsError}</Alert>}

          {newsArticles.length > 0 && (
            <Grid container spacing={2}>
              {newsArticles.map((article, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      alt={article.title}
                      height="140"
                      image={article.urlToImage || 'https://via.placeholder.com/600x400?text=No+Image'}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {article.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" href={article.url} target="_blank">
                        Read More
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveStep(2)}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Unique Facts
          </Typography>

          {userReferences
            .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
            .map((fact, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: fact.color,
                  color: 'white',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {fact.content.includes('%') || fact.content.match(/\d+(\.\d+)?%/) ? (
                    <PsychologyIcon />
                  ) : fact.content.toLowerCase().includes('research') || fact.content.toLowerCase().includes('study') ? (
                    <BookmarkIcon />
                  ) : fact.content.includes('$') || fact.content.match(/\$\d+/) || 
                    fact.content.toLowerCase().includes('billion') || 
                    fact.content.toLowerCase().includes('million') ? (
                    <PublicIcon />
                  ) : fact.content.includes('"') || fact.content.includes('"') || fact.content.includes('"') ? (
                    <FormatQuoteIcon />
                  ) : (
                    <BoltIcon />
                  )}
                </Avatar>
                <Typography variant="body1">{fact.content}</Typography>
              </Paper>
            ))}

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveStep(3)}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 3 && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Choose Content Points
          </Typography>

          {outline && (
            <Box>
              {outline.sections.map((section, sectionIndex) => (
                <Box key={sectionIndex} mb={2}>
                  <Typography variant="h6">{section.title}</Typography>
                  <List>
                    {section.points.map((point, pointIndex) => (
                      <ListItem
                        key={pointIndex}
                        button
                        selected={selectedPoints.some(
                          p => p.sectionIndex === sectionIndex && p.pointIndex === pointIndex
                        )}
                        onClick={() => handlePointSelect(sectionIndex, pointIndex, point)}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedPoints.some(
                              p => p.sectionIndex === sectionIndex && p.pointIndex === pointIndex
                            )}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText primary={point} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          )}

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateScript}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Script'}
            </Button>
          </Box>

          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
        </Box>
      )}

      {activeStep === 4 && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Generated Script
          </Typography>

          {script && (
            <Box>
              <Typography variant="body1" whiteSpace="pre-line">
                {script}
              </Typography>

              <Box mt={2}>
                <SaveScriptButton script={script} />
              </Box>
            </Box>
          )}

          {aiRating && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                AI Rating
              </Typography>

              <Box display="flex" alignItems="center">
                <Rating value={aiRating.overall} readOnly precision={0.5} />
                <Typography variant="body1" ml={1}>
                  {aiRating.overall.toFixed(1)}
                </Typography>
              </Box>

              <Box mt={2}>
                <Typography variant="h6">Categories</Typography>
                <Box display="flex" justifyContent="space-around">
                  {Object.entries(aiRating.categories).map(([category, rating]) => (
                    <Box key={category} textAlign="center">
                      <Typography variant="body1">{category}</Typography>
                      <Rating value={rating} readOnly precision={0.5} />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box mt={2}>
                <Typography variant="h6">Feedback</Typography>
                <Box display="flex" justifyContent="space-around">
                  <Box>
                    <Typography variant="body1">Strengths</Typography>
                    <List>
                      {aiRating.feedback.strengths.map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box>
                    <Typography variant="body1">Improvements</Typography>
                    <List>
                      {aiRating.feedback.improvements.map((improvement, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <LightbulbIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={improvement} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Box mt={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
          disabled={activeStep === 0}
        >
          Back
        </Button>
      </Box>
    </Container>
  );
} 