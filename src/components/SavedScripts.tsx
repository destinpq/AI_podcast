'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { getUserScripts, getTeamScripts, deleteScript, PodcastScript } from '@/services/podcastService';
import TeamNotes from './TeamNotes';
import { Timestamp } from 'firebase/firestore';

interface SavedScriptsProps {
  userId: string;
}

// Type for timestamp-like values
type TimestampLike = Timestamp | Date | number | null | undefined;

export default function SavedScripts({ userId }: SavedScriptsProps) {
  const [personalScripts, setPersonalScripts] = useState<PodcastScript[]>([]);
  const [teamScripts, setTeamScripts] = useState<PodcastScript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [teamId, setTeamId] = useState('');
  const [selectedScript, setSelectedScript] = useState<PodcastScript | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  // Fetch personal scripts
  useEffect(() => {
    const fetchPersonalScripts = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const scripts = await getUserScripts(userId);
        setPersonalScripts(scripts);
      } catch (err) {
        console.error('Error fetching personal scripts:', err);
        
        // Check if it's a Firestore index error and provide a more helpful message
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('index') || errorMessage.includes('requires an index')) {
          setError(
            'Database index needs to be created. Please contact your administrator or wait for them to set up the required indexes.'
          );
        } else {
          setError('Failed to load your scripts. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonalScripts();
  }, [userId]);
  
  // Fetch team scripts when team ID changes
  useEffect(() => {
    const fetchTeamScripts = async () => {
      if (!teamId.trim()) {
        setTeamScripts([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const scripts = await getTeamScripts(teamId.trim());
        setTeamScripts(scripts);
      } catch (err) {
        console.error('Error fetching team scripts:', err);
        
        // Check if it's a Firestore index error and provide a more helpful message
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('index') || errorMessage.includes('requires an index')) {
          setError(
            'Database index needs to be created. Please contact your administrator or wait for them to set up the required indexes.'
          );
        } else {
          setError('Failed to load team scripts. Please check the team ID.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (currentTab === 1) {
      fetchTeamScripts();
    }
  }, [teamId, currentTab]);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // Handle view script
  const handleViewScript = (script: PodcastScript) => {
    setSelectedScript(script);
    setViewModalOpen(true);
  };
  
  // Handle copy script
  const handleCopyScript = (script: PodcastScript) => {
    navigator.clipboard.writeText(script.script)
      .then(() => alert('Script copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };
  
  // Handle delete script
  const handleDeleteScript = async (id: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this script?')) return;
    
    try {
      await deleteScript(id);
      setPersonalScripts(scripts => scripts.filter(s => s.id !== id));
      setTeamScripts(scripts => scripts.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting script:', err);
      alert('Failed to delete script. Please try again.');
    }
  };
  
  // Format date
  const formatDate = (timestamp: TimestampLike) => {
    if (!timestamp) return 'N/A';
    
    let date: Date;
    if (timestamp instanceof Timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Saved Scripts
      </Typography>
      
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
      >
        <Tab label="My Scripts" />
        <Tab label="Team Scripts" />
      </Tabs>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {currentTab === 1 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Enter Team ID"
            fullWidth
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Enter your team ID to view shared scripts"
            sx={{ mb: 2 }}
          />
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : ((currentTab === 0 ? personalScripts : teamScripts).length > 0) ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(currentTab === 0 ? personalScripts : teamScripts).map((script) => (
                <TableRow key={script.id}>
                  <TableCell>{script.title}</TableCell>
                  <TableCell>{script.topic}</TableCell>
                  <TableCell>{formatDate(script.createdAt)}</TableCell>
                  <TableCell>{script.duration} min</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewScript(script)}
                      title="View Script"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyScript(script)}
                      title="Copy Script"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => script.id && handleDeleteScript(script.id)}
                      title="Delete Script"
                      disabled={currentTab === 1 && script.userId !== userId}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            bgcolor: 'action.hover', 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography color="text.secondary">
            {currentTab === 0 
              ? "You haven't saved any scripts yet." 
              : teamId.trim() 
                ? "No scripts found for this team." 
                : "Enter a team ID to view shared scripts."
            }
          </Typography>
        </Paper>
      )}
      
      {/* Script View Dialog */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedScript && (
          <>
            <DialogTitle>
              {selectedScript.title}
              <Typography variant="subtitle2" color="text.secondary">
                {selectedScript.topic} • {selectedScript.duration} minutes
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  my: 2, 
                  bgcolor: 'background.default',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  maxHeight: '60vh',
                  overflow: 'auto'
                }}
              >
                {selectedScript.script}
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<CopyIcon />} 
                  onClick={() => selectedScript && handleCopyScript(selectedScript)}
                >
                  Copy Script
                </Button>
              </Box>
              
              {/* Team Notes */}
              {selectedScript.id && (
                <TeamNotes scriptId={selectedScript.id} userId={userId} />
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
} 