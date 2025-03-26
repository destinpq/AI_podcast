import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }
    
    // Attempt to fetch news from the API
    try {
      const articles = await fetchNewsArticles(query);
      return NextResponse.json({ articles });
    } catch (apiError) {
      console.error('News API error:', apiError);
      
      // Fallback to generating mock news articles
      const mockArticles = generateMockArticles(query);
      return NextResponse.json({ 
        articles: mockArticles,
        notice: 'Using generated news due to API limitations'
      });
    }
  } catch (error) {
    console.error('Error in news API route:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

async function fetchNewsArticles(query: string) {
  // If no API key, use mock data
  if (!NEWS_API_KEY) {
    console.log('No News API key found, using mock data');
    return generateMockArticles(query);
  }
  
  try {
    // Build the API URL with params
    const url = new URL(NEWS_API_URL);
    url.searchParams.append('q', query);
    url.searchParams.append('sortBy', 'relevancy');
    url.searchParams.append('language', 'en');
    url.searchParams.append('pageSize', '10');
    url.searchParams.append('apiKey', NEWS_API_KEY);
    
    // Make the request
    const response = await fetch(url.toString(), { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    // Check for a successful response
    if (!response.ok) {
      console.error(`News API error: ${response.status} ${response.statusText}`);
      throw new Error(`News API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if data has articles
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid response from News API:', data);
      throw new Error('Invalid response from News API');
    }
    
    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

function generateMockArticles(query: string) {
  // Generate random dates within the past month
  const getRandomDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    return date.toISOString();
  };
  
  // Generate random text snippet
  const getRandomSnippet = () => {
    const snippets = [
      `New research on ${query} reveals surprising connections to everyday life.`,
      `Experts debate the implications of recent ${query} developments.`,
      `How ${query} is changing the landscape of modern society.`,
      `The unexpected ways ${query} impacts various industries.`,
      `Understanding ${query}: A comprehensive analysis.`
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
  };
  
  // Generate random source
  const getRandomSource = () => {
    const sources = [
      'Science Daily', 'Tech Insider', 'Research Journal', 'Innovation Today',
      'The Academic Review', 'Future Trends', 'Global Insights'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  };
  
  // Generate mock articles
  return Array(8).fill(null).map((_, index) => ({
    title: `${index === 0 ? 'Breaking: ' : ''}${getRandomSnippet()}`,
    description: `This article explores various aspects of ${query} including recent advancements, challenges, and future prospects. Researchers have been examining this topic in depth.`,
    url: `https://example.com/article/${Math.random().toString(36).substring(2, 10)}`,
    urlToImage: `https://source.unsplash.com/featured/600x350?${encodeURIComponent(query)}&sig=${index}`,
    publishedAt: getRandomDate(),
    source: {
      name: getRandomSource(),
      id: `source-${index}`
    }
  }));
} 