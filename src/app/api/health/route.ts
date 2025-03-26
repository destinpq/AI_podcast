import { NextResponse } from 'next/server';
import { withErrorHandling } from '../api-utils';
import { logEnvironmentInfo } from '@/lib/debug';

// Health check endpoint to verify API routes are working
export const GET = withErrorHandling(async () => {
  // Log environment info for debugging
  logEnvironmentInfo();
  
  // Return basic health status
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
    // Check if essential services are configured
    services: {
      firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      news: !!process.env.NEWS_API_KEY,
    },
    openaiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    newsKeyLength: process.env.NEWS_API_KEY ? process.env.NEWS_API_KEY.length : 0,
  });
}); 