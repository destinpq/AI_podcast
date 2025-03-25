import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

export interface TrendingContent {
  title: string;
  traffic: string;
  link: string;
  source: string;
  publishedAt: string;
}

export interface TrendsData {
  news: TrendingContent[];
  discussions: TrendingContent[];
}

interface StorySummary {
  articleTitle: string;
  traffic?: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface RelatedQuery {
  query: string;
  value?: string;
}

interface GoogleTrendsResponse {
  storySummaries?: StorySummary[];
}

interface RelatedQueriesResponse {
  related_queries?: {
    [key: string]: {
      top?: RelatedQuery[];
    };
  };
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
    const trendsData = await googleTrends.realTimeTrends({
      geo: 'US',
      hl: 'en-US',
      keyword: topic
    });

    // Get related queries
    const relatedQueries = await googleTrends.relatedQueries({
      keyword: topic,
      geo: 'US',
      hl: 'en-US'
    });

    // Process and format the data
    const processedData: TrendsData = {
      news: [],
      discussions: []
    };

    // Parse the trends data and extract relevant information
    const parsedTrends = JSON.parse(trendsData) as GoogleTrendsResponse;
    if (parsedTrends.storySummaries) {
      processedData.news = parsedTrends.storySummaries.map((story: StorySummary) => ({
        title: story.articleTitle,
        traffic: story.traffic || 'N/A',
        link: story.url,
        source: story.source,
        publishedAt: story.publishedAt
      }));
    }

    // Add related queries to discussions
    if (relatedQueries) {
      const parsedQueries = JSON.parse(relatedQueries) as RelatedQueriesResponse;
      if (parsedQueries.related_queries) {
        const topQueries = parsedQueries.related_queries[topic]?.top || [];
        processedData.discussions = topQueries.map((query: RelatedQuery) => ({
          title: query.query,
          traffic: query.value || 'N/A',
          link: `https://www.google.com/search?q=${encodeURIComponent(query.query)}`,
          source: 'Google Trends',
          publishedAt: new Date().toISOString()
        }));
      }
    }

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends data' },
      { status: 500 }
    );
  }
} 