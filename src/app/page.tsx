'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to AI Podcast Platform
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Create and manage your podcast content with AI
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        onClick={() => router.push('/dashboard')}
      >
        Get Started
      </Button>
    </Box>
  );
}
