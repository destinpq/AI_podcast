import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Cache object to store previous results and reduce API calls
const newsCache: Record<string, { data: Record<string, unknown>; timestamp: number }> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }
    
    // Check for cached response first
    const cacheKey = query.toLowerCase().trim();
    const cachedResponse = newsCache[cacheKey];
    
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
      console.log(`Using cached news results for "${query}"`);
      return NextResponse.json(cachedResponse.data);
    }
    
    // Attempt to fetch news from the API
    try {
      const articles = await fetchNewsArticles(query);
      
      // Cache the successful response
      const responseData = { articles };
      newsCache[cacheKey] = {
        data: responseData,
        timestamp: Date.now()
      };
      
      return NextResponse.json(responseData);
    } catch (apiError: unknown) {
      console.error('News API error:', apiError);
      
      // Look for specific rate limit error
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      const isRateLimitError = 
        errorMessage.includes('429') || 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('too many requests');
      
      // Fallback to generating mock news articles
      const mockArticles = generateMockArticles(query);
      const responseData = { 
        articles: mockArticles,
        notice: isRateLimitError 
          ? 'Using generated news due to rate limit restrictions' 
          : 'Using generated news due to API limitations'
      };
      
      // Cache even the fallback response to avoid hammering the API
      newsCache[cacheKey] = {
        data: responseData,
        timestamp: Date.now()
      };
      
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error('Error in news API route:', error);
    // Fall back to a default query in case the original query is not available
    const fallbackQuery = 'news';
    const mockArticles = generateMockArticles(fallbackQuery);
    return NextResponse.json({ 
      articles: mockArticles,
      notice: 'Using generated news due to server error'
    });
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
    
    // Make the request with timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url.toString(), { 
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Handle rate limiting specifically
    if (response.status === 429) {
      console.error('News API rate limit reached');
      throw new Error('News API rate limit exceeded');
    }
    
    // Check for a successful response
    if (!response.ok) {
      console.error(`News API error: ${response.status} ${response.statusText}`);
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if data has articles
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid response from News API:', data);
      throw new Error('Invalid response from News API');
    }
    
    // Add thumbnails for articles without images
    const articlesWithImages = data.articles.map((article: Record<string, unknown>) => {
      if (!article.urlToImage) {
        article.urlToImage = `https://source.unsplash.com/featured/600x350?${encodeURIComponent(query)}&sig=${Math.random().toString().substring(2, 8)}`;
      }
      return article;
    });
    
    return articlesWithImages;
  } catch (error: unknown) {
    // Handle abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('News API request timed out');
      throw new Error('News API request timed out');
    }
    
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
      `Understanding ${query}: A comprehensive analysis.`,
      `The future of ${query} according to leading experts.`,
      `${query} trends that are reshaping the industry.`,
      `Breaking: New discoveries about ${query} challenge conventional wisdom.`,
      `5 things you should know about ${query} in 2023.`,
      `How technology is transforming the ${query} landscape.`
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
  };
  
  // Generate random source
  const getRandomSource = () => {
    const sources = [
      'Science Daily', 'Tech Insider', 'Research Journal', 'Innovation Today',
      'The Academic Review', 'Future Trends', 'Global Insights', 'The Daily Wire',
      'Business Review', 'Technology Today', 'Digital Trends', 'Market Watch',
      'Industry Insider', 'News Network', 'The Chronicle'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  };
  
  // Generate random descriptions
  const getRandomDescription = () => {
    const descriptions = [
      `This article explores various aspects of ${query} including recent advancements, challenges, and future prospects. Researchers have been examining this topic in depth.`,
      `A comprehensive look at how ${query} is evolving in today's rapidly changing environment. Industry experts weigh in with their perspectives.`,
      `Recent developments in ${query} are causing experts to reconsider established theories. This article examines the implications for various sectors.`,
      `With increasing interest in ${query}, stakeholders are looking for new ways to adapt. This piece covers the latest trends and innovations.`,
      `An in-depth analysis of ${query} reveals surprising connections with other fields. Researchers discuss potential applications and benefits.`,
      `As ${query} continues to evolve, this article provides insights into what we might expect in the coming years. Includes expert opinions and data analysis.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };
  
  // Generate mock articles with more variety
  return Array(10).fill(null).map((_, index) => {
    const title = `${index < 2 ? 'Breaking: ' : ''}${getRandomSnippet()}`;
    const source = getRandomSource();
    
    return {
      title,
      description: getRandomDescription(),
      url: `https://example.com/article/${Math.random().toString(36).substring(2, 10)}`,
      urlToImage: `https://source.unsplash.com/featured/600x350?${encodeURIComponent(query)}&sig=${index}`,
      publishedAt: getRandomDate(),
      source: {
        name: source,
        id: `source-${source.toLowerCase().replace(/\s/g, '-')}`
      },
      // Add some additional fields that might be useful
      author: index % 3 === 0 ? `Author ${index + 1}` : null,
      content: `${getRandomDescription()} ${getRandomDescription()}`.substring(0, 200) + '...',
    };
  });
} 