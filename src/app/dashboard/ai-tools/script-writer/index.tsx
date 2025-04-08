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
    <Box sx={{ maxWidth: 'md', width: '100%', mx: 'auto' }}>
      <Typography variant="h6" gutterBottom fontWeight={600} mb={2}>
        Enter Topic Details
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={500}>
            Topic
          </Typography>
          <Button 
            size="small" 
            startIcon={<LightbulbIcon />}
            onClick={generateAITopics}
            disabled={loadingTopics || loading}
            variant="outlined"
            sx={{ 
              borderRadius: '20px', 
              textTransform: 'none',
              fontSize: '0.8rem'
            }}
          >
            {loadingTopics ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            {loadingTopics ? 'Finding topics...' : 'AI Topic Finder'}
          </Button>
        </Box>
        
        <TextField
          fullWidth
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your podcast topic..."
          disabled={loading}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '1rem'
            } 
          }}
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
                sx={{ 
                  mb: 1,
                  fontWeight: topic === trendingTopic ? 600 : 400,
                  boxShadow: topic === trendingTopic ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                  '& .MuiChip-label': {
                    color: topic === trendingTopic ? 'white' : 'inherit'
                  }
                }}
                variant={topic === trendingTopic ? "filled" : "outlined"}
                size="medium"
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Form fields in a responsive grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Mood Selector */}
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Podcast Mood
          </Typography>
          <Select
            fullWidth
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }
            }}
          >
            {moods.map((m) => (
              <SelectMenuItem key={m} value={m}>{m}</SelectMenuItem>
            ))}
          </Select>
        </Grid>

        {/* Duration Selector */}
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Duration (minutes)
          </Typography>
          <Select
            fullWidth
            value={duration.toString()}
            onChange={(e) => setDuration(e.target.value)}
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }
            }}
          >
            <SelectMenuItem value="15">15 minutes</SelectMenuItem>
            <SelectMenuItem value="30">30 minutes</SelectMenuItem>
            <SelectMenuItem value="45">45 minutes</SelectMenuItem>
            <SelectMenuItem value="60">60 minutes</SelectMenuItem>
          </Select>
        </Grid>

        {/* Number of Speakers */}
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Number of Speakers
          </Typography>
          <Select
            fullWidth
            value={memberCount.toString()}
            onChange={(e) => setMemberCount(e.target.value)}
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }
            }}
          >
            <SelectMenuItem value="1">1 Person</SelectMenuItem>
            <SelectMenuItem value="2">2 People</SelectMenuItem>
            <SelectMenuItem value="3">3 People</SelectMenuItem>
            <SelectMenuItem value="4">4 People</SelectMenuItem>
          </Select>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!topic.trim() || loading}
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ 
            minWidth: { xs: '100%', sm: 200 },
            borderRadius: '8px',
            textTransform: 'none',
            py: 1.2
          }}
        >
          {loading ? 'Generating...' : 'Continue'}
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

// Template card component
function TemplateCard({ 
  template, 
  selectedTemplate,
  setSelectedTemplate 
}: {
  template: string;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}) {
  const isSelected = selectedTemplate === template;
  
  // Define color mappings
  const colors = {
    Conversational: {
      light: '#e3f2fd',
      medium: '#bbdefb',
      dark: '#1976d2',
      border: '#1565c0'
    },
    Educational: {
      light: '#e8f5e9',
      medium: '#c8e6c9',
      dark: '#388e3c',
      border: '#2e7d32'
    },
    Interview: {
      light: '#f3e5f5',
      medium: '#e1bee7',
      dark: '#8e24aa',
      border: '#6a1b9a'
    },
    Narrative: {
      light: '#fff8e1',
      medium: '#ffecb3',
      dark: '#ffb300',
      border: '#ff8f00'
    },
    Tutorial: {
      light: '#e0f2f1',
      medium: '#b2dfdb',
      dark: '#00897b',
      border: '#00695c'
    }
  };
  
  // @ts-ignore - TypeScript doesn't know about our specific template names
  const color = colors[template] || colors.Conversational;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        borderRadius: 2,
        border: isSelected ? '2px solid' : '1px solid #e0e0e0',
        borderColor: isSelected ? color.border : '#e0e0e0',
        bgcolor: isSelected ? color.medium : color.light,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
        }
      }}
      onClick={() => setSelectedTemplate(template)}
    >
      <Box sx={{ 
        p: 1.5, 
        borderRadius: '50%', 
        display: 'flex',
        mb: 1,
        bgcolor: isSelected ? color.dark : color.medium,
        color: isSelected ? 'white' : 'inherit'
      }}>
        {template === 'Conversational' && <FormatQuoteIcon />}
        {template === 'Educational' && <LightbulbIcon />}
        {template === 'Interview' && <MicIcon />}
        {template === 'Narrative' && <TextSnippetIcon />}
        {template === 'Tutorial' && <TipsAndUpdatesIcon />}
      </Box>
      <Typography 
        variant="subtitle1" 
        align="center" 
        fontWeight={isSelected ? 700 : 500}
      >
        {template}
      </Typography>
    </Card>
  );
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Conversational');
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
    <Box 
      sx={{ 
        minHeight: '100vh',
        pb: 4,
        pt: { xs: 2, sm: 4 }
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            AI Script Writer
          </Typography>
          
          <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f8f9ff', borderRadius: 2, border: '1px solid #e0e4f6' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Script Templates
            </Typography>
            <Grid container spacing={3}>
              {['Conversational', 'Educational', 'Interview', 'Narrative', 'Tutorial'].map((template, index) => (
                <Grid item xs={6} sm={4} md={2.4} key={index}>
                  <TemplateCard
                    template={template}
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            connector={<ProgressConnector />}
            sx={{ 
              mb: 5,
              '& .MuiStepLabel-label': {
                fontWeight: 500,
                mt: 1,
                fontSize: '0.875rem'
              },
              '& .MuiStepIcon-root': {
                width: 35,
                height: 35,
                color: 'primary.main',
                '&.Mui-active': {
                  color: 'primary.main',
                },
                '&.Mui-completed': {
                  color: 'success.main',
                }
              }
            }}
          >
            <Step>
              <StepLabel>Enter Topic & Mood</StepLabel>
            </Step>
            <Step>
              <StepLabel>Review Prompts</StepLabel>
            </Step>
            <Step>
              <StepLabel>Final Review</StepLabel>
            </Step>
            <Step>
              <StepLabel>Generated Script</StepLabel>
            </Step>
            <Step>
              <StepLabel>Rate & Save</StepLabel>
            </Step>
          </Stepper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 4 }, 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}
          >
            {/* The form steps, script display, etc. */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                  Enter Topic Details
                </Typography>
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
              </Box>
            )}
            
            {/* Other steps that were already in the component */}
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
        </Paper>
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

    </Container>
    </Box>
    </ErrorBoundary>
  );
} 