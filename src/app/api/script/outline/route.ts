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
    relatedQueries?: string[];
  };
  duration: number;
}

// Default outline to use as fallback when API calls fail
const generateDefaultOutline = (topic: string, duration: number = 30) => {
  const sections = Math.max(3, Math.min(6, Math.floor(duration / 5)));
  
  return {
    title: `The Complete Guide to ${topic}`,
    sections: [
      {
        title: `Introduction to ${topic}`,
        points: [
          `Welcome and introduction to today's topic: ${topic}`,
          `Why ${topic} matters in today's world`,
          `What listeners will learn from this episode`
        ]
      },
      {
        title: `Key Aspects of ${topic}`,
        points: [
          `The main components of ${topic}`,
          `How ${topic} has evolved over time`,
          `Current trends and developments in ${topic}`
        ]
      },
      {
        title: `Practical Applications of ${topic}`,
        points: [
          `Real-world examples of ${topic} in action`,
          `How listeners can apply ${topic} in their lives`,
          `Tools and resources related to ${topic}`
        ]
      },
      {
        title: `Challenges and Opportunities in ${topic}`,
        points: [
          `Common obstacles when dealing with ${topic}`,
          `Emerging opportunities in the field of ${topic}`,
          `Expert opinions on the future of ${topic}`
        ]
      },
      {
        title: `Conclusion and Next Steps`,
        points: [
          `Recap of key insights about ${topic}`,
          `Actionable steps for listeners interested in ${topic}`,
          `Preview of related topics for future episodes`
        ]
      }
    ].slice(0, sections)
  };
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-api-key',
  timeout: 25000, // Reduced timeout for consistent behavior
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-api-key') {
      console.log('Using default outline (no valid API key)');
      return NextResponse.json(generateDefaultOutline(topic, duration));
    }

    // Calculate optimal content structure based on duration
    const targetDuration = duration || 30; // Default to 30 minutes if not specified
    const sections = Math.max(3, Math.min(6, Math.floor(targetDuration / 5))); // 3-6 sections, 5 minutes each
    const wordsPerSection = Math.floor((targetDuration * 150) / sections); // 150 words per minute

    try {
      // Set up a timeout to ensure we don't wait too long for the API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      // Create a more focused prompt
      const prompt = `Create a podcast outline for a ${targetDuration}-minute episode about "${topic}".
Include ${sections} sections with 2-3 points each.
Target ${wordsPerSection} words per section.

${trendsData?.news && trendsData.news.length > 0 ? `Consider these recent news:
${trendsData.news.slice(0, 3).map(item => `- ${item.title}`).join('\n')}` : ''}

Format as JSON:
{
  "title": "Episode Title",
  "sections": [
    {
      "title": "Section Title",
      "points": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}`;

      // Use gpt-3.5-turbo for faster response and higher reliability
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
        max_tokens: 700, // Reduced token limit
      }).finally(() => clearTimeout(timeoutId));

      let response;
      try {
        response = JSON.parse(completion.choices[0].message.content || '{}');
        
        // Validate response structure
        if (!response.title || !Array.isArray(response.sections)) {
          throw new Error('Invalid outline structure');
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        return NextResponse.json(generateDefaultOutline(topic, duration));
      }

      return NextResponse.json(response);
    } catch (apiError: unknown) {
      console.error('OpenAI API error:', apiError);
      
      // Check if it's an abort error (timeout)
      if (apiError instanceof Error && apiError.name === 'AbortError') {
        console.log('API request timed out, using default outline');
      }
      
      // Return fallback outline on any API error
      return NextResponse.json(generateDefaultOutline(topic, duration));
    }
  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      generateDefaultOutline('podcast topic', 30),
      { status: 200 } // Return 200 status to avoid cascading errors
    );
  }
} 