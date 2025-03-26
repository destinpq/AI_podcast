import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Outline {
  title: string;
  sections: {
    title: string;
    points: string[];
  }[];
}

interface SelectedPoint {
  sectionTitle: string;
  point: string;
}

interface TrendingContent {
  title: string;
  source: string;
  url: string;
  score?: number;
  publishedAt?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
});

// Constants for timing calculations
const WORDS_PER_MINUTE = 150;
const PAUSE_TIME = 2; // seconds
const PAUSES_PER_MINUTE = 3;

function calculateWordCount(duration: number, pauses: number): number {
  const totalPauseTime = pauses * PAUSE_TIME;
  const speakingTime = duration * 60 - totalPauseTime;
  return Math.floor((speakingTime / 60) * WORDS_PER_MINUTE);
}

async function fetchTrends(topic: string): Promise<{
  news: TrendingContent[];
  discussions: TrendingContent[];
  relatedQueries: string[];
}> {
  try {
    // Create mock trends data as fallback
    const mockTrendsData = {
      news: [
        {
          title: `Latest developments in ${topic}`,
          source: 'Tech News',
          url: 'https://example.com/1',
          publishedAt: new Date().toISOString()
        },
        {
          title: `Why ${topic} is trending today`,
          source: 'Industry Weekly',
          url: 'https://example.com/2',
          publishedAt: new Date().toISOString()
        }
      ],
      discussions: [
        {
          title: `Discussion: Impact of ${topic} on industry`,
          source: 'Community Forums',
          url: 'https://reddit.com/r/technology',
          score: 1500
        },
        {
          title: `${topic}: Community insights and experiences`,
          source: 'Community Forums',
          url: 'https://reddit.com/r/programming',
          score: 1200
        }
      ],
      relatedQueries: [
        `${topic} trends`,
        `${topic} future`,
        `${topic} benefits`,
        `${topic} industry impact`
      ]
    };
    
    return mockTrendsData;
  } catch (error) {
    console.error('Error fetching trends:', error);
    
    // Return basic mock data if all else fails
    return {
      news: [
        {
          title: `Latest on ${topic}`,
          source: 'News Source',
          url: 'https://example.com',
          publishedAt: new Date().toISOString()
        }
      ],
      discussions: [
        {
          title: `Discussion about ${topic}`,
          source: 'Forum',
          url: 'https://example.com/forum',
          score: 100
        }
      ],
      relatedQueries: [`${topic} info`, `${topic} overview`]
    };
  }
}

async function generateScriptPart(
  section: Outline['sections'][0],
  selectedPoints: SelectedPoint[],
  duration: number,
  personalExperiences: string[],
  trendsData: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  },
  openai: OpenAI
): Promise<string> {
  const sectionPoints = selectedPoints
    .filter((p) => p.sectionTitle === section.title)
    .map((p) => p.point);

  const speakerRoles = {
    host: "You are an engaging podcast host with deep knowledge and a conversational style. Share personal experiences and connect with listeners.",
    expert: "You are a subject matter expert who provides mind-blowing facts and unique insights. Make complex topics accessible and fascinating.",
    storyteller: "You are a skilled storyteller who weaves personal experiences with expert knowledge to create compelling narratives."
  };

  const prompt = `Create an engaging podcast script section for "${section.title}" that includes:

1. Personal Experiences:
${personalExperiences.map(exp => `- ${exp}`).join('\n')}

2. Latest Trends and News:
${trendsData.news.slice(0, 3).map(news => `- ${news.title} (${news.source})`).join('\n')}

3. Current Discussions:
${trendsData.discussions.slice(0, 3).map(discussion => `- ${discussion.title} (${discussion.source})`).join('\n')}

4. Related Topics:
${trendsData.relatedQueries.slice(0, 3).map(query => `- ${query}`).join('\n')}

5. Structure:
- Start with a hook that grabs attention
- Weave personal experiences with expert insights
- Include natural transitions between points
- End with a thought-provoking conclusion

6. Points to Cover:
${sectionPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

7. Style:
- Use conversational, engaging language
- Include rhetorical questions and listener engagement
- Add emotional resonance and personal connection
- Maintain professional credibility while being relatable
- Reference current trends and news naturally
- Connect discussions to broader context

Speaker Roles:
${Object.entries(speakerRoles).map(([role, description]) => `${role.toUpperCase()}: ${description}`).join('\n')}

Format the response as a natural conversation between the host and expert, with clear speaker labels (HOST, EXPERT, STORYTELLER).
Target approximately ${calculateWordCount(duration, PAUSES_PER_MINUTE)} words for this section.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a podcast script writer specializing in creating engaging, humanized content that combines personal experiences with expert insights and current trends."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content || '';
}

export async function POST(request: Request) {
  try {
    const { outline, selectedPoints, duration, personalExperiences, topic } = await request.json();

    if (!outline || !selectedPoints || !duration || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch latest trends and relevant content
    const trendsData = await fetchTrends(topic);

    // Generate script parts in parallel
    const scriptPartPromises = outline.sections.map((section: Outline['sections'][0]) =>
      generateScriptPart(section, selectedPoints, duration, personalExperiences || [], trendsData, openai)
    );

    const scriptParts = await Promise.all(scriptPartPromises);

    // Combine all parts with transitions
    const fullScript = scriptParts.join('\n\n[TRANSITION]\n\n');

    return NextResponse.json({
      script: fullScript,
      metadata: {
        totalDuration: duration,
        sections: outline.sections.length,
        wordCount: fullScript.split(/\s+/).length,
        trendsUsed: {
          newsCount: trendsData.news.length,
          discussionsCount: trendsData.discussions.length,
          relatedQueriesCount: trendsData.relatedQueries.length,
        },
      },
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 