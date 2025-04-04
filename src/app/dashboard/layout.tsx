'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  Typography,
  Divider,
  ListSubheader,
  IconButton,
  useTheme,
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';

// Constants
const drawerWidth = 240;

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

// This wrapper ensures the dashboard only renders on the client
const ClientOnlyDashboard = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f7fa' 
      }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }
  
  return <>{children}</>;
};

// Main component that will only render on client
function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/');
        return;
      }
      
      if (user) {
        setUserData({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: user.photoURL
        });
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [user, authLoading, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      handleCloseUserMenu();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading || authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f7fa' 
      }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

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
          <ListItemButton component={Link} href="/dashboard/ai-tools/saved-scripts">
            <ListItemText primary="Saved Scripts" />
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
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: 1,
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            AI Podcast Studio
          </Typography>
          
          <Button 
            component={Link}
            href="/dashboard/ai-tools/saved-scripts"
            startIcon={<SaveIcon />}
            sx={{ mr: 2 }}
          >
            Saved Scripts
          </Button>
          
          <IconButton onClick={handleOpenUserMenu} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {userData?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem component={Link} href="/dashboard/settings" onClick={handleCloseUserMenu}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 10, md: 12 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Export a dynamic component with SSR disabled to prevent hydration issues
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnlyDashboard>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </ClientOnlyDashboard>
  );
} 