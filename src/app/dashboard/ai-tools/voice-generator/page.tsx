import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
  Chip,
  Stack
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  Save as SaveIcon
} from '@mui/icons-material';

export default function VoiceGenerator() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Voice Generator
        </Typography>
        <Chip
          icon={<AutoAwesomeIcon />}
          label="AI Credits: 1000 remaining"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Text to Convert"
                placeholder="Enter the text you want to convert to speech..."
                variant="outlined"
              />

              <FormControl fullWidth>
                <InputLabel>Voice Selection</InputLabel>
                <Select
                  label="Voice Selection"
                  defaultValue="male-1"
                >
                  <MenuItem value="male-1">Male Voice 1</MenuItem>
                  <MenuItem value="male-2">Male Voice 2</MenuItem>
                  <MenuItem value="female-1">Female Voice 1</MenuItem>
                  <MenuItem value="female-2">Female Voice 2</MenuItem>
                  <MenuItem value="neutral-1">Neutral Voice 1</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Speaking Speed</InputLabel>
                <Select
                  label="Speaking Speed"
                  defaultValue="normal"
                >
                  <MenuItem value="slow">Slow</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="fast">Fast</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Pitch</InputLabel>
                <Select
                  label="Pitch"
                  defaultValue="medium"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Emotion</InputLabel>
                <Select
                  label="Emotion"
                  defaultValue="neutral"
                >
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="happy">Happy</MenuItem>
                  <MenuItem value="sad">Sad</MenuItem>
                  <MenuItem value="excited">Excited</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AutoAwesomeIcon />}
                >
                  Generate Voice
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Generated Audio
            </Typography>
            <Box
              sx={{
                p: 3,
                bgcolor: 'grey.100',
                borderRadius: 1,
                mb: 2,
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography color="text.secondary">
                Your generated audio will appear here...
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
              >
                Save to Project
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 