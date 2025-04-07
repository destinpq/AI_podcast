import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/api-utils';

function createMockPromptResponse(topic: string, duration: number) {
  return NextResponse.json({
    researchPrompt: `Research prompt for ${topic}`,
    structurePrompt: `Outline prompt for ${duration} min podcast on ${topic}`,
    introPrompt: `Intro prompt for ${topic}`,
    segmentPrompts: [`Segment 1 prompt for ${topic}`, `Segment 2 prompt for ${topic}`],
    factCheckPrompt: `Fact check prompt for ${topic}`,
    conclusionPrompt: `Conclusion prompt for ${topic}`
  });
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { topic, mood, duration } = body;

    // Validate required parameters
    if (!topic || !mood || !duration) {
      return NextResponse.json(
        { error: 'Missing required parameters: topic, mood, duration' },
        { status: 400 }
      );
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7778';
    
    try {
      const response = await fetch(`${backendUrl}/prompts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic, 
          mood, 
          duration 
        }), 
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend returned error ${response.status}: ${errorText}. Using mock response.`);
        // Return mock data (using the new structure)
        return createMockPromptResponse(topic, duration);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error connecting to backend:', error);
      // Return mock data on connection error (using the new structure)
      return createMockPromptResponse(topic, duration);
    }
  } catch (error: unknown) {
    console.error('Error in generate-prompts API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompts';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}); 