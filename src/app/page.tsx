'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state after component mounts to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fix the redirect logic to prevent loops with robust checks
  useEffect(() => {
    // Only redirect if:
    // 1. Component is mounted (client-side)
    // 2. Auth is not loading (finished checking)
    // 3. User exists (is authenticated)
    // 4. We're not already redirecting
    // 5. We're actually on the home page
    if (
      mounted && 
      !authLoading && 
      user && 
      typeof window !== 'undefined' && 
      window.location.pathname === '/'
    ) {
      // Store a flag to prevent duplicate redirects
      const hasRedirected = sessionStorage.getItem('hasRedirected');
      if (!hasRedirected) {
        sessionStorage.setItem('hasRedirected', 'true');
        
        // Use a short timeout to ensure we don't get into a redirect loop
        const timer = setTimeout(() => {
          router.push('/dashboard/ai-tools/script-writer');
        }, 100);
        
        return () => {
          clearTimeout(timer);
          sessionStorage.removeItem('hasRedirected');
        };
      }
    }
  }, [user, router, authLoading, mounted]);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (email && password) {
        if (isSignUp) {
          await signUp(email, password);
        } else {
          await signIn(email, password);
        }
        // Redirection will happen automatically via the useEffect when user state updates
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(`Failed to ${isSignUp ? 'sign up' : 'sign in'}. ${isSignUp ? 'Email may already be in use.' : 'Please check your credentials.'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Show simple loading during initial authentication check
  if (authLoading || !mounted) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f7fa'
      }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%)',
        py: { xs: 4, md: 0 }
      }}
    >
      <Container maxWidth="lg">
        <Grid 
          container
          spacing={4} 
          sx={{ 
            minHeight: '100vh',
            alignItems: 'center',
          }}
        >
          <Grid item xs={12} md={6}>
            <Fade in={mounted} timeout={1000}>
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 800,
                    color: '#1a237e',
                    mb: 2
                  }}
                >
                  AI Podcast Studio
                </Typography>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 500,
                    color: '#455a64',
                    mb: 3
                  }}
                >
                  Create professional podcast scripts powered by AI
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{
                    fontSize: '1.1rem',
                    color: '#546e7a',
                    maxWidth: '90%'
                  }}
                >
                  Generate engaging podcast scripts based on trending topics, save your work, 
                  and collaborate with your team members to create high-quality content.
                </Typography>
              </Box>
            </Fade>
            
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Image 
                src="/podcast-illustration.svg" 
                alt="Podcast illustration" 
                style={{ 
                  maxWidth: '90%',
                  height: 'auto',
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.1))'
                }}
                width={500}
                height={300}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Fade in={mounted} timeout={800}>
              <Paper 
                elevation={8} 
                sx={{ 
                  p: { xs: 3, md: 5 }, 
                  maxWidth: 500, 
                  mx: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '6px',
                    background: 'linear-gradient(to right, #3f51b5, #2196f3)'
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  align="center" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1a237e',
                    mb: 3
                  }}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Typography>
                
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        alignItems: 'center'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}
                
                <form onSubmit={handleAuth} noValidate>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ 
                      mt: 2, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(63,81,181,0.4)',
                      background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(63,81,181,0.6)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </Button>
                </form>
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      color: '#78909c',
                      fontSize: '0.875rem'
                    }}
                  >
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
                    {isSignUp ? 'Already have an account?' : 'Don&apos;t have an account?'}{' '}
                    <Button 
                      variant="text" 
                      onClick={() => setIsSignUp(!isSignUp)}
                      sx={{ 
                        p: 0, 
                        minWidth: 'auto',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
