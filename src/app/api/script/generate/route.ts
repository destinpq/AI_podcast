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
  elaboration?: string;
  promptType?: 'life_experience' | 'joke' | 'analogy' | 'example' | 'statistic' | 'quote';
}

interface TrendingContent {
  title: string;
  source: string;
  url: string;
  score?: number;
  publishedAt?: string;
}

interface UserReference {
  id: string;
  type: 'article' | 'factoid' | 'stat';
  content: string;
  url?: string;
  source?: string;
  description?: string;
  thumbnail?: string;
  color?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'invalid-key', // Fallback for demo mode
  timeout: 60000, // Reduced timeout to 25 seconds
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
  userReferences: UserReference[] = [],
  memberCount: number = 1,
  targetWordCount: { min: number; max: number } = { min: 0, max: 0 }
): Promise<string> {
  const sectionPoints = selectedPoints
    .filter((p) => p.sectionTitle === section.title)
    .map((p) => p.point);

  // Extract user references based on type
  const articleReferences = userReferences
    .filter(ref => ref.type === 'article')
    .map(ref => `- ${ref.content}${ref.source ? ` (Source: ${ref.source})` : ''}${ref.description ? ` - ${ref.description}` : ''}`);

  const factReferences = userReferences
    .filter(ref => ref.type === 'factoid')
    .map(ref => `- ${ref.content}${ref.source ? ` (Source: ${ref.source})` : ''}`);

  const statReferences = userReferences
    .filter(ref => ref.type === 'stat')
    .map(ref => `- ${ref.content}${ref.source ? ` (Source: ${ref.source})` : ''}`);

  const speakerRoles = {
    host: "You are an engaging podcast host with deep knowledge and a conversational style. Share personal experiences and connect with listeners.",
    expert: "You are a subject matter expert who provides mind-blowing facts and unique insights. Make complex topics accessible and fascinating.",
    storyteller: "You are a skilled storyteller who weaves personal experiences with expert knowledge to create compelling narratives."
  };
  
  // Calculate target word count for this section
  const calculatedWordCount = calculateWordCount(duration, PAUSES_PER_MINUTE);
  const minWords = targetWordCount.min > 0 ? targetWordCount.min : calculatedWordCount * 0.8;
  const maxWords = targetWordCount.max > 0 ? targetWordCount.max : calculatedWordCount * 1.2;

  // Build the prompt with stronger instructions to include news and facts
  const prompt = `Create an engaging podcast script section for "${section.title}" that includes:

1. Personal Experiences:
${personalExperiences.map(exp => `- ${exp}`).join('\n')}

2. Latest Trends and News (REQUIRED - include at least 2 news references):
${trendsData.news.slice(0, 3).map(news => `- ${news.title} (${news.source})`).join('\n')}

3. Current Discussions:
${trendsData.discussions.slice(0, 3).map(discussion => `- ${discussion.title} (${discussion.source})`).join('\n')}

4. Related Topics:
${trendsData.relatedQueries.slice(0, 3).map(query => `- ${query}`).join('\n')}

${articleReferences.length > 0 ? `
5. REQUIRED - News Articles to Reference (include ALL of these):
${articleReferences.join('\n')}
` : ''}

${factReferences.length > 0 ? `
6. REQUIRED - Unique Facts to Include (include ALL of these):
${factReferences.join('\n')}
` : ''}

${statReferences.length > 0 ? `
7. REQUIRED - Statistics to Reference (include ALL of these):
${statReferences.join('\n')}
` : ''}

8. Structure:
- Start with a hook that grabs attention
- Weave news articles, facts, and statistics naturally throughout the script
- Include dialog between ${memberCount} speakers
- End with a thought-provoking conclusion

9. Points to Cover:
${sectionPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

10. Style:
- Use conversational, engaging language
- Include rhetorical questions and listener engagement
- Add emotional resonance and personal connection
- Maintain professional credibility while being relatable
- Reference current trends and news naturally
- Connect discussions to broader context

Speaker Roles (for ${memberCount}-person podcast):
${Object.entries(speakerRoles).slice(0, memberCount).map(([role, description]) => `${role.toUpperCase()}: ${description}`).join('\n')}

Format Requirements:
1. Format as a natural conversation between the speakers with clear labels (HOST:, EXPERT:, etc.)
2. Include [PAUSE] or [BEAT] for dramatic effects or transitions
3. TARGET WORD COUNT: Between ${Math.round(minWords)} and ${Math.round(maxWords)} words
4. For a ${duration}-minute section, aim for approximately ${calculatedWordCount} words
5. IMPORTANT: Always refer to mentioned facts, statistics, and news by explicitly citing them

Generate an asynchronously threaded conversation where speakers build on each other's points naturally.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a podcast script writer specializing in creating engaging, humanized content that combines personal experiences with expert insights, news articles, and factual information. Ensure all references to news and facts are EXPLICITLY included in the script."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000, // Increased token limit to ensure full script generation
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error("Error generating script with OpenAI:", error);
    
    // Return a fallback script if there's an error
    return `HOST: Welcome to our discussion on ${section.title}. Today we'll be exploring some fascinating aspects of this topic.
    
EXPERT: That's right! And we have some interesting news to share. ${articleReferences[0] || "Recent developments in this field have been remarkable."}

HOST: I'd also like to share an interesting fact: ${factReferences[0] || "This topic has been growing in popularity over recent years."}

${sectionPoints.map(point => `EXPERT: Let's talk about ${point}\n\nHOST: That's a great insight!\n`).join('\n')}

HOST: Thank you for joining us for this discussion. In our next segment, we'll continue exploring these fascinating ideas.`;
  }
}

export async function POST(request: Request) {
  try {
    const { 
      outline, 
      selectedPoints, 
      duration, 
      personalExperiences, 
      topic,
      trendsData: providedTrendsData,
      userReferences = [],
      memberCount = 1,
      targetWordCount = { min: 0, max: 0 }
    } = await request.json();

    if (!outline || !selectedPoints || !duration || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch latest trends and relevant content
    const trendsData = providedTrendsData || await fetchTrends(topic);

    // Map selected points to the format expected by generateScriptPart
    interface PointWithSection {
      sectionIndex: number;
      text: string;
      elaboration?: string;
      promptType?: 'life_experience' | 'joke' | 'analogy' | 'example' | 'statistic' | 'quote';
    }

    const mappedSelectedPoints = selectedPoints.map((point: PointWithSection) => ({
      sectionTitle: outline.sections[point.sectionIndex].title,
      point: point.text,
      elaboration: point.elaboration,
      promptType: point.promptType,
    }));

    // Generate the script section
    const script = await generateScriptPart(
      outline.sections[0],
      mappedSelectedPoints,
      duration,
      personalExperiences || [],
      trendsData,
      userReferences,
      memberCount,
      targetWordCount
    );

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 