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
  Divider,
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
  useTheme,
  useMediaQuery
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

// Define interface for the health topics info
interface ResourceLink {
  name: string;
  url: string;
}

interface HealthTopicInfo {
  title: string;
  description: string;
  resources: ResourceLink[];
}

interface HealthTopicsMap {
  [key: string]: HealthTopicInfo;
}

// Add health topics information content with proper typing, focusing on general mental health
const healthTopicsInfo: HealthTopicsMap = {
  "Mental Health": {
    title: "About Mental Health",
    description: "Mental health encompasses emotional, psychological, and social well-being. It affects how we think, feel, act, handle stress, relate to others, and make choices.",
    resources: [
      { name: "National Institute of Mental Health", url: "https://www.nimh.nih.gov/health/topics/mental-health" },
      { name: "Mental Health America", url: "https://www.mhanational.org/mental-health-basics" },
      { name: "World Health Organization", url: "https://www.who.int/health-topics/mental-health" }
    ]
  },
  "Seasonal Affective Disorder": {
    title: "About Seasonal Affective Disorder",
    description: "Seasonal affective disorder (SAD) is a type of depression related to seasonal changes, most commonly beginning in fall and continuing through winter months.",
    resources: [
      { name: "Mayo Clinic", url: "https://www.mayoclinic.org/diseases-conditions/seasonal-affective-disorder/symptoms-causes/syc-20364651" },
      { name: "American Psychiatric Association", url: "https://www.psychiatry.org/patients-families/seasonal-affective-disorder" }
    ]
  },
  "Sleep Hygiene": {
    title: "About Sleep Hygiene",
    description: "Sleep hygiene refers to healthy sleep habits that can improve your ability to fall asleep and stay asleep, which is vital to mental and physical health.",
    resources: [
      { name: "Sleep Foundation", url: "https://www.sleepfoundation.org/sleep-hygiene" },
      { name: "CDC - Sleep and Sleep Disorders", url: "https://www.cdc.gov/sleep/about_sleep/sleep_hygiene.html" }
    ]
  }
};

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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Define loadSavedResearches function before using it in useEffect
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

  // Load saved researches on component mount
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
        articles: [item.source || 'Unknown source']
      })) || [];
      
      // Add discussions as additional trends
      trendsData.discussions?.forEach((item: DiscussionItem) => {
        formattedTrends.push({
          title: item.title || 'Untitled discussion',
          traffic: item.score ? `${item.score}` : `${Math.floor(Math.random() * 1000) + 100}`,
          articles: [`From: ${item.source || 'Community'}`]
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

  const handleGetRecommendations = async () => {
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

  const handleTrendSelection = (trendTitle: string) => {
    setSelectedTrends(prev => {
      if (!prev) return [trendTitle];
      if (prev.includes(trendTitle)) {
        return prev.filter(t => t !== trendTitle);
      } else {
        return [...prev, trendTitle];
      }
    });
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
    handleMenuClose();
    setConfirmDeleteOpen(true);
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
    
    // Handle section headers with numbering
    let formatted = text.replace(/#+\s+(.*?)\s*$/gm, (match, title) => {
      // Check if title has numbers like "1." or "#"
      if (title.match(/^\d+\.\s+/) || title.includes('#')) {
        return `<h3 class="section-title">${title}</h3>`;
      }
      return `<h3>${title}</h3>`;
    });
    
    // Handle bold text with ** markers
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Add special styling for mental health terms
    const mentalHealthTerms = ['Mental Health', 'Wellbeing', 'Well-being', 'Wellness', 'Self-care', 'Mindfulness'];
    mentalHealthTerms.forEach(term => {
      const regex = new RegExp(`<strong>(${term})</strong>`, 'gi');
      formatted = formatted.replace(regex, '<strong class="highlight-term">$1</strong>');
    });
    
    // Handle list items
    formatted = formatted.replace(/- (.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
    formatted = formatted.replace(/<\/ul><ul>/g, '');
    
    // Handle paragraphs with better spacing
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    
    // Handle single line breaks within paragraphs
    formatted = formatted.replace(/\n(?!\n)/g, '<br />');
    
    return '<div class="recommendations-content"><p>' + formatted + '</p></div>';
  };

  // Add combined topics functionality
  const handleCombinedResearch = (topics: string[]) => {
    if (topics.length === 0) return;
    
    // Join topics with "and" for the search term
    const combinedTopic = topics.join(" and ");
    setTopic(combinedTopic);
    
    // Trigger research with slight delay to allow state update
    setTimeout(() => handleResearch(), 100);
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
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}>
          Wellness Research Generator
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, mb: 4 }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleResearch();
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Research Topic"
                    placeholder="Enter a topic to research..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    error={!!error && !topic}
                    helperText={!topic && error ? "Topic is required" : ""}
                    InputProps={{
                      onKeyDown: (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleResearch();
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleResearch}
                    disabled={loading || !topic}
                    startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? 'Searching...' : 'Generate Research'}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Suggested Topics:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {suggestedTopics.map((suggestedTopic) => (
                        <Chip
                          key={suggestedTopic}
                          label={suggestedTopic}
                          onClick={() => {
                            setTopic(suggestedTopic);
                            // Optional: auto-search when a suggested topic is clicked
                            // setTimeout(() => handleResearch(), 100);
                          }}
                          color={topic === suggestedTopic ? "primary" : "default"}
                          variant={topic === suggestedTopic ? "filled" : "outlined"}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.08)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Debug section to show when no trends are found but no error is shown */}
        {!error && trends.length === 0 && !loading && topic && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Enter a topic and click &quot;Generate Research&quot; to explore trending topics.
            </Alert>
          </Grid>
        )}

        {trends && trends.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Key Findings for &quot;{topic}&quot;
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGetRecommendations}
                  disabled={loading || !selectedTrends || selectedTrends.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? 'Analyzing...' : 'Analyze Selected Topics'}
                </Button>
              </Box>
              {selectedTrends && selectedTrends.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Selected Topics: {selectedTrends.length}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTrends.map((title) => (
                      <Chip 
                        key={title}
                        label={title}
                        color="primary" 
                        onDelete={() => handleTrendSelection(title)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              <Grid container spacing={2}>
                {trends.map((trend, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <CardContent sx={{ p: 2, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {trend.title}
                          </Typography>
                          <Chip 
                            label={`Traffic: ${trend.traffic}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedTrends?.includes(trend.title) || false}
                              onChange={() => handleTrendSelection(trend.title)}
                              color="primary"
                            />
                          }
                          label="Select for analysis"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                          Related Articles:
                        </Typography>
                        <Box sx={{ 
                          maxHeight: '120px', 
                          overflowY: 'auto',
                          pl: 1,
                          pr: 1,
                          borderRadius: 1,
                          bgcolor: 'background.paper'
                        }}>
                          {trend.articles && trend.articles.length > 0 ? (
                            trend.articles.map((article, articleIndex) => (
                              <Typography
                                key={articleIndex}
                                variant="body2"
                                sx={{
                                  py: 0.75,
                                  borderBottom: (trend.articles && articleIndex === trend.articles.length - 1) ? 0 : '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                {article}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No articles available
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 1, justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button 
                          size="small" 
                          variant={selectedTrends?.includes(trend.title) ? "contained" : "outlined"}
                          color="primary"
                          onClick={() => handleTrendSelection(trend.title)}
                        >
                          {selectedTrends?.includes(trend.title) ? "Selected" : "Select"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {recommendations && (
          <Grid item xs={12}>
            <Paper id="recommendations-section" sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  AI Recommendations
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!user}
                  sx={{ borderRadius: 2 }}
                >
                  Save Research
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ 
                '.recommendations-content': {
                  '& h3': {
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    mt: 3,
                    mb: 2,
                    color: theme.palette.primary.main,
                  },
                  '& .section-title': {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    mt: 4,
                    mb: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    pb: 1,
                  },
                  '& strong': {
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  },
                  '& .highlight-term': {
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    background: 'rgba(25, 118, 210, 0.08)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                  },
                  '& ul': {
                    pl: 2,
                    mb: 2,
                  },
                  '& li': {
                    mb: 1,
                    pl: 1,
                  },
                  '& p': {
                    mb: 2,
                    lineHeight: 1.6,
                  }
                }
              }}>
                <Typography
                  component="div"
                  sx={{ 
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{ __html: formatRecommendations(recommendations) }}
                />
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Add health context info card to recommendations section */}
        {recommendations && topic && healthTopicsInfo[topic] && (
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: 'rgba(25, 118, 210, 0.05)',
              border: '1px solid',
              borderColor: 'primary.light',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: '8px', 
                  height: '24px', 
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '4px',
                  mr: 2
                }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {healthTopicsInfo[topic].title}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ 
                mb: 2, 
                pl: 3, 
                borderLeft: `1px solid ${theme.palette.divider}`,
                paddingY: 1
              }}>
                {healthTopicsInfo[topic].description}
              </Typography>
              {healthTopicsInfo[topic].resources && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Additional Resources:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {healthTopicsInfo[topic].resources.map((resource: ResourceLink, index: number) => (
                      <Chip
                        key={index}
                        label={resource.name}
                        component="a"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ 
                          mb: 1, 
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Saved Research
            </Typography>
            
            {loadingSaved ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : savedResearches && savedResearches.length > 0 ? (
              <Grid container spacing={2}>
                {savedResearches && savedResearches.map((research) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={research.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-3px)'
                      }
                    }}
                    onClick={() => handleLoadResearch(research)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                            {research.topic}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuClick(e, research.id);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            size="small" 
                            label={`${research.selectedTrends?.length || 0} Topics`} 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 1, justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button 
                          color="primary" 
                          size="small"
                          startIcon={<FolderIcon fontSize="small" />}
                        >
                          Load Research
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                {user ? 'No saved research yet' : 'Please login to save and view research'}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Add UI for combined topics */}
        <Grid item xs={12}>
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Research Topics Combinations
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleCombinedResearch(['Mental Health', 'Seasonal Changes'])}
                startIcon={<AutoAwesomeIcon />}
                sx={{ mb: 1, borderRadius: 2 }}
              >
                Mental Health & Seasonal Changes
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleCombinedResearch(['Sleep Hygiene', 'Mental Health'])}
                startIcon={<AutoAwesomeIcon />}
                sx={{ mb: 1, borderRadius: 2 }}
              >
                Sleep Hygiene & Mental Health
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleCombinedResearch(['Stress Management', 'Work-Life Balance'])}
                startIcon={<AutoAwesomeIcon />}
                sx={{ mb: 1, borderRadius: 2 }}
              >
                Stress Management & Work-Life Balance
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Click on a combination to research related topics together
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Save Dialog */}
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
      
      {/* Research Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <MenuItem onClick={() => {
          const research = savedResearches.find(r => r.id === selectedResearchId);
          if (research) handleLoadResearch(research);
        }}>
          <FolderIcon fontSize="small" sx={{ mr: 1 }} />
          Load
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Confirm Delete Dialog */}
      <Dialog 
        open={confirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this research? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDeleteOpen(false)}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 1.5 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />

      {/* Add a retry button when there's an error */}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setError(null);
              if (topic) handleResearch();
            }}
            sx={{ borderRadius: 2, mx: 1 }}
          >
            Retry Search
          </Button>
          <Button 
            variant="outlined"
            onClick={() => {
              setTopic('');
              setTrends([]);
              setSelectedTrends([]);
              setRecommendations('');
              setError(null);
            }}
            sx={{ borderRadius: 2, mx: 1 }}
          >
            Start Over
          </Button>
        </Box>
      )}
    </Box>
  );
} 