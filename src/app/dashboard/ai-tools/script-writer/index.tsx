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
  Divider,
  Avatar,
  CardMedia,
  CardActions,
  Stack,
} from '@mui/material';
import { 
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  Check as CheckIcon,
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
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';

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

// Function to save script to Firestore
const saveScriptToFirestore = async (scriptData) => {
  try {
    const docRef = await addDoc(collection(db, 'scripts'), scriptData);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

// Function to save script as PDF
const saveScriptAsPDF = (scriptContent) => {
  const doc = new jsPDF();
  doc.text(scriptContent, 10, 10);
  doc.save('script.pdf');
};

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
  const [tabValue, setTabValue] = useState(0);
  const [trendsData, setTrendsData] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  } | null>(null);
  const [showWordnet, setShowWordnet] = useState(false);
  const [featureProgress, setFeatureProgress] = useState<number>(0);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
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

  // Initialize selectedReferences with all existing references by default
  useEffect(() => {
    setSelectedReferences(userReferences.map(ref => ref.id));
  }, [userReferences]);

  // Fetch news articles for the topic
  useEffect(() => {
    const fetchNews = async () => {
      if (topic.trim().length < 3) return;
      
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
      
      // Automatically fetch AI news and facts
      try {
        setAiGeneratingNews(true);
        const newsResponse = await fetch('/api/generate-news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });
        
        if (newsResponse.ok) {
          const data = await newsResponse.json();
          
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
        }
      } catch (err) {
        console.error('Error generating news:', err);
      } finally {
        setAiGeneratingNews(false);
      }
      
      // Also fetch AI facts
      try {
        setAiGeneratingFacts(true);
        const factsResponse = await fetch('/api/generate-facts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });
        
        if (factsResponse.ok) {
          const data = await factsResponse.json();
          
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
        }
      } catch (err) {
        console.error('Error generating facts:', err);
      } finally {
        setAiGeneratingFacts(false);
      }
      
      // Move to content points selection
      setActiveStep(3);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Modify the handleGenerateScript function to show selection UI instead of immediate generation
  const handleGenerateScript = async () => {
    if (!outline) {
      setError('No outline available');
      return;
    }

    if (selectedPoints.length === 0) {
      setError('Please select at least one content point in Step 4');
      return;
    }
    
    // Instead of showing confirmation dialog, show content selection popup
    setContentSelectionOpen(true);
    setTabValue(0); // Start on News Articles tab (index 0)
    
    // If we don't have enough content yet, fetch it
    if (userReferences.filter(ref => ref.type === 'article').length === 0) {
      await generateNewsSummaries();
    }
    
    if (userReferences.filter(ref => ref.type === 'factoid').length === 0) {
      await generateFacts();
    }
  };

  // Add a new state for content selection mode
  const [contentSelectionOpen, setContentSelectionOpen] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);

  // Function to toggle selection of references
  const toggleReferenceSelection = (id: string) => {
    setSelectedReferences(prev => 
      prev.includes(id) 
        ? prev.filter(refId => refId !== id)
        : [...prev, id]
    );
  };

  // Ensure generateNewsSummaries and generateFacts are defined or imported
  // If they are defined elsewhere, import them here

  // Correct the order of variable definitions
  const proceedWithScriptGeneration = async () => {
    // Close content selection UI
    setContentSelectionOpen(false);
    
    // Filter references to only use selected ones
    const filteredReferences = userReferences.filter(ref => 
      selectedReferences.includes(ref.id)
    );
    
    // Start the actual generation process
    setLoading(true);
    setError('');
    setAiRating(null);

    // Calculate target word count based on duration (100-150 words per minute)
    const minWordCount = duration * 100;
    const maxWordCount = duration * 150;

    // Initialize generation steps
    const steps = outline?.sections.map(section => ({
      title: section.title,
      status: 'pending' as const,
      progress: 0
    })) || [];
    setGenerationSteps(steps);

    try {
      // Generate each section in parallel
      const scriptPartPromises = outline?.sections.map((section, sectionIndex) => {
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
            const totalSections = outline?.sections.length || 1;
            const sectionFacts = filteredReferences
              .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
              .filter((_, index) => index % totalSections === sectionIndex);
            
            const sectionNews = filteredReferences
              .filter(ref => ref.type === 'article')
              .filter((_, index) => index % totalSections === sectionIndex);
            
            // Combine section-specific references
            const sectionReferences = [...sectionFacts, ...sectionNews];

            // Log the request payload for debugging
            console.log('API request payload:', {
              section,
              selectedPoints: selectedPoints.filter(p => p.sectionIndex === sectionIndex),
              duration: duration / totalSections,
              memberCount,
              trendsData,
              userReferences: sectionReferences,
            });

            // Generate the actual script part
            const response = await fetch('/api/script/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                outline: { title: outline?.title || topic, sections: [section] },
                selectedPoints: selectedPoints.filter(p => p.sectionIndex === sectionIndex),
                duration: duration / totalSections, // Duration per section
                memberCount, // Add memberCount to the API call
                personalExperiences: selectedPoints
                  .filter(p => p.promptType === 'life_experience' && p.elaboration)
                  .map(p => p.elaboration || ''),
                trendsData, // Pass trends data to the API
                userReferences: sectionReferences, // Include section-specific references
                targetWordCount: {
                  min: Math.floor(minWordCount / totalSections),
                  max: Math.ceil(maxWordCount / totalSections)
                }
              }),
            });

            // If response is not OK, attempt to get error message from response
            if (!response.ok) {
              const errorText = await response.text();
              console.error('API error response:', errorText);
              throw new Error(`Failed to generate script section: ${errorText || response.statusText}`);
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

            resolve(data.script || "");
          } catch (error) {
            console.error('Error generating script part:', error);
            reject(error);
          }
        });
      }) || [];

      // Wait for all sections to complete
      const scriptParts = await Promise.all(scriptPartPromises);
      const fullScript = scriptParts.join('\n\n[TRANSITION]\n\n');
      setScript(fullScript);

      // Get AI rating
      try {
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
      } catch (ratingError) {
        console.error('Error getting script rating:', ratingError);
        // Continue even if rating fails
      }

      // Move to last step
      setActiveStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
      console.error('Script generation error:', err);
    } finally {
      setLoading(false);
    }

    // Save to Firestore
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
      userId: user?.uid,
      rating: rating || 0,
      aiRating: aiRating || null,
      createdAt: new Date().toISOString(),
      references: userReferences
    };

    // Save to Firestore
    await saveScriptToFirestore(scriptData);

    // Save as PDF
    saveScriptAsPDF(script);
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
  
  // Add a function to generate placeholder images when thumbnails aren't available
  const getPlaceholderImage = (text: string, type: string = 'article') => {
    // Generate a random but consistent hash based on text
    const hash = Math.abs(text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000);
    
    // Use different placeholder services based on content type
    if (type === 'article') {
      return `https://source.unsplash.com/featured/300x200?${encodeURIComponent(topic)}&sig=${hash}`;
    } else {
      return `https://via.placeholder.com/300x200/4a90e2/ffffff?text=${encodeURIComponent(text.substring(0, 20))}`;
    }
  };

  // Update the generateNewsSummaries function to include placeholder images
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
        
        // Use our placeholder image function instead of the previous one
        const newArticles = data.news.map((article: {title: string, content: string}) => ({
          id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'article' as const,
          content: article.title,
          url: '',
          source: 'AI Generated',
          description: article.content,
          thumbnail: getPlaceholderImage(article.title, 'article'),
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

  // Add state for confirmation dialog
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);

  // Add state for article preview
  const [previewArticle, setPreviewArticle] = useState<UserReference | null>(null);

  // Add a function to handle article preview
  const handleArticlePreview = (event: React.MouseEvent, article: UserReference) => {
    event.stopPropagation(); // Prevent toggling selection
    setPreviewArticle(article);
  };

  // Add Article Preview Dialog component
  const ArticlePreviewDialog = () => (
    <Dialog
      open={!!previewArticle}
      onClose={() => setPreviewArticle(null)}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1400 }}
    >
      {previewArticle && (
        <>
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 2
          }}>
            <ArticleIcon />
            {previewArticle.content}
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {previewArticle.thumbnail && (
              <Box sx={{ width: '100%', height: 250, bgcolor: 'grey.100', position: 'relative' }}>
                <Box
                  component="img"
                  src={previewArticle.thumbnail}
                  alt={previewArticle.content}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    px: 2,
                    py: 0.5,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    borderTopLeftRadius: 8
                  }}
                >
                  <Typography variant="caption">
                    Source: {previewArticle.source}
                  </Typography>
                </Box>
              </Box>
            )}
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {previewArticle.content}
              </Typography>
              <Box sx={{ my: 2 }}>
                <Chip 
                  size="small" 
                  label={previewArticle.source}
                  color="primary"
                  icon={<ArticleIcon />}
                  sx={{ mr: 1 }}
                />
                <Chip 
                  size="small" 
                  label={new Date().toLocaleDateString()}
                  color="default"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body1" paragraph>
                {previewArticle.description || 'No detailed description available for this article.'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This article was found using AI-powered search to provide you with relevant and up-to-date content for your podcast.
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    if (previewArticle && !selectedReferences.includes(previewArticle.id)) {
                      toggleReferenceSelection(previewArticle.id);
                    }
                    setPreviewArticle(null);
                  }}
                  variant={selectedReferences.includes(previewArticle.id) ? "contained" : "outlined"}
                  color="primary"
                >
                  {selectedReferences.includes(previewArticle.id) 
                    ? "Selected for Podcast" 
                    : "Include in Podcast"}
                </Button>
                {previewArticle.url && (
                  <Button
                    href={previewArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Source
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setPreviewArticle(null)} color="inherit">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // Add state for prompt preview
  const [promptPreview, setPromptPreview] = useState<string>('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Add a function to generate the prompt preview
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

  // Find where the script is rendered and update the component to enhance section headers

  // Look for the script display part in the component
  // Replace or enhance the text display with formatted UI components for section headers

  // This might be in a section that renders the script content
  const formatScriptContent = (script: string) => {
    if (!script) return null;

    // Split the script into lines
    const lines = script.split('\n');
    
    // Initialize result array
    const formattedContent: React.ReactNode[] = [];
    
    // Track current index for key generation
    let currentIndex = 0;
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for section headers (like [INTRO], [Conclusion], etc.)
      if (line.match(/^\[(.*?)\]$/) || line.match(/^#+\s+(.*)$/)) {
        // It's a section header - extract the title
        const titleMatch = line.match(/^\[(.*?)\]$/) || line.match(/^#+\s+(.*)$/);
        const title = titleMatch ? (titleMatch[1] || titleMatch[0]) : line;
        
        // Add a separator if not the first header
        if (currentIndex > 0) {
          formattedContent.push(
            <Box key={`separator-${currentIndex}`} sx={{ my: 2 }}>
              <Divider />
            </Box>
          );
        }
        
        // Add the formatted header
        formattedContent.push(
          <Box 
            key={`header-${currentIndex++}`} 
            sx={{ 
              my: 2, 
              p: 1.5, 
              bgcolor: 'primary.main', 
              color: 'white',
              borderRadius: 1,
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AssignmentIcon />
            <Typography variant="h6" fontWeight="bold">
              {title.replace(/^#+\s+/, '')}
            </Typography>
          </Box>
        );
      } 
      // Check for speaker lines (e.g., "HOST: Hello")
      else if (line.match(/^([A-Z0-9 ]+):\s+(.*)/)) {
        const parts = line.match(/^([A-Z0-9 ]+):\s+(.*)/);
        if (parts && parts.length >= 3) {
          const speaker = parts[1];
          const text = parts[2];
          
          // Add the formatted speaker line
          formattedContent.push(
            <Box key={`line-${currentIndex++}`} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
              <Box 
                sx={{ 
                  minWidth: 80, 
                  mr: 2, 
                  p: 1, 
                  bgcolor: speaker.includes('HOST') ? 'secondary.main' : 'info.main', 
                  color: 'white',
                  borderRadius: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {speaker}
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  flex: 1,
                  p: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {text}
              </Typography>
            </Box>
          );
        } else {
          // Regular line
          formattedContent.push(
            <Typography key={`line-${currentIndex++}`} variant="body1" paragraph>
              {line}
            </Typography>
          );
        }
      } 
      // Empty lines add some spacing
      else if (line.trim() === '') {
        formattedContent.push(
          <Box key={`space-${currentIndex++}`} sx={{ height: '0.5rem' }} />
        );
      } 
      // Regular text line
      else {
        formattedContent.push(
          <Typography 
            key={`line-${currentIndex++}`} 
            variant="body1" 
            paragraph
            sx={{
              pl: 2,
              borderLeft: '3px solid',
              borderColor: 'divider'
            }}
          >
            {line}
          </Typography>
        );
      }
    }
    
    return (
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        {formattedContent}
      </Box>
    );
  };

  // Now replace the existing script display with this formatted version
  // Find where the script is displayed and replace it with formatScriptContent(script)

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
                                        <PersonIcon />
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
                      startIcon={<MicIcon />}
                    >
                      Review & Generate Final Script
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
                    {formatScriptContent(script)}
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
                                Overall Score: {aiRating && typeof aiRating.overall === 'number' ? aiRating.overall.toFixed(1) : '3.5'}/5
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={aiRating && typeof aiRating.overall === 'number' ? (aiRating.overall / 5) * 100 : 70}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              {aiRating && aiRating.categories && Object.entries(aiRating.categories).map(([category, score]) => (
                                <Grid item xs={6} key={category}>
                                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {category}: {typeof score === 'number' ? score.toFixed(1) : '3'}/5
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={typeof score === 'number' ? (score / 5) * 100 : 60}
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
                                {aiRating && aiRating.feedback && Array.isArray(aiRating.feedback.strengths) && aiRating.feedback.strengths.length > 0 ? (
                                  aiRating.feedback.strengths.map((strength, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={strength} />
                                    </ListItem>
                                  ))
                                ) : (
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <CheckCircleIcon color="success" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Good overall structure and flow" />
                                  </ListItem>
                                )}
                              </List>

                              <Typography variant="subtitle2" color="info.main" gutterBottom sx={{ mt: 1 }}>
                                Suggested Improvements:
                              </Typography>
                              <List dense>
                                {aiRating && aiRating.feedback && Array.isArray(aiRating.feedback.improvements) && aiRating.feedback.improvements.length > 0 ? (
                                  aiRating.feedback.improvements.map((improvement, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LightbulbIcon color="info" fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={improvement} />
                                    </ListItem>
                                  ))
                                ) : (
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <LightbulbIcon color="info" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Consider adding more personal anecdotes" />
                                  </ListItem>
                                )}
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
                                        <PersonIcon />
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
                      startIcon={<MicIcon />}
                    >
                      Review & Generate Final Script
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
                    {formatScriptContent(script)}
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
                                Overall Score: {aiRating && typeof aiRating.overall === 'number' ? aiRating.overall.toFixed(1) : '3.5'}/5
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={aiRating && typeof aiRating.overall === 'number' ? (aiRating.overall / 5) * 100 : 70}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              {aiRating && aiRating.categories && Object.entries(aiRating.categories).map(([category, score]) => (
                                <Grid item xs={6} key={category}>
                                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {category}: {typeof score === 'number' ? score.toFixed(1) : '3'}/5
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={typeof score === 'number' ? (score / 5) * 100 : 60}
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
                                {aiRating && aiRating.feedback && Array.isArray(aiRating.feedback.strengths) && aiRating.feedback.strengths.length > 0 ? (
                                  aiRating.feedback.strengths.map((strength, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={strength} />
                                    </ListItem>
                                  ))
                                ) : (
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <CheckCircleIcon color="success" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Good overall structure and flow" />
                                  </ListItem>
                                )}
                              </List>

                              <Typography variant="subtitle2" color="info.main" gutterBottom sx={{ mt: 1 }}>
                                Suggested Improvements:
                              </Typography>
                              <List dense>
                                {aiRating && aiRating.feedback && Array.isArray(aiRating.feedback.improvements) && aiRating.feedback.improvements.length > 0 ? (
                                  aiRating.feedback.improvements.map((improvement, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LightbulbIcon color="info" fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={improvement} />
                                    </ListItem>
                                  ))
                                ) : (
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <LightbulbIcon color="info" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Consider adding more personal anecdotes" />
                                  </ListItem>
                                )}
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
                  bgcolor: 'rgba(0, 0, 0, 0.85)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2, sm: 4 }
                }}>
                  <Paper sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    maxWidth: 950, 
                    width: '100%',
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: { xs: 1, sm: 1.5 },
                      position: 'relative',
                      height: 120
                    }}>
                      {/* Animated person reading animation */}
                      <motion.div
                        style={{ 
                          position: 'absolute',
                          width: '100%',
                          maxWidth: 300,
                          height: 120,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ 
                          position: 'relative', 
                          width: 100, 
                          height: 100,
                          bgcolor: 'primary.light',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: 3
                        }}>
                          <PersonIcon sx={{ fontSize: 60, color: 'white' }} />
                          
                          {/* Circular orbit for the book */}
                          <Box sx={{ 
                            position: 'absolute',
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            animation: 'spin 8s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}>
                            {/* Orbiting book */}
                            <motion.div
                              animate={{
                                rotate: 0,
                                scale: [1, 1.1, 1]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                repeatType: 'reverse'
                              }}
                              style={{
                                position: 'absolute',
                                top: -18,
                                left: 65,
                                background: theme.palette.secondary.main,
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                              }}
                            >
                              <MenuBookIcon sx={{ fontSize: 20, color: 'white' }} />
                            </motion.div>
                          </Box>

                          {/* Microphone to represent podcast */}
                          <motion.div
                            animate={{
                              y: [0, -5, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity
                            }}
                            style={{
                              position: 'absolute',
                              bottom: -15,
                              left: 50,
                              transform: 'translateX(-50%)',
                              background: theme.palette.primary.main,
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            <MicIcon sx={{ fontSize: 18, color: 'white' }} />
                          </motion.div>
                        </Box>
                      </motion.div>
                    </Box>

                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      Generating Your {memberCount > 1 ? `${memberCount}-Person ` : ''}Podcast Script
                    </Typography>

                    <Tabs 
                      value={tabValue} 
                      onChange={handleTabChange} 
                      variant="fullWidth" 
                      sx={{ 
                        mb: 1,
                        borderBottom: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Tab 
                        label="Script Progress" 
                        icon={<AssignmentIcon />} 
                        iconPosition="start"
                      />
                      <Tab 
                        label="News Articles" 
                        icon={<ArticleIcon />} 
                        iconPosition="start"
                        sx={{ color: userReferences.filter(ref => ref.type === 'article').length > 0 ? 'primary.main' : 'inherit' }}
                      />
                      <Tab 
                        label="Amazing Facts" 
                        icon={<BoltIcon />} 
                        iconPosition="start"
                        sx={{ color: userReferences.filter(ref => ref.type === 'factoid').length > 0 ? 'secondary.main' : 'inherit' }}
                      />
                    </Tabs>

                    <Box sx={{ 
                      flexGrow: 1, 
                      overflow: 'hidden',
                      display: 'flex',
                      minHeight: '350px',
                      maxHeight: '50vh'
                    }}>
                      <TabPanel value={tabValue} index={0}>
                        <Box sx={{ px: 1, height: '100%', overflow: 'auto' }}>
                          <Typography variant="body1" fontWeight={500} gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                            Finalizing your script...
                          </Typography>
                          
                          <Box sx={{ overflow: 'auto', pr: 1 }}>
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
                        </Box>
                      </TabPanel>

                      <TabPanel value={tabValue} index={1}>
                        <Box sx={{ height: '100%', overflow: 'auto' }}>
                          <Typography variant="body1" color="primary" fontWeight={500} sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                            News Articles Found ({userReferences.filter(ref => ref.type === 'article').length})
                          </Typography>
                          
                          <Grid container spacing={2}>
                            {userReferences
                              .filter(ref => ref.type === 'article')
                              .map((article) => (
                                <Grid item xs={12} md={6} key={article.id}>
                                  <Card 
                                    elevation={3}
                                    sx={{ 
                                      display: 'flex',
                                      height: '100%',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                      }
                                    }}
                                  >
                                    {article.thumbnail && (
                                      <CardMedia
                                        component="img"
                                        sx={{ width: 120, height: 'auto', objectFit: 'cover' }}
                                        image={article.thumbnail}
                                        alt={article.content}
                                      />
                                    )}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
                                      <CardContent sx={{ flex: '1 0 auto', py: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                          <Typography variant="subtitle1" component="div" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                            {article.content}
                                          </Typography>
                                          <IconButton 
                                            size="small" 
                                            onClick={(e) => handleArticlePreview(e, article)}
                                            sx={{ 
                                              bgcolor: 'action.hover',
                                              ml: 1,
                                              '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                            }}
                                          >
                                            <ArticleIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                        {article.description && (
                                          <Typography variant="body2" color="text.secondary" sx={{
                                            mt: 0.5,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                          }}>
                                            {article.description}
                                          </Typography>
                                        )}
                                        <Chip 
                                          size="small" 
                                          label={article.source}
                                          sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                          color={selectedReferences.includes(article.id) ? "primary" : "default"}
                                          variant={selectedReferences.includes(article.id) ? "filled" : "outlined"}
                                        />
                                      </CardContent>
                                    </Box>
                                  </Card>
                                </Grid>
                              ))}
                          </Grid>
                          
                          {userReferences.filter(ref => ref.type === 'article').length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <ArticleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                              <Typography color="text.secondary">
                                Searching for relevant news articles...
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TabPanel>

                      <TabPanel value={tabValue} index={2}>
                        <Box sx={{ height: '100%', overflow: 'auto' }}>
                          <Typography variant="body1" color="secondary" fontWeight={500} sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                            Amazing Facts Discovered ({userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length})
                          </Typography>
                          
                          <Stack spacing={2}>
                            {userReferences
                              .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
                              .map((fact) => {
                                const isSelected = selectedReferences.includes(fact.id);
                                return (
                                  <Paper
                                    key={fact.id}
                                    elevation={3}
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      position: 'relative',
                                      overflow: 'hidden',
                                      border: isSelected ? 2 : 0,
                                      borderColor: 'secondary.main',
                                      borderLeft: `6px solid ${fact.color || 'secondary.main'}`,
                                      transition: 'all 0.2s',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 6
                                      }
                                    }}
                                    onClick={() => toggleReferenceSelection(fact.id)}
                                  >
                                    {isSelected && (
                                      <Checkbox
                                        checked
                                        sx={{ 
                                          position: 'absolute', 
                                          top: 5, 
                                          right: 5, 
                                          zIndex: 1,
                                          color: 'secondary.main',
                                          bgcolor: 'rgba(255,255,255,0.8)',
                                          borderRadius: '50%'
                                        }}
                                      />
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                      <Avatar
                                        sx={{
                                          bgcolor: fact.color || 'secondary.main',
                                          mr: 2,
                                          width: { xs: 32, sm: 40 },
                                          height: { xs: 32, sm: 40 }
                                        }}
                                      >
                                        {fact.type === 'factoid' ? <BoltIcon sx={{ fontSize: { xs: 16, sm: 24 } }} /> : <PsychologyIcon sx={{ fontSize: { xs: 16, sm: 24 } }} />}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                          {fact.content}
                                        </Typography>
                                        {fact.source && (
                                          <Chip 
                                            variant="outlined"
                                            size="small"
                                            icon={<ArticleIcon sx={{ fontSize: '0.7rem' }} />}
                                            label={`Source: ${fact.source}`}
                                            color="secondary"
                                            sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  </Paper>
                                );
                              })}
                          </Stack>
                          
                          {userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <LightbulbIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                              <Typography color="text.secondary">
                                Discovering amazing facts about this topic...
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TabPanel>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      pt: 2, 
                      borderTop: '1px solid', 
                      borderColor: 'divider',
                      mt: 2
                    }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Weaving everything together to create your perfect podcast script...
                      </Typography>
                    </Box>
                  </Paper>
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
            Select news articles and references that will be used to create your podcast script. News articles are optional.
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

      {/* Confirmation Dialog */}
      <Dialog
        open={generateConfirmOpen}
        onClose={() => setGenerateConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <MicIcon />
          Ready to Generate Your Podcast Script
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Typography variant="body1" paragraph>
            You&apos;re about to generate a {memberCount > 1 ? `${memberCount}-person ` : ''}podcast script about <b>{topic}</b> with a duration of <b>{duration} minutes</b>.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your script will include:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ArticleIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    News Articles
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {userReferences.filter(ref => ref.type === 'article').length} articles selected
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LightbulbIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    Amazing Facts
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length} facts discovered
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    Content Points
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {selectedPoints.length} points selected out of {outline?.sections.reduce((acc, section) => acc + section.points.length, 0) || 0} available
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            This process may take a few minutes. You&apos;ll be able to see real-time progress, news articles, and facts being discovered during generation.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGenerateConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={proceedWithScriptGeneration} 
            variant="contained" 
            startIcon={<MicIcon />}
          >
            Generate Podcast Script
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Selection UI */}
      {contentSelectionOpen && (
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 }
        }}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            maxWidth: 950, 
            width: '100%',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: { xs: 1, sm: 1.5 },
              position: 'relative',
              height: { xs: 80, sm: 120 }
            }}>
              {/* Animated person reading animation */}
              <motion.div
                style={{ 
                  position: 'absolute',
                  width: '100%',
                  maxWidth: 300,
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ 
                  position: 'relative', 
                  width: { xs: 80, sm: 100 }, 
                  height: { xs: 80, sm: 100 },
                  bgcolor: 'primary.light',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: 3
                }}>
                  <PersonIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: 'white' }} />
                  
                  {/* Circular orbit for the book */}
                  <Box sx={{ 
                    position: 'absolute',
                    width: { xs: 120, sm: 150 },
                    height: { xs: 120, sm: 150 },
                    borderRadius: '50%',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    animation: 'spin 8s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}>
                    {/* Orbiting book */}
                    <motion.div
                      animate={{
                        rotate: 0,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: 'reverse'
                      }}
                      style={{
                        position: 'absolute',
                        top: -18,
                        left: 65,
                        background: theme.palette.secondary.main,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      <MenuBookIcon sx={{ fontSize: 20, color: 'white' }} />
                    </motion.div>
                  </Box>

                  {/* Microphone to represent podcast */}
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                    style={{
                      position: 'absolute',
                      bottom: -15,
                      left: 50,
                      transform: 'translateX(-50%)',
                      background: theme.palette.primary.main,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <MicIcon sx={{ fontSize: 18, color: 'white' }} />
                  </motion.div>
                </Box>
              </motion.div>
            </Box>

            <Typography 
              variant="h5" 
              gutterBottom 
              align="center"
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                fontWeight: 600,
                mb: { xs: 1, sm: 2 }
              }}
            >
              Select Content for Your {memberCount > 1 ? `${memberCount}-Person ` : ''}Podcast Script
            </Typography>
            
            <Typography 
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: { xs: 1, sm: 2 }, px: 2 }}
            >
              Choose the news articles and facts you want to include in your podcast script
            </Typography>

            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              sx={{ 
                mb: 1,
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Tab 
                label="News Articles" 
                icon={<ArticleIcon />} 
                iconPosition="start"
                sx={{ 
                  color: userReferences.filter(ref => ref.type === 'article').length > 0 ? 'primary.main' : 'inherit',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              />
              <Tab 
                label="Amazing Facts" 
                icon={<BoltIcon />} 
                iconPosition="start"
                sx={{ 
                  color: userReferences.filter(ref => ref.type === 'factoid').length > 0 ? 'secondary.main' : 'inherit',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              />
            </Tabs>

            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'hidden',
              display: 'flex',
              minHeight: { xs: '250px', sm: '350px' },
              maxHeight: { xs: '40vh', sm: '50vh' }
            }}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2, 
                    pb: 1, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography variant="body1" color="primary" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      News Articles Found ({userReferences.filter(ref => ref.type === 'article').length})
                    </Typography>
                    
                    <Button 
                      size="small" 
                      startIcon={aiGeneratingNews ? <CircularProgress size={16} /> : <RefreshIcon />}
                      onClick={generateNewsSummaries}
                      disabled={aiGeneratingNews}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {aiGeneratingNews ? 'Generating...' : 'Find More News'}
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {userReferences
                      .filter(ref => ref.type === 'article')
                      .map((article) => {
                        const isSelected = selectedReferences.includes(article.id);
                        return (
                          <Grid item xs={12} sm={6} md={6} key={article.id}>
                            <Card 
                              elevation={3}
                              sx={{ 
                                display: 'flex',
                                height: '100%',
                                transition: 'all 0.2s',
                                border: isSelected ? 2 : 0,
                                borderColor: 'primary.main',
                                position: 'relative',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: 6
                                }
                              }}
                              onClick={() => toggleReferenceSelection(article.id)}
                            >
                              {isSelected && (
                                <Checkbox
                                  checked
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 5, 
                                    right: 5, 
                                    zIndex: 1,
                                    color: 'primary.main',
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    borderRadius: '50%'
                                  }}
                                />
                              )}
                              {article.thumbnail ? (
                                <CardMedia
                                  component="img"
                                  sx={{ width: { xs: 80, sm: 120 }, height: 'auto', objectFit: 'cover' }}
                                  image={article.thumbnail}
                                  alt={article.content}
                                />
                              ) : (
                                <Box sx={{ 
                                  width: { xs: 80, sm: 120 }, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  bgcolor: 'primary.light',
                                  color: 'white'
                                }}>
                                  <ArticleIcon sx={{ fontSize: { xs: 32, sm: 48 } }} />
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
                                <CardContent sx={{ flex: '1 0 auto', py: 1.5 }}>
                                  <Typography variant="subtitle1" component="div" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    {article.content}
                                  </Typography>
                                  {article.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{
                                      mt: 0.5,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}>
                                      {article.description}
                                    </Typography>
                                  )}
                                  <Chip 
                                    size="small" 
                                    label={article.source}
                                    sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    color={isSelected ? "primary" : "default"}
                                    variant={isSelected ? "filled" : "outlined"}
                                  />
                                </CardContent>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                  </Grid>
                  
                  {userReferences.filter(ref => ref.type === 'article').length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      {aiGeneratingNews ? (
                        <>
                          <CircularProgress sx={{ mb: 2 }} />
                          <Typography color="text.secondary">
                            Searching for relevant news articles...
                          </Typography>
                        </>
                      ) : (
                        <>
                          <ArticleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography color="text.secondary">
                            No news articles found. Try generating more news.
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2, 
                    pb: 1, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography variant="body1" color="secondary" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Amazing Facts Discovered ({userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length})
                    </Typography>
                    
                    <Button 
                      size="small" 
                      startIcon={aiGeneratingFacts ? <CircularProgress size={16} /> : <LightbulbIcon />}
                      onClick={generateFacts}
                      disabled={aiGeneratingFacts}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {aiGeneratingFacts ? 'Generating...' : 'Find More Facts'}
                    </Button>
                  </Box>
                  
                  <Stack spacing={2}>
                    {userReferences
                      .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
                      .map((fact) => {
                        const isSelected = selectedReferences.includes(fact.id);
                        return (
                          <Paper
                            key={fact.id}
                            elevation={3}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              position: 'relative',
                              overflow: 'hidden',
                              border: isSelected ? 2 : 0,
                              borderColor: 'secondary.main',
                              borderLeft: `6px solid ${fact.color || 'secondary.main'}`,
                              transition: 'all 0.2s',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 6
                              }
                            }}
                            onClick={() => toggleReferenceSelection(fact.id)}
                          >
                            {isSelected && (
                              <Checkbox
                                checked
                                sx={{ 
                                  position: 'absolute', 
                                  top: 5, 
                                  right: 5, 
                                  zIndex: 1,
                                  color: 'secondary.main',
                                  bgcolor: 'rgba(255,255,255,0.8)',
                                  borderRadius: '50%'
                                }}
                              />
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Avatar
                                sx={{
                                  bgcolor: fact.color || 'secondary.main',
                                  mr: 2,
                                  width: { xs: 32, sm: 40 },
                                  height: { xs: 32, sm: 40 }
                                }}
                              >
                                {fact.type === 'factoid' ? <BoltIcon sx={{ fontSize: { xs: 16, sm: 24 } }} /> : <PsychologyIcon sx={{ fontSize: { xs: 16, sm: 24 } }} />}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  {fact.content}
                                </Typography>
                                {fact.source && (
                                  <Chip 
                                    variant="outlined"
                                    size="small"
                                    icon={<ArticleIcon sx={{ fontSize: '0.7rem' }} />}
                                    label={`Source: ${fact.source}`}
                                    color="secondary"
                                    sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })}
                  </Stack>
                  
                  {userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      {aiGeneratingFacts ? (
                        <>
                          <CircularProgress sx={{ mb: 2 }} />
                          <Typography color="text.secondary">
                            Discovering amazing facts about this topic...
                          </Typography>
                        </>
                      ) : (
                        <>
                          <LightbulbIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography color="text.secondary">
                            No facts discovered yet. Try generating more facts.
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </TabPanel>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pt: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              mt: 2,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {selectedReferences.length} items selected
                </Typography>
                {selectedReferences.length > 0 && (
                  <Chip 
                    label={`${selectedReferences.filter(id => 
                      userReferences.find(ref => ref.id === id)?.type === 'article'
                    ).length} news, ${selectedReferences.filter(id => 
                      ['factoid', 'stat'].includes(userReferences.find(ref => ref.id === id)?.type || '')
                    ).length} facts`} 
                    size="small" 
                    color="primary" 
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                <Button 
                  onClick={() => setContentSelectionOpen(false)} 
                  color="inherit"
                  sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={generatePromptPreview}
                  color="info"
                  sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Preview Prompt
                </Button>
                <Button 
                  onClick={() => {
                    // Initially select all items if none are selected
                    if (selectedReferences.length === 0) {
                      setSelectedReferences(userReferences.map(ref => ref.id));
                    }
                    proceedWithScriptGeneration();
                  }}
                  variant="contained" 
                  startIcon={<MicIcon />}
                  disabled={aiGeneratingNews || aiGeneratingFacts}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Generate With Selected Content
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
      <ArticlePreviewDialog />

      {/* Prompt Preview Dialog */}
      <Dialog
        open={showPromptPreview}
        onClose={() => setShowPromptPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            height: { xs: '90vh', sm: '80vh' },
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'info.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ArticleIcon />
          AI Prompt Preview
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box 
            sx={{ 
              p: 3, 
              fontFamily: 'monospace', 
              bgcolor: 'rgba(0,0,0,0.04)', 
              overflow: 'auto',
              flex: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {promptPreview.split('\n').map((line, index) => (
              <Box key={index} sx={{ pb: 1 }}>
                {line.startsWith('## ') ? (
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main', mt: 2 }}>
                    {line.substring(3)}
                  </Typography>
                ) : line.startsWith('# ') ? (
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'secondary.main', mb: 1 }}>
                    {line.substring(2)}
                  </Typography>
                ) : line.startsWith('- ') ? (
                  <Box sx={{ display: 'flex', pl: 2 }}>
                    <Box sx={{ pr: 1 }}>•</Box>
                    <Box>
                      {line.substring(2).split(/(\[Source: .*?\])/).map((part, i) => (
                        part.startsWith('[Source:') ? (
                          <Chip
                            key={i}
                            label={part.replace(/^\[Source: |\]$/g, '')} 
                            size="small" 
                            color="info"
                            variant="outlined"
                            sx={{ ml: 1, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2">{line}</Typography>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            This is a preview of how your selected content will be formatted in the AI prompt
          </Typography>
          <Button onClick={() => setShowPromptPreview(false)} color="inherit">
            Close
          </Button>
          <Button 
            onClick={() => {
              setShowPromptPreview(false);
              proceedWithScriptGeneration();
            }} 
            variant="contained" 
            color="success"
          >
            Looks Good, Generate!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 