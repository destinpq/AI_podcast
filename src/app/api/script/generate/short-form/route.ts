import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/api-utils';

// Re-define or import the GeneratedPrompts interface for type safety
interface GeneratedPrompts {
  researchPrompt: string;
  structurePrompt: string;
  introPrompt: string;
  segmentPrompts: string[];
  factCheckPrompt: string;
  conclusionPrompt: string;
}

// DTO expected by this API route from the frontend component
interface GenerateFinalScriptDto {
  prompts: GeneratedPrompts;
  memberCount?: number; // Optional fields to pass through
  topic?: string;
  duration?: number;
}

export const POST = withErrorHandling(async (request: Request) => {
  // Get backend URL from environment variable
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7778';

  try {
    // Parse the request body expecting the structured DTO
    const payload: GenerateFinalScriptDto = await request.json();

    // Validate that the prompts object exists
    if (!payload || !payload.prompts) {
      return NextResponse.json(
        { error: 'Invalid request payload: Missing prompts object.' },
        { status: 400 },
      );
    }

    console.log(
      'Proxying request to backend script generation:',
      `${backendUrl}/script/generate/short-form`,
    );
    console.log('Payload:', payload);

    // Call the backend API, forwarding the structured payload
    const response = await fetch(`${backendUrl}/script/generate/short-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Forward the received DTO
    });

    // Handle backend response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Backend script generation failed (${response.status}): ${errorText}`,
      );
      return NextResponse.json(
        {
          error:
            `Backend script generation failed: ${errorText || response.statusText}`,
        },
        { status: response.status },
      );
    }

    // Return the successful backend response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in API route /api/script/generate/short-form:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error processing script generation request.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}); 