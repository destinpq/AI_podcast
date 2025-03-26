"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Article as ArticleIcon,
  Science as ScienceIcon,
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Link as LinkIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';

interface ResearchData {
  keyFindings: string[];
  sources: string[];
  urls?: string[];
}

export default function ResearchGenerator() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [researchName, setResearchName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const handleGenerateResearch = async () => {
    setIsLoading(true);
    setProgress(0);
    setResearchData(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Make API call to generate research
      const response = await fetch('/api/research/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Failed to generate research');
      }

      const data = await response.json();
      
      // If the API doesn't provide URLs, generate some placeholder ones
      if (!data.urls) {
        data.urls = data.sources.map((source: string) => {
          // Generate a URL based on the source text - this is just for demo purposes
          // In a real application, these would come from the API
          const slug = source.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^\w-]/g, '');
          return `https://research.example.com/${slug}`;
        });
      }
      
      setResearchData(data);
    } catch (error) {
      console.error('Error generating research:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };
  
  const handleOpenSource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenSaveDialog = () => {
    setResearchName(topic);
    setSaveDialogOpen(true);
  };

  const handleSaveResearch = async () => {
    if (!researchData || !user) return;
    
    setSaveLoading(true);
    try {
      const researchDoc = {
        userId: user.uid,
        name: researchName || topic,
        topic,
        keyFindings: researchData.keyFindings,
        sources: researchData.sources,
        urls: researchData.urls,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'research'), researchDoc);
      console.log('Research saved successfully! Document ID:', docRef.id);
      
      // Show success message
      setSnackbarMessage('Research saved successfully!');
      setSnackbarOpen(true);
      
      // Close dialog
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Error saving research:', error);
      setSnackbarMessage('Error saving research');
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }
  };

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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Research Generator
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleGenerateResearch}
          disabled={isLoading || !topic}
          fullWidth={isMobile}
          sx={{ borderRadius: 2 }}
        >
          Generate Research
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Research Topic"
                  placeholder="Enter a topic to research..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1.5 }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {isLoading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Generating Research...
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {progress}% complete
              </Typography>
            </Paper>
          </Grid>
        )}

        {researchData && (
          <>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScienceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Key Findings
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {researchData.keyFindings?.map((finding: string, index: number) => (
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.primary.main, 
                              width: 28, 
                              height: 28,
                              mr: 1
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Finding {index + 1}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="body2">
                          {finding}
                        </Typography>
                      </CardContent>
                      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            // Copy finding to clipboard
                            navigator.clipboard.writeText(finding);
                            // Could add a snackbar notification here
                          }}
                          sx={{ fontSize: '0.75rem' }}
                          startIcon={<CopyIcon fontSize="small" />}
                        >
                          Copy
                        </Button>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => {
                            // Open a web search for this finding
                            const searchQuery = encodeURIComponent(`${topic} ${finding.substring(0, 40)}`);
                            window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank', 'noopener,noreferrer');
                          }}
                          sx={{ fontSize: '0.75rem' }}
                          endIcon={<LaunchIcon fontSize="small" />}
                        >
                          Learn More
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Sources
                </Typography>
                <LinkIcon sx={{ ml: 1, color: 'primary.main', fontSize: '1rem' }} />
              </Box>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Grid container spacing={2}>
                  {researchData.sources?.map((source: string, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 3,
                            bgcolor: 'action.hover'
                          }
                        }}
                        onClick={() => handleOpenSource(researchData.urls?.[index] || '#')}
                      >
                        <Box sx={{ display: 'flex' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'primary.main',
                              textDecoration: 'underline',
                              '&::before': {
                                content: '"•"',
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                display: 'inline-block',
                                width: '1em',
                                marginLeft: '-1em'
                              }
                            }}
                          >
                            {source}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleOpenSaveDialog}
                disabled={isLoading}
                fullWidth
              >
                Save Research
              </Button>
            </Grid>
          </>
        )}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Save Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)}
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
            InputProps={{
              sx: { borderRadius: 1.5 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setSaveDialogOpen(false)}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveResearch} 
            variant="contained" 
            color="primary"
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