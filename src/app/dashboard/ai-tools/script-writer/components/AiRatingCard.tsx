'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

interface AiRatingProps {
  aiRating: {
    overall: number;
    categories: {
      content: number;
      structure: number;
      engagement: number;
      clarity: number;
      pacing: number;
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  } | null;
}

const AiRatingCard: React.FC<AiRatingProps> = ({ aiRating }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Evaluation
      </Typography>
      {aiRating ? (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Overall Score: {aiRating && typeof aiRating.overall === 'number' ? aiRating.overall.toFixed(1) : '3.5'}/5
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={aiRating && typeof aiRating.overall === 'number' ? (aiRating.overall / 5) * 100 : 70}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            {aiRating && aiRating.categories && Object.entries(aiRating.categories).map(([category, score]) => (
              <Grid item xs={6} key={category}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {category}: {typeof score === 'number' ? score.toFixed(1) : '3'}/5
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={typeof score === 'number' ? (score / 5) * 100 : 60}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>

          <Box>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              Strengths:
            </Typography>
            <List dense>
              {aiRating && aiRating.feedback && Array.isArray(aiRating.feedback.strengths) && aiRating.feedback.strengths.length > 0 ? (
                aiRating.feedback.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Good overall structure and flow" />
                </ListItem>
              )}
            </List>

            <Typography variant="subtitle2" color="info.main" gutterBottom sx={{ mt: 1 }}>
              Suggested Improvements:
            </Typography>
            <List dense>
              {aiRating && aiRating.feedback && Array.isArray(aiRating.feedback.improvements) && aiRating.feedback.improvements.length > 0 ? (
                aiRating.feedback.improvements.map((improvement, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LightbulbIcon color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={improvement} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LightbulbIcon color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Consider adding more personal anecdotes" />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default AiRatingCard;
