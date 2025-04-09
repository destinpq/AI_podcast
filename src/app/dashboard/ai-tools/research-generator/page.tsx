'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Save as SaveIcon,
  Folder as FolderIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';

interface TrendData {
  title: string;
  traffic: string;
  articles: string[];
  imageUrl?: string;
}

interface SavedResearch {
  id: string;
  topic: string;
  trends?: TrendData[];
  selectedTrends?: string[];
  recommendations?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  userId?: string;
}

// Add interface definitions for API response types
interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt?: string;
}

interface DiscussionItem {
  title: string;
  source: string;
  url: string;
  score?: number;
}

interface TrendsApiResponse {
  news: NewsItem[];
  discussions: DiscussionItem[];
  relatedQueries: string[];
}

// Add suggested topics array with mental health as primary focus
const suggestedTopics = [
  "Mental Health",
  "Seasonal Affective Disorder",
  "Sleep Hygiene",
  "Mindfulness",
  "Stress Management",
  "Wellness Practices",
  "Time Management",
  "Work-Life Balance"
];

export default function ResearchGenerator() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedResearches, setSavedResearches] = useState<SavedResearch[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [researchName, setResearchName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResearchId, setSelectedResearchId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  const loadSavedResearches = useCallback(async () => {
    if (!user) return;
    
    setLoadingSaved(true);
    try {
      console.log('Loading saved researches for user:', user.uid);
      const q = query(
        collection(db, 'researchData'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const researches: SavedResearch[] = [];
      
      console.log('Found saved researches:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Research data:', data);
        
        researches.push({
          id: doc.id,
          topic: data.topic || '',
          trends: data.trends || [],
          selectedTrends: data.selectedTrends || [],
          recommendations: data.recommendations || '',
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
          userId: data.userId || ''
        } as SavedResearch);
      });
      
      // Sort by most recent first
      try {
        researches.sort((a, b) => {
          if (!a.updatedAt && !b.updatedAt) return 0;
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        });
      } catch (err) {
        console.error('Error sorting researches:', err);
        // If sort fails, just use the original order
      }
      
      setSavedResearches(researches);
    } catch (err) {
      console.error('Error loading saved researches:', err);
      setError('Failed to load saved researches');
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSavedResearches();
    }
    
    // Log when component mounts
    console.log('Research Generator component mounted');
  }, [user, loadSavedResearches]);

  const handleResearch = async () => {
    if (!topic) {
      setError('Please enter a research topic');
      return;
    }
    
    console.log('Research initiated for topic:', topic);
    setLoading(true);
    setError(null);
    
    try {
      // First, get Google Trends data
      console.log('Sending POST request to /api/research/trends with topic:', topic);
      const trendsResponse = await fetch('/api/research/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!trendsResponse.ok) {
        const errorText = await trendsResponse.text();
        console.error(`API returned status ${trendsResponse.status}:`, errorText);
        throw new Error(`Failed to fetch trends data: ${trendsResponse.status}`);
      }

      const trendsData: TrendsApiResponse = await trendsResponse.json();
      console.log('API response:', trendsData);
      
      // Check if API returned expected data structure
      if (!trendsData.news || !trendsData.discussions) {
        console.error('Invalid API response format:', trendsData);
        throw new Error('The API returned an unexpected data format');
      }
      
      // Transform the API response to match the expected format
      const formattedTrends = trendsData.news?.map((item: NewsItem) => ({
        title: item.title || 'Untitled',
        traffic: `${Math.floor(Math.random() * 1000) + 100}`,
        articles: [item.source || 'Unknown source'],
        imageUrl: item.url
      })) || [];
      
      // Add discussions as additional trends
      trendsData.discussions?.forEach((item: DiscussionItem) => {
        formattedTrends.push({
          title: item.title || 'Untitled discussion',
          traffic: item.score ? `${item.score}` : `${Math.floor(Math.random() * 1000) + 100}`,
          articles: [`From: ${item.source || 'Community'}`],
          imageUrl: item.url
        });
      });
      
      console.log('Formatted trends:', formattedTrends);
      
      // Only update state if we have data
      if (formattedTrends.length > 0) {
        setTrends(formattedTrends);
        setSelectedTrends([]); // Reset selections when new trends are fetched
        console.log('Successfully loaded trends:', formattedTrends);
      } else {
        console.warn('No trend data found for topic:', topic);
        setError('No trend data found for this topic. Please try a different search term.');
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendations = async () => {
    if (!selectedTrends || selectedTrends.length === 0) {
      setError('Please select at least one topic to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(''); // Clear previous recommendations

    try {
      const selectedTrendsData = trends.filter(trend => 
        selectedTrends.includes(trend.title)
      );

      console.log('Sending trends for analysis:', selectedTrendsData);

      if (selectedTrendsData.length === 0) {
        throw new Error('No selected trends found');
      }

      const recommendationsResponse = await fetch('/api/research/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic,
          trends: selectedTrendsData
        }),
      });

      if (!recommendationsResponse.ok) {
        const errorText = await recommendationsResponse.text();
        console.error('API error:', errorText);
        throw new Error(`Failed to get recommendations: ${recommendationsResponse.status}`);
      }

      const recommendationsData = await recommendationsResponse.json();
      console.log('Received recommendations:', recommendationsData);
      
      if (recommendationsData.recommendations) {
        // Pre-process recommendations to fix common formatting issues
        let processedRecommendations = recommendationsData.recommendations;
        
        // Remove unwanted hash characters
        processedRecommendations = processedRecommendations.replace(/^#\s*$/gm, '');
        
        // Ensure section headers are properly formatted
        processedRecommendations = processedRecommendations.replace(/(\d+)\.\s+(.*?):/g, '$1. **$2**:');

        // Make sure all list items have proper spacing
        processedRecommendations = processedRecommendations.replace(/^-([^\s])/gm, '- $1');
        
        // Ensure section titles are properly formatted with numbers
        processedRecommendations = processedRecommendations.replace(/^(\d+)\.\s+(.*?)$/gm, '### $1. $2');
        
        // Format "Key Areas" headers consistently
        processedRecommendations = processedRecommendations.replace(/^(Key\s+.*?\s+to\s+.*?):$/gim, '### $1');
        
        // Add extra formatting for mental health keywords
        const mentalHealthTerms = ['mental health', 'wellbeing', 'well-being', 'wellness', 'self-care', 'mindfulness'];
        mentalHealthTerms.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          processedRecommendations = processedRecommendations.replace(regex, `**${term}**`);
        });
        
        setRecommendations(processedRecommendations);
        
        // Scroll to recommendations section
        setTimeout(() => {
          const recommendationsElement = document.getElementById('recommendations-section');
          if (recommendationsElement) {
            recommendationsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        throw new Error('No recommendations received from API');
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the trends');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelection = (checked: boolean, title: string) => {
    setSelectedTrends(prev => 
      checked ? [...prev, title] : prev.filter(t => t !== title)
    );
  };
  
  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save research');
      return;
    }
    
    if (!topic || trends.length === 0) {
      setError('Please generate research data before saving');
      return;
    }
    
    console.log('Opening save dialog for topic:', topic);
    setOpenSaveDialog(true);
    setResearchName(topic);
  };
  
  const handleSaveConfirm = async () => {
    if (!user || !researchName) return;
    
    console.log('Saving research with name:', researchName);
    setSaveLoading(true);
    try {
      const researchData = {
        topic: researchName,
        trends,
        selectedTrends,
        recommendations,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Saving research data:', researchData);
      const docRef = await addDoc(collection(db, 'researchData'), researchData);
      console.log('Research saved with ID:', docRef.id);
      
      // Show success message
      setSnackbarMessage('Research saved successfully');
      setSnackbarOpen(true);
      
      // Reload saved researches
      loadSavedResearches();
      
      // Close dialog
      setOpenSaveDialog(false);
    } catch (err) {
      console.error('Error saving research:', err);
      setError('Failed to save research data');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleSaveCancel = () => {
    setOpenSaveDialog(false);
  };
  
  const handleLoadResearch = (research: SavedResearch) => {
    setTopic(research.topic || '');
    setTrends(research.trends || []);
    setSelectedTrends(research.selectedTrends || []);
    setRecommendations(research.recommendations || '');
    
    // Close menu if open
    handleMenuClose();
    
    // Show success message
    setSnackbarMessage('Research loaded successfully');
    setSnackbarOpen(true);
  };
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, researchId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedResearchId(researchId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedResearchId(null);
  };
  
  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedResearchId) return;
    
    try {
      await deleteDoc(doc(db, 'researchData', selectedResearchId));
      
      // Show success message
      setSnackbarMessage('Research deleted successfully');
      setSnackbarOpen(true);
      
      // Reload saved researches
      loadSavedResearches();
    } catch (err) {
      console.error('Error deleting research:', err);
      setError('Failed to delete research');
    } finally {
      setConfirmDeleteOpen(false);
      setSelectedResearchId(null);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Fix the recommendations display to handle markdown formatting better for mental health content
  const formatRecommendations = (text: string) => {
    if (!text) return '';

    let html = text;

    // **Headings**
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-primary-dark">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-2 text-primary-dark">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-primary-dark">$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold mt-3 mb-2 text-primary-dark">$1</h4>');

    // **Bold and Italic**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // **Blockquotes**
    html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r">$1</blockquote>');

    // **Lists** (Improved handling)
    // Convert markdown list markers to <li> tags
    html = html.replace(/^\s*\d+\.\s+(.*)/gm, '<li>$1</li>');
    html = html.replace(/^\s*[-\*]\s+(.*)/gm, '<li>$1</li>');

    // Wrap groups of <li> tags in <ol> or <ul>
    html = html.replace(/^(<li>.*<\/li>\s*)+/gm, (match) => {
      // A simple heuristic: if the first item looks like it started with a number, use <ol>
      const isOrdered = match.match(/^<li>\d+\./);
      const tag = isOrdered ? 'ol' : 'ul';
      const listClass = isOrdered ? 'list-decimal' : 'list-disc';
      // Remove list markers if they were kept in the <li> content (adjust regex above if needed)
      const content = match.replace(/<li>\d+\.\s*/g, '<li>'); 
      return `<${tag} class="my-3 ${listClass} pl-6">${content.replace(/<\/li>\s*<li>/g, '</li><li>')}</${tag}>\n`;
    });

    // **Paragraphs** (Split by double newline, then wrap non-tag lines)
    html = html.split('\n\n').map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      // Check if it's already a list, heading, or blockquote
      if (paragraph.match(/^<[houlb]|<\/?[houlb]/)) {
        return paragraph; // Keep existing HTML
      }
      // Wrap remaining lines in <p> tags
      return `<p class="my-3">${paragraph.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    // **Citations and Links**
    html = html.replace(/\((.*?,?\s*\d{4}.*?)\)/g, '<span class="text-gray-600">($1)</span>');
    html = html.replace(/\[(\d+)\]/g, '<sup class="bg-blue-100 px-1 rounded text-blue-800">[$1]</sup>');
    html = html.replace(/(https?:\/\/[^\s<>"']+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">$1</a>');
    html = html.replace(/DOI: (10\.\d{4,}\/[^\s<>"']+)/g, 'DOI: <a href="https://doi.org/$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');

    // **Special Formatting**
    html = html.replace(/Example(\s\d+)?:/g, '<div class="bg-gray-50 p-3 rounded-lg my-4 border-l-4 border-green-500"><span class="font-bold text-green-700">Example$1:</span>');
    html = html.replace(/Citation:/g, '<div class="text-sm text-gray-600 mt-2 border-t border-gray-200 pt-2"><span class="font-semibold">Citation:</span>');
    html = html.replace(/([A-Za-z]+, [A-Z]\. ?(?:[A-Z]\. ?)*\(\d{4}\)\..*?\.)/g, '<span class="block text-sm bg-gray-100 px-2 py-1 rounded font-mono my-1">$1</span>');

    // Clean up extra breaks potentially added by paragraph logic
    html = html.replace(/<p class=\"my-3\"><br><\/p>/g, '');
    html = html.replace(/<br>\s*<br>/g, '<br>'); 

    return html;
  };

  console.log('Current component state:', { 
    topic, 
    loading, 
    error, 
    trendsCount: trends?.length || 0,
    selectedTrendsCount: selectedTrends?.length || 0,
    recommendationsLength: recommendations?.length || 0
  });

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Research Generator
      </Typography>

      {/* Main Research Input Section */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Generate comprehensive research materials with detailed examples and proper citations. Enter a topic below or try one of these examples:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {["Waqf Boards in India", "Digital Mental Health Interventions", "Climate Adaptation Strategies", "Sustainable Finance Trends", "AI Ethics in Healthcare"].map((exampleTopic) => (
            <Chip
              key={exampleTopic}
              label={exampleTopic}
              onClick={() => setTopic(exampleTopic)}
              color="primary"
              variant="outlined"
              clickable
              sx={{ 
                borderRadius: '16px',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            />
          ))}
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="Research Topic"
              variant="outlined"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a specific topic, e.g., 'Mental Health in Remote Workplaces'"
              disabled={loading}
              helperText="Specific topics yield better research."
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleResearch}
              disabled={loading || !topic}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              sx={{ 
                height: 56,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {loading ? 'Generating...' : 'Generate Research'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Suggested Topics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Suggested Topics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {suggestedTopics.map((suggestedTopic) => (
            <Chip
              key={suggestedTopic}
              label={suggestedTopic}
              onClick={() => setTopic(suggestedTopic)}
              variant="outlined"
              clickable
              sx={{ 
                borderRadius: '16px',
                borderColor: '#bdbdbd',
                color: '#616161',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator for trends/recommendations */}
      {loading && !recommendations && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Fetching trends and generating recommendations...</Typography>
        </Box>
      )}
      
      {/* Trends Section with Image Cards */}
      {trends.length > 0 && !recommendations && (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Trending Topics Found
          </Typography>
          
          <Grid container spacing={2}>
            {trends.map((trend, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 1.5,
                    bgcolor: selectedTrends.includes(trend.title) ? 'action.selected' : 'transparent',
                    border: selectedTrends.includes(trend.title) ? '1px solid' : '1px solid rgba(0, 0, 0, 0.12)',
                    borderColor: selectedTrends.includes(trend.title) ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 3,
                      borderColor: selectedTrends.includes(trend.title) ? 'primary.dark' : 'rgba(0, 0, 0, 0.2)',
                    }
                  }}
                >
                  {trend.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={trend.imageUrl}
                      alt={trend.title}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, pt: trend.imageUrl ? 1.5 : 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedTrends.includes(trend.title)}
                          onChange={(e) => handleTrendSelection(e.target.checked, trend.title)}
                          sx={{ p: 0.5, mr: 0.5 }}
                        />
                      }
                      label={
                        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                          {trend.title}
                        </Typography>
                      }
                      sx={{ width: '100%', alignItems: 'flex-start', mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                      (Traffic: {trend.traffic})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleRecommendations} 
              disabled={loading || selectedTrends.length === 0}
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                px: 4
              }}
            >
              {loading ? 'Generating Recommendations...' : `Analyze ${selectedTrends.length} Selected Topic(s)`}
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Recommendations Section */}
      {recommendations && (
        <Card sx={{ mt: 3, overflow: 'visible', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Research Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Based on the selected trends, here are detailed recommendations for your research on <strong>{topic}</strong>.
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#f9f9f9', 
                  borderRadius: '8px',
                  maxHeight: '600px',
                  overflow: 'auto',
                  '& blockquote': {
                    borderLeft: '4px solid #3f51b5',
                    pl: 2,
                    py: 1,
                    my: 2,
                    bgcolor: 'rgba(63, 81, 181, 0.08)',
                    borderRadius: '0 4px 4px 0'
                  },
                  '& a': {
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  },
                  '& sup': {
                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                    padding: '0 4px',
                    borderRadius: '4px',
                    color: 'primary.main',
                    fontSize: '0.7rem'
                  },
                  '& .citation': {
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    margin: '4px 0'
                  },
                  '& h1, & h2, & h3, & h4': {
                    fontWeight: 'bold',
                    mt: 3,
                    mb: 1,
                    color: 'primary.dark'
                  },
                  '& h1': { fontSize: '1.5rem' },
                  '& h2': { fontSize: '1.3rem' },
                  '& h3': { fontSize: '1.15rem' },
                  '& h4': { fontSize: '1rem' },
                  '& ul, & ol': {
                    pl: 3,
                    mt: 1,
                    mb: 2
                  },
                  '& li': {
                    mb: 1
                  }
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: formatRecommendations(recommendations) }} />
              </Paper>
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<SaveIcon />} 
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saveLoading}
              sx={{ borderRadius: '8px' }}
            >
              {saveLoading ? 'Saving...' : 'Save Research'}
            </Button>
          </CardActions>
        </Card>
      )}
      
      {/* Saved Research Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Saved Research
        </Typography>
        {loadingSaved && <CircularProgress />}
        {!loadingSaved && savedResearches.length === 0 && (
          <Alert severity="info" variant="outlined" sx={{ borderColor: '#b3e5fc', bgcolor: '#e1f5fe' }}>
            You haven&apos;t saved any research yet. Generate and save research to find it here.
          </Alert>
        )}
        {!loadingSaved && savedResearches.length > 0 && (
          <Grid container spacing={3}>
            {savedResearches.map((research) => (
              <Grid item xs={12} sm={6} md={4} key={research.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 2,
                    transition: 'box-shadow 0.3s',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                        {research.topic}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuClick(e, research.id)}
                        sx={{ mt: -1, mr: -1 }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    <Chip 
                      label={`${research.selectedTrends?.length || 0} Topics`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {research.updatedAt ? research.updatedAt.toDate().toLocaleDateString() : 'N/A'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      startIcon={<FolderIcon />}
                      onClick={() => handleLoadResearch(research)}
                      sx={{ textTransform: 'none' }}
                    >
                      Load Research
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Menu for Saved Research Actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this saved research? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
      
      {/* Save Dialog (if needed) */}
      <Dialog 
        open={openSaveDialog} 
        onClose={handleSaveCancel}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Save Research</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Research Name"
            type="text"
            fullWidth
            variant="outlined"
            value={researchName}
            onChange={(e) => setResearchName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleSaveCancel}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveConfirm} 
            variant="contained" 
            disabled={saveLoading || !researchName}
            sx={{ borderRadius: 1.5 }}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 