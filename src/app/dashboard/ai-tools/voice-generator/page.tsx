"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  RecordVoiceOver as RecordVoiceOverIcon,
} from '@mui/icons-material';

interface VoiceSettings {
  pitch: number;
  speed: number;
  volume: number;
}

export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    pitch: 1,
    speed: 1,
    volume: 1,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGenerateVoice = async () => {
    setIsLoading(true);
    setProgress(0);
    setAudioUrl(null);

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

      // Make API call to generate voice
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, settings }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Failed to generate voice');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating voice:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleSettingChange = (setting: keyof VoiceSettings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Voice Generator
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RecordVoiceOverIcon />}
          onClick={handleGenerateVoice}
          disabled={isLoading || !text}
          fullWidth={isMobile}
        >
          Generate Voice
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
                  rows={4}
                  label="Text to Convert"
                  placeholder="Enter text to convert to speech..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Pitch"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Speed"
                  value={settings.speed}
                  onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Volume"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
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
                <Typography variant="subtitle1">Generating Voice...</Typography>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" color="text.secondary">
                  {progress}% complete
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        )}

        {audioUrl && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Generated Audio</Typography>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 