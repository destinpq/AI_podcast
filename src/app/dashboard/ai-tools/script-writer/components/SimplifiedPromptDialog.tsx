'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography
} from '@mui/material';

interface SimplifiedPromptDialogProps {
  open: boolean;
  handleClose: () => void;
  topic: string;
  duration: number;
  memberCount: number;
  handleGenerate: () => void;
}

export default function SimplifiedPromptDialog({
  open,
  handleClose,
  topic,
  duration,
  memberCount,
  handleGenerate
}: SimplifiedPromptDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Script Generation Preview
      </DialogTitle>
      <DialogContent>
        <Paper
          sx={{
            p: 2,
            mb: 2,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            # Podcast Script Generation Prompt
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            ## Topic
          </Typography>
          <Typography variant="body2" paragraph>
            {topic}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            ## Format
          </Typography>
          <Typography variant="body2" paragraph>
            - Duration: {duration} minutes
            - Speakers: {memberCount} {memberCount > 1 ? 'people' : 'person'}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            ## Instructions
          </Typography>
          <Typography variant="body2">
            Creating a {duration}-minute expert podcast script with {memberCount} speaker(s).
            The script will include a 15-second hook, a main section with expert insights,
            and a 45-second actionable takeaway.
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Button 
          onClick={handleGenerate} 
          variant="contained" 
          color="primary"
        >
          Generate Script
        </Button>
      </DialogActions>
    </Dialog>
  );
} 