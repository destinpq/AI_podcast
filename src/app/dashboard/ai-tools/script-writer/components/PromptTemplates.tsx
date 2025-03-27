'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  Divider,
  Paper,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  ContentCopy as ContentCopyIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { getNewsPromptTemplates, getViralContentPrompts, getSequentialPrompts } from '../utils';

interface PromptTemplatesProps {
  onSelectPrompt?: (prompt: string) => void;
}

const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelectPrompt }) => {
  const [topic, setTopic] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const newsPromptTemplates = getNewsPromptTemplates();
  const viralContentPrompts = getViralContentPrompts();
  const sequentialPrompts = getSequentialPrompts();
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleCopyPrompt = (promptText: string) => {
    const formattedPrompt = promptText.replace(/\[(?:your )?topic\]/gi, topic || '[your topic]');
    navigator.clipboard.writeText(formattedPrompt);
    setSnackbarOpen(true);
  };
  
  const handleSelectPrompt = (promptText: string) => {
    const formattedPrompt = promptText.replace(/\[(?:your )?topic\]/gi, topic || '[your topic]');
    setSelectedPrompt(formattedPrompt);
    if (onSelectPrompt) {
      onSelectPrompt(formattedPrompt);
    }
  };
  
  const handleAddonToggle = (addon: string) => {
    setSelectedAddons(prev => 
      prev.includes(addon)
        ? prev.filter(a => a !== addon)
        : [...prev, addon]
    );
  };
  
  const buildViralPrompt = () => {
    let basePrompt = viralContentPrompts.main.prompt.replace(/\[(?:your )?topic\]/gi, topic || '[your topic]');
    
    if (selectedAddons.length > 0) {
      basePrompt += " " + selectedAddons.join(" ");
    }
    
    return basePrompt;
  };
  
  return (
    <Box>
      <Box mb={3}>
        <TextField
          fullWidth
          label="Your Topic"
          variant="outlined"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="AI, mental health, education, etc."
          size="small"
        />
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="prompt template tabs">
          <Tab label="News Prompts" />
          <Tab label="Viral Content" />
          <Tab label="Sequential Prompts" />
        </Tabs>
      </Box>
      
      {/* News Prompts Tab */}
      {tabValue === 0 && (
        <Paper variant="outlined" sx={{ p: 0, mb: 3 }}>
          <List disablePadding>
            {Object.entries(newsPromptTemplates).map(([key, template], index) => (
              <React.Fragment key={key}>
                {index > 0 && <Divider />}
                <ListItem 
                  sx={{ 
                    p: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={1}>
                      <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                        {template.emoji}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        {template.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.prompt.replace(/\[(?:your )?topic\]/gi, topic || '[your topic]')}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} container justifyContent="flex-end" spacing={1}>
                      <Grid item>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyPrompt(template.prompt)}
                          color="primary"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                      <Grid item>
                        <Button
                          size="small"
                          endIcon={<ChevronRightIcon />}
                          onClick={() => handleSelectPrompt(template.prompt)}
                          variant="outlined"
                        >
                          Use
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Viral Content Tab */}
      {tabValue === 1 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1.2rem', mr: 2 }}>
                {viralContentPrompts.main.emoji}
              </Typography>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {viralContentPrompts.main.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {viralContentPrompts.main.prompt.replace(/\[(?:your )?topic\]/gi, topic || '[your topic]')}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Optional Add-ons:
            </Typography>
            
            <FormGroup>
              {viralContentPrompts.addons.map((addon, index) => (
                <FormControlLabel 
                  key={index}
                  control={
                    <Checkbox 
                      checked={selectedAddons.includes(addon.description)}
                      onChange={() => handleAddonToggle(addon.description)}
                      size="small"
                    />
                  } 
                  label={
                    <Typography variant="body2">
                      {addon.title}: <span style={{ color: 'text.secondary' }}>{addon.description}</span>
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyPrompt(buildViralPrompt())}
              >
                Copy Prompt
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                size="small"
                endIcon={<ChevronRightIcon />}
                onClick={() => handleSelectPrompt(buildViralPrompt())}
              >
                Use This Prompt
              </Button>
            </Box>
          </Paper>
          
          <Typography variant="subtitle2" gutterBottom>
            Example:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              {viralContentPrompts.example}
            </Typography>
          </Paper>
        </Box>
      )}
      
      {/* Sequential Prompts Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="subtitle2" paragraph>
            Use these sequential prompts to build a complete viral podcast segment:
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Viral Podcast Structure (6 Steps)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {sequentialPrompts.map((prompt, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {prompt.emoji} {prompt.title}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyPrompt(prompt.prompt)}
                        color="primary"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {prompt.prompt.replace(/\[topic\]/gi, topic || '[topic]')}
                    </Typography>
                    {index < sequentialPrompts.length - 1 && <Divider sx={{ width: '100%', my: 1 }} />}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                // Create a combined prompt with all sequential steps
                const combinedPrompt = sequentialPrompts
                  .map(p => p.prompt.replace(/\[topic\]/gi, topic || '[topic]'))
                  .join('\n\n');
                handleCopyPrompt(combinedPrompt);
              }}
            >
              Copy All Steps
            </Button>
          </Box>
        </Box>
      )}
      
      {selectedPrompt && (
        <Card variant="outlined" sx={{ mt: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Selected Prompt:
            </Typography>
            <Typography variant="body2">
              {selectedPrompt}
            </Typography>
          </CardContent>
        </Card>
      )}
      
      <Snackbar 
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbarOpen(false)}>
          Prompt copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromptTemplates; 