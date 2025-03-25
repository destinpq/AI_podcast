import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface TrendingContent {
  title: string;
  source: string;
  url: string;
  score?: number;
  publishedAt?: string;
}

interface RequestBody {
  topic: string;
  trendsData?: {
    news: TrendingContent[];
    discussions: TrendingContent[];
  };
  duration: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { topic, trendsData, duration }: RequestBody = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Calculate optimal content structure based on duration
    const targetDuration = duration || 30; // Default to 30 minutes if not specified
    const sections = Math.max(3, Math.min(6, Math.floor(targetDuration / 5))); // 3-6 sections, 5 minutes each
    const wordsPerSection = Math.floor((targetDuration * 150) / sections); // 150 words per minute

    // Create a more focused prompt
    const prompt = `Create a detailed podcast outline for a ${targetDuration}-minute episode about "${topic}".
Include ${sections} main sections, each with 2-3 key points.
Each section should be approximately ${wordsPerSection} words.

${trendsData ? `Consider these trending topics:
${JSON.stringify(trendsData, null, 2)}` : ''}

Format the response as a JSON object with this structure:
{
  "title": "Episode Title",
  "sections": [
    {
      "title": "Section Title",
      "points": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a podcast script writer. Create engaging, well-structured outlines that maintain listener interest."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000, // Limit response size
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
} 