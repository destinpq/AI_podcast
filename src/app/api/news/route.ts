import { NextResponse } from 'next/server';

// Mock news data for demo mode (when API key is not available)
const getMockNewsData = (query: string) => {
  return {
    status: 'ok',
    totalResults: 5,
    articles: [
      {
        source: { id: 'tech-crunch', name: 'TechCrunch' },
        author: 'Jane Smith',
        title: `Latest developments in ${query} technology`,
        description: `A comprehensive overview of the latest trends in ${query}, focusing on breakthrough technologies and implementations.`,
        url: 'https://techcrunch.com/example',
        urlToImage: 'https://example.com/image1.jpg',
        publishedAt: new Date().toISOString(),
        content: 'Lorem ipsum dolor sit amet...'
      },
      {
        source: { id: 'wired', name: 'Wired' },
        author: 'John Doe',
        title: `How ${query} is transforming the industry`,
        description: `An in-depth analysis of how ${query} solutions are revolutionizing traditional business models and creating new opportunities.`,
        url: 'https://wired.com/example',
        urlToImage: 'https://example.com/image2.jpg',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        content: 'Lorem ipsum dolor sit amet...'
      },
      {
        source: { id: 'cnn', name: 'CNN' },
        author: 'Robert Johnson',
        title: `The future of ${query}: What experts are saying`,
        description: `Leading experts in the field of ${query} share their predictions about where the technology is headed in the next decade.`,
        url: 'https://cnn.com/example',
        urlToImage: 'https://example.com/image3.jpg',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        content: 'Lorem ipsum dolor sit amet...'
      },
      {
        source: { id: 'bbc', name: 'BBC' },
        author: 'Emily Brown',
        title: `${query} adoption growing worldwide`,
        description: `A global survey shows that ${query} implementation has increased by 35% in the last quarter, with particularly strong growth in emerging markets.`,
        url: 'https://bbc.com/example',
        urlToImage: 'https://example.com/image4.jpg',
        publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        content: 'Lorem ipsum dolor sit amet...'
      },
      {
        source: { id: 'forbes', name: 'Forbes' },
        author: 'Michael Wilson',
        title: `Top 5 ${query} startups to watch in 2023`,
        description: `These innovative startups are making waves in the ${query} space with their groundbreaking approaches and technologies.`,
        url: 'https://forbes.com/example',
        urlToImage: 'https://example.com/image5.jpg',
        publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        content: 'Lorem ipsum dolor sit amet...'
      }
    ]
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // Use News API if key is available, otherwise use mock data
  const apiKey = process.env.NEWS_API_KEY;
  
  try {
    if (!apiKey) {
      console.log('NEWS_API_KEY not found, using mock data');
      return NextResponse.json(getMockNewsData(query));
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&language=en&pageSize=10&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Fall back to mock data on error
    return NextResponse.json(getMockNewsData(query));
  }
} 