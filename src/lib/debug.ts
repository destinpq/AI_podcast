/**
 * Debug utility for troubleshooting Vercel deployment issues
 */

// Simple wrapper for console logging that can be globally disabled
export const debugLog = (message: string, data?: unknown) => {
  // Only log in development or if specifically enabled
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
    console.log(`[DEBUG] ${message}`, data !== undefined ? data : '');
  }
};

// Safely stringify objects, even circular ones
export const safeStringify = (obj: unknown): string => {
  const seen = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2);
};

// Error handler that logs details
export const handleError = (error: unknown, context?: string): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const message = `Error${context ? ` in ${context}` : ''}: ${errorMessage}`;
  
  // Log the error in development or if debug is enabled
  debugLog(message, { stack: errorStack });
  
  return message;
};

// Initialize once to log environment info
export const logEnvironmentInfo = () => {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
    console.log(`
    [ENVIRONMENT INFO]
    Node Env: ${process.env.NODE_ENV}
    Vercel Env: ${process.env.VERCEL_ENV || 'not on Vercel'}
    Firebase Config Present: ${Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)}
    OpenAI API Key Present: ${Boolean(process.env.OPENAI_API_KEY)}
    `);
  }
}; 