'use client';

import React from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material';
import { DURATION_OPTIONS, MEMBER_OPTIONS } from '../types';

interface ScriptFormStepProps {
  topic: string;
  setTopic: (topic: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  memberCount: number;
  setMemberCount: (count: number) => void;
  loading: boolean;
  featureProgress: number;
  handleGenerateOutline: () => void;
  isMobile: boolean;
}

const ScriptFormStep: React.FC<ScriptFormStepProps> = ({
  topic,
  setTopic,
  duration,
  setDuration,
  memberCount,
  setMemberCount,
  loading,
  featureProgress,
  handleGenerateOutline,
  isMobile
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 1 }
      }}>
        <TextField
          fullWidth
          placeholder="Enter your podcast topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            // Feature progress is handled by the parent component
          }}
          disabled={loading}
          sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            '& .MuiInputBase-root': {
              height: { xs: 48, sm: 56 }
            }
          }}
        />
        <FormControl 
          fullWidth 
          sx={{ 
            minWidth: { xs: '100%', sm: 150 },
            '& .MuiInputBase-root': {
              height: { xs: 48, sm: 56 }
            }
          }}
        >
          <InputLabel>Duration</InputLabel>
          <Select
            value={duration}
            label="Duration"
            onChange={(e) => {
              setDuration(e.target.value as number);
              // Feature progress is handled by the parent component
            }}
            disabled={loading}
          >
            {DURATION_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl 
          fullWidth 
          sx={{ 
            minWidth: { xs: '100%', sm: 150 },
            '& .MuiInputBase-root': {
              height: { xs: 48, sm: 56 }
            }
          }}
        >
          <InputLabel>Members</InputLabel>
          <Select
            value={memberCount}
            label="Members"
            onChange={(e) => {
              setMemberCount(e.target.value as number);
              // Feature progress is handled by the parent component
            }}
            disabled={loading}
          >
            {MEMBER_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleGenerateOutline}
          disabled={loading || !topic.trim()}
          fullWidth={isMobile}
          sx={{ 
            height: { xs: 48, sm: 56 },
            mt: { xs: 1, sm: 0 }
          }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            'Generate Outline'
          )}
        </Button>
      </Box>
      
      {/* Feature progression bar */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Feature Progression
          </Typography>
          <Typography variant="body2" color="primary">
            {featureProgress}% Complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={featureProgress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="Topic Selection" 
            size="small" 
            color={featureProgress >= 20 ? "primary" : "default"}
            sx={{ m: 0.5 }}
          />
          <Chip 
            label="Duration Setting" 
            size="small" 
            color={featureProgress >= 40 ? "primary" : "default"}
            sx={{ m: 0.5 }}
          />
          <Chip 
            label="Member Configuration" 
            size="small" 
            color={featureProgress >= 60 ? "primary" : "default"}
            sx={{ m: 0.5 }}
          />
          <Chip 
            label="News Integration" 
            size="small" 
            color={featureProgress >= 80 ? "primary" : "default"}
            sx={{ m: 0.5 }}
          />
          <Chip 
            label="AI Generation" 
            size="small" 
            color={featureProgress >= 100 ? "primary" : "default"}
            sx={{ m: 0.5 }}
          />
        </Box>
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}
      >
        Select your desired podcast duration and number of speakers. The AI will optimize the content and pacing accordingly.
      </Typography>
    </Box>
  );
};

export default ScriptFormStep;
