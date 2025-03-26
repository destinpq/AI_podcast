import { NextResponse } from 'next/server';
import axios from 'axios';

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
  relatedQueries: string[];
}

interface NewsAPIArticle {
  title: string;
  source: {
    name: string;
    id?: string;
  };
  url: string;
  publishedAt: string;
  description?: string;
  content?: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
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

    // API Key for NewsAPI - you should store this in an environment variable
    const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
    
    // Generate mock data for discussions
    const discussionTopics = [
      `Impact of ${topic} on industry`,
      `The future of ${topic}`,
      `${topic}: Community insights and experiences`,
      `How ${topic} is changing the market`,
      `${topic} vs traditional approaches`
    ];

    // Generate related queries based on the topic
    const relatedQueries = [
      `${topic} trends`,
      `${topic} benefits`,
      `${topic} future`,
      `${topic} challenges`,
      `${topic} industry`,
      `latest ${topic} developments`,
      `${topic} technology`
    ];

    // If NewsAPI key is not available, use mock data
    if (!NEWS_API_KEY) {
      console.warn('NEWS_API_KEY is not defined in environment variables, using mock data');
      
      const mockNewsData: TrendingContent[] = [
        {
          title: `Latest developments in ${topic}`,
          source: 'Tech News',
          url: 'https://example.com/tech-news',
          publishedAt: new Date().toISOString()
        },
        {
          title: `Why ${topic} is trending today`,
          source: 'Industry Weekly',
          url: 'https://example.com/industry-weekly',
          publishedAt: new Date().toISOString()
        },
        {
          title: `${topic}: A comprehensive guide`,
          source: 'Digital Trends',
          url: 'https://example.com/digital-trends',
          publishedAt: new Date().toISOString()
        },
        {
          title: `How ${topic} is revolutionizing the industry`,
          source: 'Innovation Today',
          url: 'https://example.com/innovation-today',
          publishedAt: new Date().toISOString()
        }
      ];

      const mockTrendsData: TrendsData = {
        news: mockNewsData,
        discussions: discussionTopics.map((title, index) => ({
          title,
          source: 'Community Forums',
          url: `https://example.com/discussions/${index}`,
          score: Math.floor(Math.random() * 1000) + 100,
        })),
        relatedQueries,
      };

      return NextResponse.json(mockTrendsData);
    }

    // If NewsAPI key is available, fetch real data
    // Fetch news articles related to the topic
    const newsResponse = await axios.get<NewsAPIResponse>(`https://newsapi.org/v2/everything`, {
      params: {
        q: topic,
        sortBy: 'popularity',
        language: 'en',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      }
    });

    // Fetch top headlines that might be related
    const headlinesResponse = await axios.get<NewsAPIResponse>(`https://newsapi.org/v2/top-headlines`, {
      params: {
        q: topic,
        language: 'en',
        pageSize: 5,
        apiKey: NEWS_API_KEY
      }
    });

    // Process and format the data
    const processedData: TrendsData = {
      news: newsResponse.data.articles.map((article: NewsAPIArticle) => ({
        title: article.title,
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt,
      })),
      discussions: discussionTopics.map((title, index) => ({
        title,
        source: 'Community Forums',
        url: `https://example.com/discussions/${index}`,
        score: Math.floor(Math.random() * 1000) + 100, // Random score for demonstration
      })),
      relatedQueries,
    };

    // Add any top headlines that weren't already included
    if (headlinesResponse.data.articles.length > 0) {
      const existingTitles = new Set(processedData.news.map(n => n.title));
      
      headlinesResponse.data.articles.forEach((article: NewsAPIArticle) => {
        if (!existingTitles.has(article.title)) {
          processedData.news.push({
            title: article.title,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
          });
        }
      });
    }

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching trends:', error);
    
    // Return mock data in case of any error
    const { topic } = await request.json();
    
    const mockTrendsData: TrendsData = {
      news: [
        {
          title: `Latest developments in ${topic}`,
          source: 'Tech News',
          url: 'https://example.com/tech-news',
          publishedAt: new Date().toISOString()
        },
        {
          title: `Why ${topic} is trending today`,
          source: 'Industry Weekly',
          url: 'https://example.com/industry-weekly',
          publishedAt: new Date().toISOString()
        }
      ],
      discussions: [
        {
          title: `Impact of ${topic} on industry`,
          source: 'Community Forums',
          url: 'https://example.com/discussions/1',
          score: 890
        },
        {
          title: `The future of ${topic}`,
          source: 'Community Forums',
          url: 'https://example.com/discussions/2',
          score: 745
        }
      ],
      relatedQueries: [
        `${topic} trends`,
        `${topic} benefits`,
        `${topic} future`
      ]
    };
    
    return NextResponse.json(mockTrendsData);
  }
} 