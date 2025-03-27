'use client';

import React from 'react';
import {
  Paper,
  Typography,
  Rating,
  Button
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { ScriptData } from '../types';

interface UserRatingCardProps {
  rating: number | null;
  setRating: (rating: number | null) => void;
  user: { uid?: string };
  topic: string;
  script: string;
  outline: {
    intro: string;
    topics: string[];
    conclusion: string;
  };
  duration: number;
  memberCount: number;
  aiRating: ScriptData['aiRating'];
  userReferences: ScriptData['references'];
  isMobile: boolean;
}

const UserRatingCard: React.FC<UserRatingCardProps> = ({
  rating,
  setRating,
  user,
  topic,
  script,
  outline,
  duration,
  memberCount,
  aiRating,
  userReferences,
  isMobile
}) => {
  return (
    <Paper sx={{ 
      p: 2,
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 1
    }}>
      <Typography variant="h6">
        Your Rating
      </Typography>
      <Rating
        value={rating}
        onChange={(_, newValue) => setRating(newValue)}
        precision={0.5}
        size={isMobile ? "medium" : "large"}
        emptyIcon={<StarBorderIcon fontSize="inherit" />}
        icon={<StarIcon fontSize="inherit" />}
      />
      <Typography variant="body2" color="text.secondary">
        {rating ? `You rated this script ${rating} stars` : 'Click to rate'}
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary"
        fullWidth
        onClick={() => {
          if (user?.uid) {
            // Save the script and provide feedback
            const scriptData = {
              topic,
              script,
              outline,
              duration,
              memberCount,
              userId: user.uid,
              rating: rating || 0,
              aiRating: aiRating || null,
              createdAt: new Date().toISOString(),
              references: userReferences
            };
            
            fetch('/api/scripts/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(scriptData),
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to save script');
              }
              return response.json();
            })
            .then(() => {
              // Show success message
              alert('Script saved successfully!');
            })
            .catch(err => {
              console.error('Error saving script:', err);
              alert('Failed to save script. Please try again.');
            });
          } else {
            alert('You need to be logged in to save scripts');
          }
        }}
        startIcon={<AssignmentIcon />}
        sx={{ mt: 2 }}
      >
        Save & Download Report
      </Button>
    </Paper>
  );
};

export default UserRatingCard;
