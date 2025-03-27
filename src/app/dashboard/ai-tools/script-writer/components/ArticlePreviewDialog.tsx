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
  Chip,
} from '@mui/material';
import { Article as ArticleIcon, Check as CheckIcon } from '@mui/icons-material';
import { UserReference } from '../types';

interface ArticlePreviewDialogProps {
  previewArticle: UserReference | null;
  selectedReferences: string[];
  setPreviewArticle: (article: UserReference | null) => void;
  toggleReferenceSelection: (id: string) => void;
}

const ArticlePreviewDialog: React.FC<ArticlePreviewDialogProps> = ({
  previewArticle,
  selectedReferences,
  setPreviewArticle,
  toggleReferenceSelection,
}) => {
  if (!previewArticle) return null;

  return (
    <Dialog
      open={!!previewArticle}
      onClose={() => setPreviewArticle(null)}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1400 }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pb: 2
      }}>
        <ArticleIcon />
        {previewArticle.content}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {previewArticle.thumbnail && (
          <Box sx={{ width: '100%', height: 250, bgcolor: 'grey.100', position: 'relative' }}>
            <Box
              component="img"
              src={previewArticle.thumbnail}
              alt={previewArticle.content}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 0,
                right: 0,
                px: 2,
                py: 0.5,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                borderTopLeftRadius: 8
              }}
            >
              <Typography variant="caption">
                Source: {previewArticle.source}
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {previewArticle.content}
          </Typography>
          <Box sx={{ my: 2 }}>
            <Chip 
              size="small" 
              label={previewArticle.source}
              color="primary"
              icon={<ArticleIcon />}
              sx={{ mr: 1 }}
            />
            <Chip 
              size="small" 
              label={new Date().toLocaleDateString()}
              color="default"
              variant="outlined"
            />
          </Box>
          <Typography variant="body1" paragraph>
            {previewArticle.description || 'No detailed description available for this article.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This article was found using AI-powered search to provide you with relevant and up-to-date content for your podcast.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<CheckIcon />}
              onClick={() => {
                if (previewArticle && !selectedReferences.includes(previewArticle.id)) {
                  toggleReferenceSelection(previewArticle.id);
                }
                setPreviewArticle(null);
              }}
              variant={selectedReferences.includes(previewArticle.id) ? "contained" : "outlined"}
              color="primary"
            >
              {selectedReferences.includes(previewArticle.id) 
                ? "Selected for Podcast" 
                : "Include in Podcast"}
            </Button>
            {previewArticle.url && (
              <Button
                href={previewArticle.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => setPreviewArticle(null)} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArticlePreviewDialog;
