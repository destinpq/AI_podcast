import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body;

    // Validate required parameters
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://shark-app-fg9yo.ondigitalocean.app';
    const response = await fetch(`${backendUrl}/news/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error generating news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate news';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 