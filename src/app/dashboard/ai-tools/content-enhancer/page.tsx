"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
  Chip,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

export default function ContentEnhancer() {
  const [content, setContent] = useState('');
  const [enhancementType, setEnhancementType] = useState('grammar');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleEnhanceContent = async () => {
    setIsLoading(true);
    setProgress(0);
    setEnhancedContent(null);
    setSuggestions([]);

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

      // Make API call to enhance content
      const response = await fetch('/api/content/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, enhancementType }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Failed to enhance content');
      }

      const data = await response.json();
      setEnhancedContent(data.enhancedContent);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error enhancing content:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Content Enhancer
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleEnhanceContent}
          disabled={isLoading || !content}
        >
          Enhance Content
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Content to Enhance"
                  placeholder="Enter your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Enhancement Type</InputLabel>
                  <Select
                    label="Enhancement Type"
                    value={enhancementType}
                    onChange={(e) => setEnhancementType(e.target.value)}
                    disabled={isLoading}
                  >
                    <MenuItem value="grammar">Grammar & Spelling</MenuItem>
                    <MenuItem value="clarity">Clarity & Readability</MenuItem>
                    <MenuItem value="tone">Tone & Style</MenuItem>
                    <MenuItem value="seo">SEO Optimization</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {isLoading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1">Enhancing Content...</Typography>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" color="text.secondary">
                  {progress}% complete
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        )}

        {enhancedContent && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Enhanced Content</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {enhancedContent}
                </Typography>
                {suggestions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Suggestions
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 