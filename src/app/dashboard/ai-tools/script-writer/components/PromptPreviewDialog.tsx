'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Article as ArticleIcon } from '@mui/icons-material';
import MarkdownRenderer from './MarkdownRenderer';

interface PromptPreviewDialogProps {
  showPromptPreview: boolean;
  setShowPromptPreview: (show: boolean) => void;
  promptPreview: string;
  proceedWithScriptGeneration: () => void;
}

const PromptPreviewDialog: React.FC<PromptPreviewDialogProps> = ({
  showPromptPreview,
  setShowPromptPreview,
  promptPreview,
  proceedWithScriptGeneration,
}) => {
  return (
    <Dialog
      open={showPromptPreview}
      onClose={() => setShowPromptPreview(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          height: { xs: '90vh', sm: '80vh' },
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'info.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <ArticleIcon />
        AI Prompt Preview
      </DialogTitle>
      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box 
          sx={{ 
            p: 3, 
            fontFamily: 'monospace', 
            bgcolor: 'rgba(0,0,0,0.04)', 
            overflow: 'auto',
            flex: 1,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          <MarkdownRenderer content={promptPreview} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          This is a preview of how your selected content will be formatted in the AI prompt
        </Typography>
        <Button onClick={() => setShowPromptPreview(false)} color="inherit">
          Close
        </Button>
        <Button 
          onClick={() => {
            setShowPromptPreview(false);
            proceedWithScriptGeneration();
          }} 
          variant="contained" 
          color="success"
        >
          Looks Good, Generate!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptPreviewDialog;
