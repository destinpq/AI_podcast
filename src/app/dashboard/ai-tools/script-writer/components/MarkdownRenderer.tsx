'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Chip
} from '@mui/material';

interface MarkdownRendererProps {
  content: string;
}

// Enhanced Markdown to MUI component renderer
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Preprocess to handle paragraphs properly
  const paragraphs = content.split('\n\n').filter(Boolean);

  // Helper function to format the text with bold, italic, and source references
  const renderContent = (text: string) => {
    if (!text) return '';
    
    // Replace bold markdown with styled spans
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace italic markdown with styled spans
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace code blocks
    formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Extract and process source references
    const parts = formattedText.split(/(\[Source: .*?\])/).filter(Boolean);
    
    if (parts.length > 1) {
      return (
        <React.Fragment>
          {parts.map((part, index) => {
            if (part.startsWith('[Source:')) {
              const source = part.replace(/^\[Source: |\]$/g, '');
              return (
                <Chip
                  key={index}
                  label={source}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.7rem', mt: '2px', mb: '2px' }}
                />
              );
            }
            return (
              <span 
                key={index} 
                dangerouslySetInnerHTML={{ __html: part }} 
              />
            );
          })}
        </React.Fragment>
      );
    }
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <Box>
      {paragraphs.map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        
        // Heading 1 (# text)
        if (trimmedParagraph.startsWith('# ')) {
          return (
            <Typography 
              key={index} 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mt: 2.5, 
                mb: 2,
                color: 'text.primary',
                fontSize: '1.5rem'
              }}
            >
              {renderContent(trimmedParagraph.substring(2))}
            </Typography>
          );
        }
        
        // Heading 2 (## text)
        if (trimmedParagraph.startsWith('## ')) {
          return (
            <Typography 
              key={index} 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mt: 2, 
                mb: 1.5,
                color: 'text.primary',
                fontSize: '1.25rem' 
              }}
            >
              {renderContent(trimmedParagraph.substring(3))}
            </Typography>
          );
        }
        
        // Heading 3 (### text)
        if (trimmedParagraph.startsWith('### ')) {
          return (
            <Typography 
              key={index} 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mt: 1.5, 
                mb: 1.25,
                color: 'text.primary',
                fontSize: '1.125rem'
              }}
            >
              {renderContent(trimmedParagraph.substring(4))}
            </Typography>
          );
        }
        
        // Heading 4 (#### text)
        if (trimmedParagraph.startsWith('#### ')) {
          return (
            <Typography 
              key={index} 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mt: 1.5, 
                mb: 0.75,
                color: 'text.primary',
                fontSize: '1rem' 
              }}
            >
              {renderContent(trimmedParagraph.substring(5))}
            </Typography>
          );
        }

        // Horizontal rule (---)
        if (trimmedParagraph.match(/^-{3,}$/)) {
          return <Divider key={index} sx={{ my: 2 }} />;
        }
        
        // Unordered list (each line starting with - or *)
        if (trimmedParagraph.split('\n').every(line => line.trim().startsWith('-') || line.trim().startsWith('*'))) {
          const listItems = trimmedParagraph.split('\n').map(line => line.trim().substring(1).trim());
          return (
            <List key={index} dense disablePadding sx={{ mb: 2, mt: 1 }}>
              {listItems.map((item, i) => (
                <ListItem 
                  key={i} 
                  sx={{ 
                    py: 0.5, 
                    display: 'flex',
                    pl: 0, 
                    alignItems: 'flex-start',
                    mb: 0.5
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      minWidth: '24px', 
                      textAlign: 'center',
                      pt: '3px'
                    }}
                  >
                    •
                  </Box>
                  <Typography variant="body2" sx={{ display: 'inline' }}>
                    {renderContent(item)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          );
        }
        
        // Ordered list (1. 2. 3. etc)
        if (trimmedParagraph.split('\n').some(line => /^\d+\./.test(line.trim()))) {
          const listItems = trimmedParagraph.split('\n').map(line => {
            const match = line.trim().match(/^(\d+)\.(.*)/);
            return match ? { number: match[1], text: match[2].trim() } : { number: "", text: line.trim() };
          }).filter(item => item.text);
          
          return (
            <List key={index} dense disablePadding sx={{ mb: 2, mt: 1 }}>
              {listItems.map((item, i) => (
                <ListItem 
                  key={i} 
                  sx={{ 
                    py: 0.5, 
                    display: 'flex',
                    pl: 0, 
                    alignItems: 'flex-start',
                    mb: 0.5
                  }}
                >
                  {item.number ? (
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        minWidth: '24px', 
                        textAlign: 'right',
                        mr: 1,
                        fontWeight: 'bold'
                      }}
                    >
                      {item.number}.
                    </Box>
                  ) : (
                    <Box component="span" sx={{ width: '12px' }} />
                  )}
                  <Typography variant="body2" sx={{ display: 'inline' }}>
                    {renderContent(item.text)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          );
        }
        
        // Regular paragraph
        const lines = trimmedParagraph.split('\n');
        if (lines.length === 1) {
          return (
            <Typography 
              key={index} 
              variant="body2" 
              paragraph 
              sx={{ 
                mb: 1.5, 
                lineHeight: 1.6,
                color: 'text.primary',
                fontSize: '0.875rem'
              }}
            >
              {renderContent(trimmedParagraph)}
            </Typography>
          );
        }
        
        // Multi-line paragraph
        return (
          <Typography 
            key={index} 
            variant="body2" 
            paragraph 
            sx={{ 
              mb: 1.5, 
              lineHeight: 1.6,
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {renderContent(line)}
              </React.Fragment>
            ))}
          </Typography>
        );
      })}
    </Box>
  );
};

export default MarkdownRenderer; 