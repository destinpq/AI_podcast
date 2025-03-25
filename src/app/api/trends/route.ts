import { NextResponse } from 'next/server';

interface TrendingContent {
  title: string;
  source: string;
  url: string;
  score?: number;
  publishedAt?: string;
}

interface TrendsData {
  news: TrendingContent[];
  discussions: TrendingContent[];
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // For now, return mock data that simulates news and Reddit discussions
    // In production, you would replace this with actual API calls to NewsAPI and Reddit
    const mockTrendsData: TrendsData = {
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
          source: 'Reddit r/technology',
          url: 'https://reddit.com/r/technology',
          score: 1500
        },
        {
          title: `${topic}: Community insights and experiences`,
          source: 'Reddit r/programming',
          url: 'https://reddit.com/r/programming',
          score: 1200
        }
      ]
    };

    return NextResponse.json(mockTrendsData);
  } catch (error) {
    console.error('Trends API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
} 