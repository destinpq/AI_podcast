'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { saveScript, PodcastScript } from '@/services/podcastService';
import { TrendingContent } from '@/types/trends';

// Interface for outline structure
interface PodcastOutline {
  intro?: string;
  topics?: string[];
  conclusion?: string;
  [key: string]: string | string[] | undefined; // More specific type for additional fields
}

interface SaveScriptButtonProps {
  topic: string;
  script: string;
  outline: PodcastOutline;
  duration: number;
  memberCount: number;
  userId?: string | null;
  trends?: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  };
}

export default function SaveScriptButton({
  topic,
  script,
  outline,
  duration,
  memberCount,
  userId,
  trends
}: SaveScriptButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // For demo purposes, we'll use a hardcoded user ID
  // In a real app, this would come from authentication
  const userIdDemo = 'demo-user-' + Date.now().toString().slice(-4);

  const handleOpen = () => {
    setTitle(topic || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your script');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scriptData: Omit<PodcastScript, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        topic,
        script,
        outline,
        duration,
        memberCount,
        trends,
        userId: userId || userIdDemo,
        teamId: teamId.trim() || undefined
      };

      await saveScript(scriptData);
      setSuccess(true);
      handleClose();
    } catch (err) {
      console.error('Error saving script:', err);
      setError('Failed to save script. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccess(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={handleOpen}
        disabled={!script}
        sx={{ ml: 1 }}
      >
        Save Script
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Save Podcast Script</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Script Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
          
          <TextField
            label="Team ID (Optional)"
            fullWidth
            margin="normal"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            helperText="Enter a team ID to share this script with your team"
            disabled={loading}
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Saving this script will allow you to access it later and share it with your team.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading || !title.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        message="Script saved successfully!"
      />
    </>
  );
} 