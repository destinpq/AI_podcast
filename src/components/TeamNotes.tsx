'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { saveTeamNote, getScriptNotes, TeamNote } from '@/services/podcastService';
import { Timestamp } from 'firebase/firestore';

// Type for timestamp-like values
type TimestampLike = Timestamp | Date | number | null | undefined;

interface TeamNotesProps {
  scriptId: string;
  userId: string;
}

export default function TeamNotes({ scriptId, userId }: TeamNotesProps) {
  const [notes, setNotes] = useState<TeamNote[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch team notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!scriptId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const notesData = await getScriptNotes(scriptId);
        setNotes(notesData);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load team notes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [scriptId]);

  // Save a new note
  const handleSaveNote = async () => {
    if (!content.trim()) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      await saveTeamNote({
        scriptId,
        content: content.trim(),
        createdBy: userId
      });
      
      // Refresh notes
      const updatedNotes = await getScriptNotes(scriptId);
      setNotes(updatedNotes);
      setContent('');
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp: TimestampLike) => {
    if (!timestamp) return 'Just now';
    
    let date: Date;
    if (timestamp instanceof Timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'Just now';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Team Notes
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Add a note for your team"
            multiline
            rows={3}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={saveLoading}
          />
          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={!content.trim() || saveLoading}
            sx={{ mt: 1 }}
          >
            {saveLoading ? 'Saving...' : 'Save Note'}
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Previous Notes
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notes.length > 0 ? (
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {notes.map((note, index) => (
              <React.Fragment key={note.id || index}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={note.content}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDate(note.createdAt)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              textAlign: 'center',
              borderRadius: 1
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No team notes yet. Be the first to add one!
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
} 