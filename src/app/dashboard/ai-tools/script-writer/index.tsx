'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Chip, 
  Divider, 
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '@/providers/AuthProvider';
import SaveScriptButton from '@/components/SaveScriptButton';

// Types based on the API
interface Outline {
  title: string;
  sections: {
    title: string;
    points: string[];
  }[];
}

interface SelectedPoint {
  sectionTitle: string;
  point: string;
}

interface ScriptMetadata {
  totalDuration: number;
  sections: number;
  wordCount: number;
  trendsUsed: {
    newsCount: number;
    discussionsCount: number;
    relatedQueriesCount: number;
  };
}

export default function ScriptWriter() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [experience, setExperience] = useState('');
  const [personalExperiences, setPersonalExperiences] = useState<string[]>([]);
  const [duration, setDuration] = useState(15); // Default 15 min podcast
  const [outline, setOutline] = useState<Outline | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<SelectedPoint[]>([]);
  const [script, setScript] = useState('');
  const [metadata, setMetadata] = useState<ScriptMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Generate outline based on topic
  const generateOutline = async () => {
    if (!topic) {
      setError('Please enter a topic');
      return;
    }
    
    setOutlineLoading(true);
    setError(null);
    setOutline(null);
    setSelectedPoints([]);
    
    try {
      const response = await fetch('/api/script/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic, 
          duration
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outline');
      }
      
      setOutline(data);
    } catch (err) {
      console.error('Error generating outline:', err);
      setError('Failed to generate outline. Please try again.');
    } finally {
      setOutlineLoading(false);
    }
  };
  
  // Generate full script based on outline and selected points
  const generateScript = async () => {
    if (!outline) {
      setError('Please generate an outline first');
      return;
    }
    
    if (selectedPoints.length === 0) {
      setError('Please select at least one point to include in your script');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          outline,
          selectedPoints,
          duration,
          personalExperiences,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }
      
      setScript(data.script);
      setMetadata(data.metadata);
      setGenerationComplete(true);
    } catch (err) {
      console.error('Error generating script:', err);
      setError('Failed to generate script. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add personal experience
  const addExperience = () => {
    if (experience.trim()) {
      setPersonalExperiences([...personalExperiences, experience.trim()]);
      setExperience('');
    }
  };
  
  // Remove personal experience
  const removeExperience = (index: number) => {
    setPersonalExperiences(personalExperiences.filter((_, i) => i !== index));
  };
  
  // Toggle selected point
  const togglePoint = (sectionTitle: string, point: string) => {
    const pointExists = selectedPoints.some(
      p => p.sectionTitle === sectionTitle && p.point === point
    );
    
    if (pointExists) {
      setSelectedPoints(
        selectedPoints.filter(
          p => !(p.sectionTitle === sectionTitle && p.point === point)
        )
      );
    } else {
      setSelectedPoints([...selectedPoints, { sectionTitle, point }]);
    }
  };
  
  // Check if a point is selected
  const isPointSelected = (sectionTitle: string, point: string) => {
    return selectedPoints.some(
      p => p.sectionTitle === sectionTitle && p.point === point
    );
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        AI Script Writer
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!generationComplete ? (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 1: Define Your Podcast Topic
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Podcast Topic"
                  variant="outlined"
                  fullWidth
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Artificial Intelligence in Healthcare"
                  disabled={loading || outlineLoading}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Duration (min)</InputLabel>
                  <Select
                    value={duration}
                    label="Duration (min)"
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={loading || outlineLoading}
                  >
                    <MenuItem value={10}>10 minutes</MenuItem>
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={20}>20 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateOutline}
                  disabled={!topic || loading || outlineLoading}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  {outlineLoading ? <CircularProgress size={24} /> : 'Generate Outline'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {outline && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Step 2: Add Personal Experiences
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Personal Experience or Anecdote"
                  variant="outlined"
                  fullWidth
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., I once worked on an AI project that helped doctors diagnose rare diseases faster"
                  disabled={loading}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="outlined"
                  onClick={addExperience}
                  disabled={!experience.trim() || loading}
                >
                  Add Experience
                </Button>
              </Box>
              
              {personalExperiences.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Your Experiences:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {personalExperiences.map((exp, index) => (
                      <Chip
                        key={index}
                        label={exp}
                        onDelete={() => removeExperience(index)}
                        disabled={loading}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}
          
          {outline && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Step 3: Customize Your Outline
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the points you want to include in your script by clicking on them.
              </Typography>
              
              <Box>
                {outline.sections.map((section, sectionIndex) => (
                  <Accordion key={sectionIndex} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">
                        {section.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {section.points.map((point, pointIndex) => (
                          <Chip
                            key={pointIndex}
                            label={point}
                            onClick={() => togglePoint(section.title, point)}
                            color={isPointSelected(section.title, point) ? 'primary' : 'default'}
                            variant={isPointSelected(section.title, point) ? 'filled' : 'outlined'}
                            sx={{ m: 0.5 }}
                            disabled={loading}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={generateScript}
                disabled={selectedPoints.length === 0 || loading}
                sx={{ mt: 3 }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Script'}
              </Button>
            </Paper>
          )}
        </Box>
      ) : (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Your Generated Script: {topic}
              </Typography>
              
              <SaveScriptButton
                topic={topic}
                script={script}
                outline={outline ? {
                  intro: outline.sections[0]?.title || 'Introduction',
                  topics: outline.sections.map(s => s.title),
                  conclusion: outline.sections[outline.sections.length - 1]?.title || 'Conclusion'
                } : { intro: 'Introduction', topics: [topic], conclusion: 'Conclusion' }}
                duration={duration}
                memberCount={1}
                userId={user?.uid}
              />
            </Box>
            
            {metadata && (
              <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip label={`Duration: ${metadata.totalDuration} min`} />
                <Chip label={`Word Count: ${metadata.wordCount}`} />
                <Chip label={`Sections: ${metadata.sections}`} />
              </Box>
            )}
            
            <Divider sx={{ mb: 3 }} />
            
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                overflowY: 'auto',
                maxHeight: '500px'
              }}
            >
              {script}
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setGenerationComplete(false);
                setScript('');
                setMetadata(null);
              }}
            >
              Create Another Script
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
} 