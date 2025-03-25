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
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Calculate optimal content structure based on duration
    const sectionsCount = duration <= 15 ? 3 : duration <= 30 ? 4 : 5;
    const pointsPerSection = duration <= 15 ? 2 : duration <= 30 ? 3 : 4;
    const timePerPoint = Math.floor(duration / (sectionsCount * pointsPerSection));

    // Create a prompt that incorporates trending content and duration
    let prompt = `Create a detailed podcast outline for a ${duration}-minute episode about "${topic}". 

Content Structure Guidelines:
- The outline should be perfectly timed for a ${duration}-minute podcast
- Include ${sectionsCount} main sections
- Each section should have ${pointsPerSection} key points
- Allocate roughly ${timePerPoint} minutes per discussion point
- Include time for intro (1-2 min) and outro (1-2 min)
- Factor in transition time between sections (30 sec each)`;

    if (trendsData) {
      prompt += "\n\nIncorporate insights from these recent sources:";
      
      if (trendsData.news?.length > 0) {
        prompt += "\nNews articles:";
        trendsData.news.forEach((item: TrendingContent) => {
          prompt += `\n- ${item.title} (from ${item.source})`;
        });
      }

      if (trendsData.discussions?.length > 0) {
        prompt += "\nOnline discussions:";
        trendsData.discussions.forEach((item: TrendingContent) => {
          prompt += `\n- ${item.title} (${item.source}, ${item.score || 0} engagement)`;
        });
      }
    }

    prompt += `\n\nCreate an outline following this structure:
1. A catchy, SEO-friendly title for the podcast episode
2. ${sectionsCount} main sections, each with:
   - An engaging section heading
   - ${pointsPerSection} key points to discuss
   - Estimated time allocation for each point
   
Format the response as a JSON object with this structure:
{
  "title": "Episode Title",
  "sections": [
    {
      "title": "Section Heading",
      "points": ["Point 1 (X min)", "Point 2 (Y min)", "Point 3 (Z min)"]
    }
  ]
}

Ensure the total time allocation matches the ${duration}-minute target.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert podcast outline creator that generates well-structured, time-optimized outlines. You understand pacing, timing, and how to structure content for ${duration}-minute episodes.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const outlineResponse = completion.choices[0].message.content;
    if (!outlineResponse) {
      throw new Error('Failed to generate outline');
    }

    const outline = JSON.parse(outlineResponse);
    return NextResponse.json(outline);
  } catch (error) {
    console.error('Outline Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
} 