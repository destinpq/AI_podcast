import { NextResponse } from 'next/server';

interface UserReference {
  id: string;
  type: 'article' | 'factoid' | 'stat';
  content: string;
  url?: string;
  source?: string;
}

interface ScriptData {
  topic: string;
  script: string;
  outline: {
    intro: string;
    topics: string[];
    conclusion: string;
  };
  duration: number;
  memberCount: number;
  userId: string;
  rating?: number;
  aiRating?: {
    overall: number;
    categories: {
      content: number;
      structure: number;
      engagement: number;
      clarity: number;
      pacing: number;
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  };
  createdAt: string;
  references?: UserReference[];
}

export async function POST(request: Request) {
  try {
    const scriptData: ScriptData = await request.json();
    
    if (!scriptData.topic || !scriptData.script || !scriptData.userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real application, you would save this to a database
    // For now, we'll just simulate a successful save
    
    // You could add code here to save to Firestore, MongoDB, etc.
    console.log('Script saved:', {
      userId: scriptData.userId,
      topic: scriptData.topic,
      createdAt: scriptData.createdAt,
      duration: scriptData.duration
    });
    
    // Generate a download URL for the script (in a real app, this would be a real URL)
    const downloadUrl = `/api/scripts/download?id=${Date.now()}`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Script saved successfully',
      scriptId: Date.now().toString(),
      downloadUrl
    });
  } catch (error) {
    console.error('Error saving script:', error);
    return NextResponse.json(
      { error: 'Failed to save script' },
      { status: 500 }
    );
  }
} 