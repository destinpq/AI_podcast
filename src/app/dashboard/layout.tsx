'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography,
  Divider,
  ListSubheader,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 240;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListSubheader>My Projects</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/my-projects/research-projects">
            <ListItemText primary="Research Projects" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/my-projects/podcast-projects">
            <ListItemText primary="Podcast Projects" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>AI Tools</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/ai-tools/research-generator">
            <ListItemText primary="Research Generator" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/ai-tools/script-writer">
            <ListItemText primary="Script Writer" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/ai-tools/voice-generator">
            <ListItemText primary="Voice Generator" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/ai-tools/content-enhancer">
            <ListItemText primary="Content Enhancer" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Collaboration</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/collaboration/teams-notes">
            <ListItemText primary="Teams & Notes" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Learning</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/learning-hub/tutorials">
            <ListItemText primary="Tutorials" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/learning-hub/webinars">
            <ListItemText primary="Webinars" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Other</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/community">
            <ListItemText primary="Community" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/dashboard/settings">
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f5f5f5'
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {children}
      </Box>
    </Box>
  );
} 