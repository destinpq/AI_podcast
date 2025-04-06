'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MarkdownRenderer from './MarkdownRenderer';

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
  // Ensure dialog closes properly
  const onClose = () => {
    handleClose();
  };
  
  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open]);
  
  // Handle generation with proper closing
  const handleGenerateClick = () => {
    onClose(); // First close the dialog
    
    // Small delay to ensure UI updates before potentially intensive operation
    setTimeout(() => {
      handleGenerate(); // Then generate script
    }, 100);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={false}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <span>Script Generation Preview</span>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Paper
          sx={{
            p: 2,
            mb: 2,
            mt: 2,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Podcast Script Generation Prompt
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Topic
          </Typography>
          <Box sx={{ mb: 2 }}>
            <MarkdownRenderer content={topic} />
          </Box>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Format
          </Typography>
          <Box sx={{ mb: 2 }}>
            <MarkdownRenderer content={`- Duration: ${duration} minutes\n- Speakers: ${memberCount} ${memberCount > 1 ? 'people' : 'person'}`} />
          </Box>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Instructions
          </Typography>
          <Box sx={{ mb: 1 }}>
            <MarkdownRenderer 
              content={`Creating a ${duration}-minute expert podcast script with ${memberCount} speaker(s).
The script will include a 15-second hook, a main section with expert insights,
and a 45-second actionable takeaway.`} 
            />
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Close
        </Button>
        <Button 
          onClick={handleGenerateClick} 
          variant="contained" 
          color="primary"
        >
          Generate Script
        </Button>
      </DialogActions>
    </Dialog>
  );
} 