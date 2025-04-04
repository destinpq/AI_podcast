'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem
} from '@mui/material';

interface MarkdownRendererProps {
  content: string;
}

// Simple Markdown to MUI component renderer
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <Box>
      {lines.map((line, index) => {
        // Heading 4 (####)
        if (line.startsWith('#### ')) {
          return (
            <Typography 
              key={index} 
              variant="subtitle1" 
              gutterBottom 
              sx={{ fontWeight: 500, mt: 1.5 }}
            >
              {line.substring(5)}
            </Typography>
          );
        }
        // Heading 3 (###)
        if (line.startsWith('### ')) {
          return (
            <Typography 
              key={index} 
              variant="h6" 
              gutterBottom 
              sx={{ fontWeight: 500, mt: 2 }}
            >
              {line.substring(4)}
            </Typography>
          );
        }
        // Bold (**text**)
        const boldRegex = /\*\*(.*?)\*\*/g;
        if (boldRegex.test(line)) {
          const parts = line.split(/(\$\$.*?\$\$|\*\*.*?\*\*)/);
          return (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              {parts.map((part, i) => 
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                )
              )}
            </Typography>
          );
        }
        // List item (- or *)
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <List key={index} dense sx={{ py: 0 }}>
              <ListItem sx={{ py: 0.25, pl: 2 }}>
                <Typography variant="body2">
                  {line.substring(2)}
                </Typography>
              </ListItem>
            </List>
          );
        }
        // Regular paragraph
        return (
          <Typography key={index} variant="body2" paragraph sx={{ mb: 1 }}>
            {line}
          </Typography>
        );
      })}
    </Box>
  );
};

export default MarkdownRenderer; 