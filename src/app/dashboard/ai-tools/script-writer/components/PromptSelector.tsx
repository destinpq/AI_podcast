'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

interface PromptSelectorProps {
  topic: string;
  duration: number;
  memberCount: number;
  onPromptGenerate: (prompts: string[]) => void;
}

export default function PromptSelector({ topic, duration, memberCount, onPromptGenerate }: PromptSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('expert');

  useEffect(() => {
    setMounted(true);
  }, []);

  const promptStyles = [
    { value: 'expert', label: 'Expert Analysis', description: 'Authoritative, data-driven insights' },
    { value: 'storyteller', label: 'Storyteller', description: 'Engaging narrative with examples' },
    { value: 'educator', label: 'Educator', description: 'Clear, structured explanations' }
  ];

  const handleGeneratePrompts = async () => {
    if (!mounted) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          duration,
          memberCount,
          style: selectedStyle,
          format: {
            type: 'short_form',
            structure: {
              hook: { duration: 15, type: 'attention_grabber' },
              insight: { duration: 120, type: 'core_message' },
              takeaway: { duration: 45, type: 'actionable_conclusion' }
            }
          },
          requirements: {
            depth: 'expert',
            tone: 'authoritative',
            pacing: 'dynamic',
            engagement: 'high'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompts');
      }

      const data = await response.json();
      onPromptGenerate(data.prompts);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate prompts');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Prompt Style
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Choose a style that best fits your {duration}-minute expert insight on {topic}.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {promptStyles.map((style) => (
          <Grid item xs={12} sm={4} key={style.value}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                border: theme => selectedStyle === style.value ? 
                  `2px solid ${theme.palette.primary.main}` : 
                  '2px solid transparent'
              }}
              onClick={() => setSelectedStyle(style.value)}
            >
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {style.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {style.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleGeneratePrompts}
          disabled={loading || !mounted}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            'Generate Prompts'
          )}
        </Button>
      </Box>
    </Box>
  );
} 