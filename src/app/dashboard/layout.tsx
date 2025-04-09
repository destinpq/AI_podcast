'use client';

// Import the dynamic function from next/dynamic
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  CircularProgress,
  alpha,
  Theme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Science as ResearchIcon,
  Podcasts as PodcastIcon,
  Psychology as AIToolsIcon,
  Description as ScriptIcon,
  Bookmarks as SavedIcon,
  Groups as TeamsIcon,
  Slideshow as TutorialIcon,
  Videocam as WebinarIcon,
  Forum as CommunityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';

// Constants
const drawerWidth = 240;

// Style for active navigation item
const activeItemStyle = (isActive: boolean, theme: Theme) => ({
  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  borderRight: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.04),
  },
  transition: 'all 0.2s ease-in-out'
});

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

// Main component that will only render on client
function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Only run auth checking code on the client
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

  // Important: Use consistent loading UI to avoid hydration mismatches
  if (isLoading || authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f7fa' 
      }}>
        {/* Only render the spinner after component has mounted */}
        {typeof window !== 'undefined' && <CircularProgress size={50} thickness={4} />}
      </Box>
    );
  }

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper',
    }}>
      <Box sx={{ 
        p: 2.5, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5
      }}>
        <PodcastIcon 
          color="primary" 
          sx={{ fontSize: 28 }} 
        />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            letterSpacing: '0.5px',
            color: 'primary.main'
          }}
        >
          AI Podcast Studio
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        {/* My Projects Section */}
        <List
          subheader={
            <ListSubheader 
              component="div" 
              sx={{ 
                bgcolor: 'background.paper', 
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                lineHeight: '2rem',
              }}
            >
              My Projects
            </ListSubheader>
          }
          sx={{ py: 0 }}
        >
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/my-projects/research-projects"
              sx={(theme) => activeItemStyle(isActive('/dashboard/my-projects/research-projects'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ResearchIcon fontSize="small" color={isActive('/dashboard/my-projects/research-projects') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Research Projects" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/my-projects/research-projects') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/my-projects/podcast-projects"
              sx={(theme) => activeItemStyle(isActive('/dashboard/my-projects/podcast-projects'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PodcastIcon fontSize="small" color={isActive('/dashboard/my-projects/podcast-projects') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Podcast Projects" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/my-projects/podcast-projects') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        {/* AI Tools Section */}
        <List
          subheader={
            <ListSubheader 
              component="div" 
              sx={{ 
                bgcolor: 'background.paper', 
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                lineHeight: '2rem',
              }}
            >
              AI Tools
            </ListSubheader>
          }
          sx={{ py: 0 }}
        >
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/ai-tools/research-generator"
              sx={(theme) => activeItemStyle(isActive('/dashboard/ai-tools/research-generator'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AIToolsIcon fontSize="small" color={isActive('/dashboard/ai-tools/research-generator') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Research Generator" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/ai-tools/research-generator') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/ai-tools/script-writer"
              sx={(theme) => activeItemStyle(isActive('/dashboard/ai-tools/script-writer'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ScriptIcon fontSize="small" color={isActive('/dashboard/ai-tools/script-writer') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Script Writer" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/ai-tools/script-writer') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/ai-tools/saved-scripts"
              sx={(theme) => activeItemStyle(isActive('/dashboard/ai-tools/saved-scripts'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SavedIcon fontSize="small" color={isActive('/dashboard/ai-tools/saved-scripts') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Saved Scripts" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/ai-tools/saved-scripts') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Collaboration Section */}
        <List
          subheader={
            <ListSubheader 
              component="div" 
              sx={{ 
                bgcolor: 'background.paper', 
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                lineHeight: '2rem',
              }}
            >
              Collaboration
            </ListSubheader>
          }
          sx={{ py: 0 }}
        >
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/collaboration/teams-notes"
              sx={(theme) => activeItemStyle(isActive('/dashboard/collaboration/teams-notes'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <TeamsIcon fontSize="small" color={isActive('/dashboard/collaboration/teams-notes') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Teams & Notes" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/collaboration/teams-notes') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Learning Section */}
        <List
          subheader={
            <ListSubheader 
              component="div" 
              sx={{ 
                bgcolor: 'background.paper', 
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                lineHeight: '2rem',
              }}
            >
              Learning
            </ListSubheader>
          }
          sx={{ py: 0 }}
        >
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/learning-hub/tutorials"
              sx={(theme) => activeItemStyle(isActive('/dashboard/learning-hub/tutorials'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <TutorialIcon fontSize="small" color={isActive('/dashboard/learning-hub/tutorials') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Tutorials" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/learning-hub/tutorials') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/learning-hub/webinars"
              sx={(theme) => activeItemStyle(isActive('/dashboard/learning-hub/webinars'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WebinarIcon fontSize="small" color={isActive('/dashboard/learning-hub/webinars') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Webinars" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/learning-hub/webinars') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Other Section */}
        <List
          subheader={
            <ListSubheader 
              component="div" 
              sx={{ 
                bgcolor: 'background.paper', 
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                lineHeight: '2rem',
              }}
            >
              Other
            </ListSubheader>
          }
          sx={{ py: 0 }}
        >
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/community"
              sx={(theme) => activeItemStyle(isActive('/dashboard/community'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CommunityIcon fontSize="small" color={isActive('/dashboard/community') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Community" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/community') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href="/dashboard/settings"
              sx={(theme) => activeItemStyle(isActive('/dashboard/settings'), theme)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsIcon fontSize="small" color={isActive('/dashboard/settings') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: isActive('/dashboard/settings') ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      
      {/* User profile at bottom of sidebar */}
      <Box sx={{ 
        mt: 'auto', 
        borderTop: '1px solid',
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        <Avatar 
          alt={userData?.name || 'User'} 
          src={userData?.avatar || undefined}
          sx={{ 
            bgcolor: 'primary.main',
            width: 40,
            height: 40
          }}
        >
          {userData?.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography 
            variant="subtitle2" 
            fontWeight={600}
            sx={{ 
              lineHeight: 1.2,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {userData?.name}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
          >
            {userData?.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' } 
              }}
            >
              AI Podcast Studio
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              component={Link}
              href="/dashboard/ai-tools/saved-scripts"
              startIcon={<SaveIcon />}
              variant="outlined"
              size="small"
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                mr: 1,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Saved Scripts
            </Button>
            
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{ 
                ml: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {userData?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
          
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, minWidth: 180 }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {userData?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userData?.email}
              </Typography>
            </Box>
            <Divider />
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
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
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
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
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

// Dynamically import with SSR disabled
const DynamicDashboardContent = dynamic(
  () => Promise.resolve(DashboardLayoutContent),
  { ssr: false }
);

// The layout that Next.js will use
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DynamicDashboardContent>{children}</DynamicDashboardContent>;
} 