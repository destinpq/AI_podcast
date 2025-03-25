import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const googleTrends = google.trends('v1');

interface TrendingSearch {
  title?: {
    query: string;
  };
  formattedTraffic?: string;
  articles?: Array<{
    title: string;
  }>;
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

    // Get real-time trends data
    const trendsResponse = await googleTrends.realtimeTrends({
      geo: 'US',
      hl: 'en-US',
    });

    // Get related queries
    const relatedQueriesResponse = await googleTrends.relatedQueries({
      keyword: topic,
      geo: 'US',
      hl: 'en-US',
    });

    // Process and format the data
    const trends = trendsResponse.data.trendingSearchesDays?.[0]?.trendingSearches?.map((trend: TrendingSearch) => ({
      title: trend.title?.query || '',
      traffic: trend.formattedTraffic || '0',
      articles: trend.articles?.map((article: { title: string }) => article.title) || [],
    })) || [];

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends data' },
      { status: 500 }
    );
  }
} 