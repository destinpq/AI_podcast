"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

interface ResearchData {
  keyFindings: string[];
  sources: string[];
}

export default function ResearchGenerator() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      setResearchData(data);
    } catch (error) {
      console.error('Error generating research:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
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
        >
          Generate Research
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Research Topic"
                  placeholder="Enter a topic to research..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {isLoading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1">Generating Research...</Typography>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" color="text.secondary">
                  {progress}% complete
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        )}

        {researchData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Research Results</Typography>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Findings
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {researchData.keyFindings?.map((finding: string, index: number) => (
                      <Chip
                        key={index}
                        label={finding}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Sources
                  </Typography>
                  <Stack spacing={1}>
                    {researchData.sources?.map((source: string, index: number) => (
                      <Typography key={index} variant="body2">
                        • {source}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 