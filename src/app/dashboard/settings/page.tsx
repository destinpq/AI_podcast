'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
} from '@mui/material';
import { useState, ChangeEvent } from 'react';

type SettingsEvent = 
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>;

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    email: 'user@example.com',
    notifications: true,
    emailUpdates: true,
    autoSave: true,
  });

  const handleChange = (field: string) => (event: SettingsEvent) => {
    const target = event.target as HTMLInputElement;
    setSettings({
      ...settings,
      [field]: target.type === 'checkbox' ? target.checked : target.value,
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <TextField
                fullWidth
                label="Email"
                value={settings.email}
                onChange={handleChange('email')}
                margin="normal"
              />
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary">
                  Update Email
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={handleChange('notifications')}
                    color="primary"
                  />
                }
                label="Enable Push Notifications"
              />
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailUpdates}
                    onChange={handleChange('emailUpdates')}
                    color="primary"
                  />
                }
                label="Email Updates"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Editor Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSave}
                    onChange={handleChange('autoSave')}
                    color="primary"
                  />
                }
                label="Auto-save Content"
              />
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary">
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 