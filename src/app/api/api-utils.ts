import { NextResponse } from 'next/server';
import { handleError } from '@/lib/debug';

// Validate that required environment variables are present
export function validateEnvVars(): string[] {
  const missingVars = [];
  
  // Check for essential API keys
  if (!process.env.OPENAI_API_KEY) {
    missingVars.push('OPENAI_API_KEY');
  }
  
  return missingVars;
}

// Type-safe error response creator
interface ErrorResponse {
  error: string;
  details?: unknown;
  stack?: string;
}

// Create a consistent error response
export function createErrorResponse(
  message: string, 
  status = 500,
  details?: unknown
): NextResponse<ErrorResponse> {
  const errorObj: ErrorResponse = { error: message };
  
  // In development, include more details
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
    errorObj.details = details;
    
    if (details instanceof Error && details.stack) {
      errorObj.stack = details.stack;
    }
  }
  
  console.error(`API Error (${status}):`, message, details);
  
  return NextResponse.json(errorObj, { status });
}

// API route wrapper with standard error handling
export function withErrorHandling(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      // Check for missing environment variables
      const missingVars = validateEnvVars();
      if (missingVars.length > 0) {
        return createErrorResponse(
          `Missing required environment variables: ${missingVars.join(', ')}`,
          500
        );
      }
      
      // Call the actual handler
      return await handler(req);
    } catch (error) {
      const message = handleError(error, `API route: ${req.url}`);
      return createErrorResponse(message, 500, error);
    }
  };
} 