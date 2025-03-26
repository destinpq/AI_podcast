'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box } from '@mui/material';

interface CircularWordnetProps {
  open: boolean;
  onClose: () => void;
  topic: string;
}

export default function CircularWordnet({
  open,
  onClose,
  topic,
}: CircularWordnetProps) {
  // This is a placeholder component
  // The actual visualization will be implemented later
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Topic Visualization: {topic}</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          This is a placeholder for the circular wordnet visualization.
        </Box>
      </DialogContent>
    </Dialog>
  );
} 