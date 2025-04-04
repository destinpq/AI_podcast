'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timer as TimerIcon,
  Psychology as PsychologyIcon,
  LightbulbOutlined as LightbulbIcon
} from '@mui/icons-material';
import { GenerationStep } from '../types';

interface GenerationLoadingProps {
  memberCount: number;
  generationSteps: GenerationStep[];
  theme: unknown;
}

export default function GenerationLoading({
  memberCount,
  generationSteps
}: GenerationLoadingProps) {
  // Determine active step
  const activeStepIndex = generationSteps.findIndex(step => step.status === 'active');
  const hasErrorStep = generationSteps.some(step => step.status === 'error');
  const allStepsCompleted = generationSteps.every(step => step.status === 'completed');
  
  // Loading animations
  const thinkingQuotes = [
    "Crafting the perfect hook...",
    "Structuring engaging segments...",
    "Optimizing content flow...",
    "Finding the right tone...",
    "Balancing expert insights...",
    "Identifying key takeaways...",
    "Creating memorable moments..."
  ];
  
  // Get a random quote to display, but seed it with step index for consistency
  const getQuote = (index: number) => {
    return thinkingQuotes[index % thinkingQuotes.length];
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <Zoom in={true} timeout={400}>
        <Paper 
          elevation={6} 
          sx={{ 
            maxWidth: 600, 
            width: '90%', 
            maxHeight: '80vh',
            overflowY: 'auto',
            p: { xs: 2, sm: 3 },
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            {hasErrorStep ? (
              <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <ErrorIcon />
                <span>Error Occurred</span>
              </Box>
            ) : allStepsCompleted ? (
              <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckCircleIcon />
                <span>Generation Complete</span>
              </Box>
            ) : (
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <PsychologyIcon />
                <span>AI Working {memberCount > 1 ? `(${memberCount} speakers)` : ''}</span>
              </Box>
            )}
          </Typography>
          
          {activeStepIndex !== -1 && !hasErrorStep && !allStepsCompleted && (
            <Fade in={true}>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  mb: 3, 
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <TimerIcon fontSize="small" />
                {getQuote(activeStepIndex)}
              </Typography>
            </Fade>
          )}
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {generationSteps.map((step, i) => (
              <Grid item xs={12} key={i}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: step.status === 'active' 
                      ? 'rgba(25, 118, 210, 0.08)' 
                      : step.status === 'error'
                      ? 'rgba(211, 47, 47, 0.08)'
                      : 'background.paper',
                    borderColor: step.status === 'active' 
                      ? 'primary.main' 
                      : step.status === 'error'
                      ? 'error.main'
                      : 'divider'
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: step.status === 'active' 
                          ? 'primary.main' 
                          : step.status === 'error'
                          ? 'error.main'
                          : 'text.primary',
                      }}>
                        {step.status === 'completed' && <CheckCircleIcon color="success" fontSize="small" />}
                        {step.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                        {step.status === 'active' && <LightbulbIcon color="primary" fontSize="small" />}
                        {step.title}
                      </Typography>
                      
                      <Chip 
                        size="small" 
                        label={
                          step.status === 'completed' ? 'Complete' : 
                          step.status === 'error' ? 'Error' :
                          step.status === 'active' ? 'In Progress' : 'Pending'
                        }
                        color={
                          step.status === 'completed' ? 'success' : 
                          step.status === 'error' ? 'error' :
                          step.status === 'active' ? 'primary' : 'default'
                        }
                        variant={step.status === 'pending' ? 'outlined' : 'filled'}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant={step.status === 'active' ? 'indeterminate' : 'determinate'} 
                      value={
                        step.status === 'completed' ? 100 : 
                        step.status === 'error' ? 100 :
                        step.status === 'pending' ? 0 : 
                        step.progress
                      }
                      color={
                        step.status === 'completed' ? 'success' : 
                        step.status === 'error' ? 'error' :
                        'primary'
                      }
                      sx={{ 
                        height: 6, 
                        borderRadius: 1,
                        mb: 0.5
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 1, 
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            {hasErrorStep ? 
              "An error occurred during content generation. Please try again." : 
              allStepsCompleted ?
              "All steps completed successfully. Processing final results..." :
              "Please don't refresh or navigate away from this page while content is being generated."}
          </Typography>
        </Paper>
      </Zoom>
    </Box>
  );
}
