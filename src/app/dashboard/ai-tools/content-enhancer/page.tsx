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
  Search as SearchIcon,
} from '@mui/icons-material';

export default function ContentEnhancer() {
  const [content, setContent] = useState('');
  const [enhancementType, setEnhancementType] = useState('seo');
  const [targetLevel, setTargetLevel] = useState('professional');
  const [tone, setTone] = useState('neutral');
  const [keywords, setKeywords] = useState('');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Content Enhancer
        </Typography>
        <Chip
          icon={<AutoAwesomeIcon />}
          label="AI Credits: 1000 remaining"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Content to Enhance"
                placeholder="Enter the content you want to enhance..."
                variant="outlined"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              <FormControl fullWidth>
                <InputLabel>Enhancement Type</InputLabel>
                <Select
                  label="Enhancement Type"
                  value={enhancementType}
                  onChange={(e) => setEnhancementType(e.target.value)}
                >
                  <MenuItem value="seo">SEO Optimization</MenuItem>
                  <MenuItem value="readability">Readability</MenuItem>
                  <MenuItem value="engagement">Engagement</MenuItem>
                  <MenuItem value="grammar">Grammar & Style</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Target Level</InputLabel>
                <Select
                  label="Target Level"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                >
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="academic">Academic</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Desired Tone</InputLabel>
                <Select
                  label="Desired Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="formal">Formal</MenuItem>
                  <MenuItem value="persuasive">Persuasive</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Target Keywords"
                placeholder="Enter keywords separated by commas..."
                variant="outlined"
                helperText="Keywords to optimize for (optional)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                >
                  Analyze
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AutoAwesomeIcon />}
                >
                  Enhance Content
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
              Content Analysis
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Readability Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    0%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={0} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Word Count
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    0
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={0} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    SEO Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    0%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={0} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 