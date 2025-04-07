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
  MenuItem as SelectMenuItem,
  CircularProgress,
  Divider,
  StepConnector,
  stepConnectorClasses,
  styled,
  IconButton
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
import SimplifiedPromptDialog from './components/SimplifiedPromptDialog';
import MarkdownRenderer from './components/MarkdownRenderer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Chip from '@mui/material/Chip';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import MicIcon from '@mui/icons-material/Mic';
import CardMedia from '@mui/material/CardMedia';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import LinearProgress from '@mui/material/LinearProgress';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import Snackbar from '@mui/material/Snackbar';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

// Custom connector for stepper with progress visualization
const ProgressConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(to right, #3f51b5 50%, #e0e0e0 50%)',
      backgroundSize: '200% 100%',
      backgroundPosition: 'left bottom',
      transition: 'background-position 0.5s ease-in-out',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#3f51b5',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

function TopicSelector({ 
  topic, 
  setTopic, 
  mood,
  setMood,
  duration, 
  setDuration, 
  memberCount, 
  setMemberCount, 
  loading, 
  onSubmit 
}: {
  topic: string;
  setTopic: (topic: string) => void;
  mood: string;
  setMood: (mood: string) => void;
  duration: number;
  setDuration: (duration: string) => void;
  memberCount: number;
  setMemberCount: (count: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  // Define trending topics - in a real app these would come from an API
  const trendingTopics = [
    "AI and Future of Work",
    "Climate Tech Solutions",
    "Digital Mental Health",
    "Web3 Applications",
    "Remote Work Culture",
    "Sustainable Business"
  ];
  
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };
  
  const generateAITopics = () => {
    setLoadingTopics(true);
    // In a real app, this would call an API to get AI-generated topic suggestions
    // For now, we'll simulate a delay and use predefined topics
    setTimeout(() => {
      const aiTopics = [
        "Voice Technology Trends 2024",
        "Data Privacy in Social Media",
        "Neuroscience of Productivity",
        "Future of Renewable Energy",
        "Blockchain Beyond Crypto",
        "Digital Wellness Strategies"
      ];
      // In a real implementation, we would update the trending topics state
      // For this demo, we'll just select one of the AI topics
      handleTopicSelect(aiTopics[Math.floor(Math.random() * aiTopics.length)]);
      setLoadingTopics(false);
    }, 1500);
  };

  const moods = [
    "Informative",
    "Engaging",
    "Humorous",
    "Serious",
    "Inspirational",
    "Controversial",
    "Reflective"
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Enter Topic Details
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Topic
          </Typography>
          <Button 
            size="small" 
            startIcon={<LightbulbIcon />}
            onClick={generateAITopics}
            disabled={loadingTopics || loading}
          >
            {loadingTopics ? 'Finding topics...' : 'AI Topic Finder'}
          </Button>
        </Box>
        
        <TextField
          fullWidth
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your podcast topic..."
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        {/* Trending Topics Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon color="primary" fontSize="small" />
            Trending Topics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {trendingTopics.map((trendingTopic, index) => (
              <Chip
                key={index}
                label={trendingTopic}
                onClick={() => handleTopicSelect(trendingTopic)}
                clickable
                color={topic === trendingTopic ? "primary" : "default"}
                sx={{ mb: 1 }}
                icon={topic === trendingTopic ? <AddCircleIcon /> : undefined}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Mood Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Podcast Mood
        </Typography>
        <Select
          fullWidth
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          disabled={loading}
        >
          {moods.map((m) => (
            <SelectMenuItem key={m} value={m}>{m}</SelectMenuItem>
          ))}
        </Select>
      </Box>

      {/* Duration Selector */}
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
          <SelectMenuItem value="15">15 minutes</SelectMenuItem>
          <SelectMenuItem value="30">30 minutes</SelectMenuItem>
          <SelectMenuItem value="45">45 minutes</SelectMenuItem>
          <SelectMenuItem value="60">1 hour</SelectMenuItem>
        </Select>
      </Box>

      {/* Speaker Count Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Number of Speakers
        </Typography>
        <Select
          fullWidth
          value={memberCount.toString()}
          onChange={(e) => setMemberCount(e.target.value)}
          disabled={loading}
          displayEmpty
        >
          <SelectMenuItem value="1">Solo</SelectMenuItem>
          <SelectMenuItem value="2">2 People</SelectMenuItem>
          <SelectMenuItem value="3">3 People</SelectMenuItem>
          <SelectMenuItem value="4">4 People</SelectMenuItem>
        </Select>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!topic || !mood || loading}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}

// Define the structure for the generated prompts object
interface GeneratedPrompts {
  researchPrompt: string;
  structurePrompt: string;
  introPrompt: string;
  segmentPrompts: string[];
  factCheckPrompt: string;
  conclusionPrompt: string;
}

export default function ScriptWriter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State definitions
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('Engaging');
  const [duration, setDuration] = useState<number>(15);
  const [memberCount, setMemberCount] = useState<number>(2); // Keep for UI, though not sent to prompt gen
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [aiRating, setAiRating] = useState<AIRating | null>(null);
  // Update generatedPrompts state to hold the structured object or null
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompts | null>(null);
  const [userReferences, setUserReferences] = useState<UserReference[]>([]);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [drafts, setDrafts] = useState<Array<{id: string, title: string, date: string, content: string}>>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Define template structure
  const scriptTemplates = [
    {
      id: 'interview',
      title: 'Interview',
      description: 'Q&A format with expert guests',
      icon: <MicIcon />,
      color: '#3f51b5',
      image: '/templates/interview.svg'
    },
    {
      id: 'storytelling',
      title: 'Storytelling',
      description: 'Narrative-driven content',
      icon: <FormatQuoteIcon />,
      color: '#e91e63',
      image: '/templates/storytelling.svg'
    },
    {
      id: 'educational',
      title: 'Educational',
      description: 'Tutorial and learning format',
      icon: <TipsAndUpdatesIcon />,
      color: '#009688',
      image: '/templates/educational.svg'
    },
    {
      id: 'news',
      title: 'News Analysis',
      description: 'Current events discussion',
      icon: <TrendingUpIcon />,
      color: '#f44336',
      image: '/templates/news.svg'
    },
    {
      id: 'panel',
      title: 'Panel Discussion',
      description: 'Multiple expert perspectives',
      icon: <MicIcon />,
      color: '#673ab7',
      image: '/templates/panel.svg'
    }
  ];
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
    
    // Ensure any open dialogs are closed when component mounts
    setShowPromptDialog(false);
    setShowPreviewDialog(false);
    setShowDraftsDialog(false);
    
    // Create a keyboard event handler for Escape key to close all dialogs
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPromptDialog(false);
        setShowPreviewDialog(false);
        setShowDraftsDialog(false);
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    // Direct DOM manipulation to close any stuck dialogs (use with caution)
    setTimeout(() => {
      const closeButtons = document.querySelectorAll('[aria-label="close"]');
      closeButtons.forEach((button) => {
        if (button instanceof HTMLElement) {
          button.click();
        }
      });
    }, 500);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
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

  // Initialize with any saved drafts from local storage
  useEffect(() => {
    if (mounted) {
      const savedDrafts = localStorage.getItem('podcastScriptDrafts');
      if (savedDrafts) {
        try {
          setDrafts(JSON.parse(savedDrafts));
        } catch (e) {
          console.error('Error loading drafts:', e);
        }
      }
    }
  }, [mounted]);
  
  // Set up auto-save when script changes
  useEffect(() => {
    if (script && activeStep === 4) {
      // Clear previous timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set new timer to save after 3 seconds of inactivity
      const timer = setTimeout(() => {
        saveCurrentDraft(true);
      }, 3000);
      
      setAutoSaveTimer(timer);
      
      // Clean up timer on unmount
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [script, topic, activeStep]);
  
  const saveCurrentDraft = (isAutoSave = false) => {
    if (!script || !topic) return;
    
    const now = new Date();
    const draftId = `draft-${now.getTime()}`;
    const draftDate = now.toLocaleString();
    
    // Create new draft object
    const newDraft = {
      id: draftId,
      title: topic,
      date: draftDate,
      content: script
    };
    
    // Add to drafts state and persist to localStorage
    const updatedDrafts = [newDraft, ...drafts.slice(0, 9)]; // Keep max 10 drafts
    setDrafts(updatedDrafts);
    localStorage.setItem('podcastScriptDrafts', JSON.stringify(updatedDrafts));
    
    // Show notification
    setSnackbarMessage(isAutoSave ? 'Draft auto-saved' : 'Draft saved successfully');
    setSnackbarOpen(true);
  };
  
  const loadDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setTopic(draft.title);
      setScript(draft.content);
      setActiveStep(4); // Go to the script view
      setShowDraftsDialog(false);
      
      setSnackbarMessage('Draft loaded successfully');
      setSnackbarOpen(true);
    }
  };
  
  const deleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('podcastScriptDrafts', JSON.stringify(updatedDrafts));
    
    setSnackbarMessage('Draft deleted');
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

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

  // Define updated wizard steps
  const steps = [
    'Enter Topic & Mood',
    'Review Prompts',
    'Final Review',
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

  // Updated function to call the new prompts API and go to Review step
  const handleGeneratePrompts = async () => {
    setError(null);
    setLoading(true);
    console.log('Calling API to generate prompts with:', { topic, mood, duration });
    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mood, duration }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate prompts (status ${response.status})`
        );
      }

      const promptsData: GeneratedPrompts = await response.json();
      if (!promptsData || typeof promptsData !== 'object' || !promptsData.researchPrompt) {
        throw new Error('Invalid prompt data received from API.');
      }
      
      setGeneratedPrompts(promptsData);
      console.log('Received prompts:', promptsData);
      toast.success('Prompts generated successfully!');
      
      setActiveStep(1); // Go directly to Step 1 (Review Prompts)
      
    } catch (error) {
      console.error('Error generating prompts:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate prompts.';
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle generating the final script (now triggered from Review step)
  const handleGenerateFinalScript = async () => {
    if (!generatedPrompts) {
      setError('Cannot generate script without prompts.');
      toast.error('Error: Prompts are missing.');
      return;
    }

    setError(null);
    setLoading(true);
    setGenerationSteps([
      { title: 'Generating Introduction', status: 'active', progress: 10 },
      { title: 'Generating Segments', status: 'pending', progress: 0 },
      { title: 'Generating Conclusion', status: 'pending', progress: 0 },
      { title: 'Performing AI Analysis', status: 'pending', progress: 0 },
      { title: 'Formatting Script', status: 'pending', progress: 0 }
    ]);

    console.log('Calling API to generate final script with prompts:', generatedPrompts);

    try {
      // Prepare payload for the backend script service
      const payload = {
        prompts: generatedPrompts,
        // Include other optional fields if needed by backend 
        // (e.g., memberCount for speaker labels)
        memberCount: memberCount, 
        topic: topic, // Pass topic for context/logging
        duration: duration // Pass duration for context/logging
      };

      // Actual API call to generate the script
      const response = await fetch('/api/script/generate/short-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || `Script generation failed (status ${response.status})`;
        console.error('Script generation error:', errorMsg);
        throw new Error(errorMsg);
      }

      const scriptData = await response.json();
      
      // Validate the received data structure (basic)
      if (!scriptData || !scriptData.script || !scriptData.fullScript) {
         throw new Error('Invalid script data received from API.');
      }

      // Update state with actual script data from backend
      setScript(scriptData.fullScript);
      setAiRating(scriptData.rating || null); // Handle potentially missing rating
      console.log('Received final script data:', scriptData);
      toast.success('Script generated successfully!');

      setActiveStep(3); // Move to Step 3 (Generated Script view)

    } catch (error) {
      console.error('Error generating final script:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate final script.';
      setError(message);
      toast.error(`Error: ${message}`);
      setGenerationSteps(prev => prev.map(step => ({ // Show error in steps
        ...step,
        status: step.status === 'active' ? 'error' : step.status
      })));
    } finally {
      setLoading(false);
    }
  };

  // Calculate word and character counts
  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  
  const getCharCount = (text: string) => {
    if (!text) return 0;
    return text.length;
  };
  
  const wordCount = getWordCount(script);
  const charCount = getCharCount(script);
  
  // Calculate optimal range based on duration
  const minWordCount = duration * 130;
  const maxWordCount = duration * 150;
  
  // Calculate percentage for progress bar
  const wordCountPercentage = Math.min(100, Math.max(0, (wordCount / maxWordCount) * 100));
  
  // Determine if word count is within optimal range
  const isWordCountOptimal = wordCount >= minWordCount && wordCount <= maxWordCount;

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };
  
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };
  
  const exportOpen = Boolean(exportAnchorEl);
  
  const exportAsPDF = () => {
    // This would be implemented with a PDF generation library like jsPDF
    console.log('Exporting as PDF');
    // Show a mock download for demo purposes
    handleExportClose();
    alert('PDF download started');
  };
  
  const exportAsMarkdown = () => {
    // Create a Markdown version of the script
    const markdownContent = script.replace(/\[([^\]]+)\]/g, '## $1\n\n');
    
    // Create a Blob and download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-script.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    handleExportClose();
  };
  
  const exportAsDoc = () => {
    // This would be implemented with a DOCX generation library
    console.log('Exporting as DOCX');
    handleExportClose();
    alert('DOCX download started');
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

          {/* Templates Gallery */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Script Templates
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                pb: 1, 
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-track': {
                  borderRadius: 10,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 10,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              {scriptTemplates.map((template) => (
                <Card 
                  key={template.id}
                  sx={{ 
                    minWidth: 180,
                    maxWidth: 180,
                    cursor: 'pointer',
                    boxShadow: selectedTemplate === template.id ? 4 : 1,
                    transition: 'all 0.2s',
                    border: selectedTemplate === template.id ? `2px solid ${template.color}` : 'none',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <Box sx={{ position: 'relative', height: 100 }}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={template.image}
                      alt={template.title}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        // Fallback if image doesn't load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: !template.image ? template.color : 'transparent',
                        color: 'white'
                      }}
                    >
                      {!template.image && template.icon}
                    </Box>
                    {selectedTemplate === template.id && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <AddCircleIcon fontSize="small" />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {template.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          <Stepper 
            activeStep={activeStep} 
            connector={<ProgressConnector />}
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
                    mood={mood}
                    setMood={setMood}
                    duration={duration}
                    setDuration={handleDurationChange}
                    memberCount={memberCount}
                    setMemberCount={handleMemberCountChange}
                    loading={loading}
                    onSubmit={handleGeneratePrompts}
                  />
                )}

                {activeStep === 1 && generatedPrompts && (
                  <Box>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                      Review Generated Prompts
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Research Prompt */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6">Research Focus Prompt</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{generatedPrompts.researchPrompt}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {/* Structure Prompt */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6">Overall Structure Prompt</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{generatedPrompts.structurePrompt}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {/* Intro Prompt */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6">Introduction Prompt</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{generatedPrompts.introPrompt}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {/* Conclusion Prompt */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6">Conclusion Prompt</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{generatedPrompts.conclusionPrompt}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {/* Segment Prompts */}
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6">Segment Prompts ({generatedPrompts.segmentPrompts.length})</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                              {generatedPrompts.segmentPrompts.map((prompt, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Segment {index + 1}</Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{prompt}</Typography>
                                </Paper>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                       {/* Fact Check Prompt */}
                       <Grid item xs={12}>
                         <Card>
                           <CardContent>
                             <Typography variant="h6">Fact Check Prompt</Typography>
                             <Divider sx={{ my: 1 }} />
                             <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{generatedPrompts.factCheckPrompt}</Typography>
                           </CardContent>
                         </Card>
                       </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                        startIcon={<ArrowBackIcon />}
                      >
                        Back to Topic
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleGenerateFinalScript}
                        endIcon={<PlayArrowIcon />}
                      >
                        Generate Final Script
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                      Final Review
                    </Typography>
                    
                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                      <Typography variant="h6" gutterBottom>
                        Your Script is Ready to Generate
                      </Typography>
                      <Typography variant="body1" paragraph>
                        We&apos;ve prepared all the necessary elements for your podcast script based on your inputs.
                        The script will cover the topic &quot;{topic}&quot; and will be structured as a {duration}-minute
                        podcast with {memberCount} speaker{memberCount > 1 ? 's' : ''}.
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        The script will include:
                      </Typography>
                      
                      <ul style={{ marginBottom: '1rem' }}>
                        <li>A 15-second engaging hook to capture audience attention</li>
                        <li>A structured main section with expert insights</li>
                        <li>Data-backed talking points for authenticity</li>
                        <li>A strong 45-second conclusion with actionable takeaways</li>
                      </ul>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleGenerateFinalScript}
                          startIcon={<PlayArrowIcon />}
                          sx={{ px: 4 }}
                        >
                          Generate Final Script
                        </Button>
                      </Box>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(1)}
                        startIcon={<ArrowBackIcon />}
                      >
                        Back to Review
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeStep === 3 && script && (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">
                        Generated Script
                      </Typography>
                      
                      {/* Export Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportClick}
                      >
                        Export
                      </Button>
                      
                      {/* Save Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={() => saveCurrentDraft()}
                      >
                        Save Draft
                      </Button>
                      
                      {/* Drafts Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FolderOpenIcon />}
                        onClick={() => setShowDraftsDialog(true)}
                      >
                        My Drafts {drafts.length > 0 && `(${drafts.length})`}
                      </Button>
                      
                      {/* Export Menu */}
                      <Menu
                        anchorEl={exportAnchorEl}
                        open={exportOpen}
                        onClose={handleExportClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem onClick={exportAsPDF}>
                          <ListItemIcon>
                            <PictureAsPdfIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Export as PDF</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={exportAsDoc}>
                          <ListItemIcon>
                            <DescriptionIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Export as Word</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={exportAsMarkdown}>
                          <ListItemIcon>
                            <CodeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Export as Markdown</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>
                    
                    {/* Word Count Display */}
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      boxShadow: 1
                    }}>
                      <TextSnippetIcon color="primary" sx={{ mr: 1 }} />
                      <Box sx={{ minWidth: 180 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Word Count:
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={isWordCountOptimal ? 'success.main' : 'warning.main'}
                            fontWeight="bold"
                          >
                            {wordCount} words
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={wordCountPercentage} 
                          color={isWordCountOptimal ? "success" : "warning"}
                          sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Target: {minWordCount}-{maxWordCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {charCount} chars
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Paper 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 }, 
                      whiteSpace: 'pre-wrap', 
                      mb: 3,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      position: 'relative'
                    }}
                  >
                    {/* Play button for audio preview */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        zIndex: 1
                      }}
                    >
                      <PlayCircleOutlineIcon />
                    </IconButton>
                    
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
        handleGenerate={handleGeneratePrompts}
      />

      {/* Preview Dialog */}
      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIphoneIcon />
            <Typography variant="h6">Mobile Preview</Typography>
          </Box>
          <IconButton onClick={() => setShowPreviewDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            height: 600, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <Paper 
              elevation={3} 
              sx={{ 
                width: 320, 
                height: 550, 
                borderRadius: '24px', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* Podcast Player Header */}
              <Box sx={{ 
                bgcolor: '#3f51b5', 
                color: 'white', 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{topic || 'Your Podcast Title'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }}>
                    <PlayArrowIcon />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Duration: {duration}:00</Typography>
                    <Typography variant="body2">Speakers: {memberCount}</Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Podcast Content */}
              <Box sx={{ 
                p: 2, 
                flexGrow: 1,
                overflowY: 'auto',
                bgcolor: 'white'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Script Preview</Typography>
                {generatedPrompts && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Intro</Typography>
                    <Box sx={{ mb: 2 }}>
                      <MarkdownRenderer 
                        content={generatedPrompts.introPrompt.split('\n').slice(0, 3).join('\n')}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Main Content</Typography>
                    <Box sx={{ mb: 2 }}>
                      <MarkdownRenderer 
                        content={generatedPrompts.structurePrompt.split('\n').slice(0, 4).join('\n')}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Closing</Typography>
                    <Box sx={{ mb: 2 }}>
                      <MarkdownRenderer 
                        content={generatedPrompts.conclusionPrompt.split('\n').slice(0, 3).join('\n')}
                      />
                    </Box>
                  </>
                )}
              </Box>
              
              {/* Player Controls */}
              <Box sx={{ 
                p: 2, 
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="caption">Script Preview</Typography>
                <Typography variant="caption">{new Date().toLocaleDateString()}</Typography>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Drafts Dialog */}
      <Dialog
        open={showDraftsDialog}
        onClose={() => setShowDraftsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            <Typography variant="h6">Saved Drafts</Typography>
          </Box>
          <IconButton onClick={() => setShowDraftsDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {drafts.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {drafts.map((draft) => (
                <ListItem 
                  key={draft.id}
                  disablePadding
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => deleteDraft(draft.id, e)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => loadDraft(draft.id)}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={draft.title} 
                      secondary={`Saved on ${draft.date}`}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No saved drafts yet</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDraftsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Auto-save notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudDoneIcon fontSize="small" />
            <span>{snackbarMessage}</span>
          </Box>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'success.main',
          }
        }}
      />

    </Box>
    </ErrorBoundary>
  );
} 