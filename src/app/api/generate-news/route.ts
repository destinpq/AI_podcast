import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'invalid-key', // Fallback for demo mode
  timeout: 60000, // Reduced timeout for consistent behavior
});

// Generate news articles for a topic using OpenAI
async function generateAINews(topic: string): Promise<{ title: string, content: string }[]> {
  try {
    // If we're in demo mode without an API key, return mock data
    if (process.env.OPENAI_API_KEY === 'invalid-key') {
      return [
        {
          title: `Breaking: New developments in ${topic} shake up the industry`,
          content: `Recent innovations in ${topic} are causing major shifts in how businesses approach their strategies. Experts suggest this could lead to unprecedented growth.`
        },
        {
          title: `${topic} experts reveal surprising insights in new study`,
          content: `A comprehensive study published this week unveiled several unexpected findings about ${topic}, challenging conventional wisdom and opening new avenues for research.`
        },
        {
          title: `How ${topic} is transforming daily life around the world`,
          content: `From urban centers to rural communities, ${topic} technologies are creating remarkable changes in how people live, work, and interact with their environments.`
        },
        {
          title: `The future of ${topic}: Predictions from leading analysts`,
          content: `Industry analysts have released their projections for the next decade of ${topic} development, highlighting opportunities for innovation and potential challenges.`
        }
      ];
    }

    // Generate news with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a specialized AI for generating realistic, informative news article summaries. Create balanced, factual, and engaging content."
        },
        {
          role: "user",
          content: `Generate 5 different news article summaries about "${topic}". 
          
          Each article should include:
          1. A compelling headline/title
          2. A brief summary of the article content (2-3 sentences)
          
          Format the response as a JSON array with objects containing 'title' and 'content' fields.
          Make these sound like actual news articles - balanced, informative, and diverse in perspective.
          Cover different aspects of the topic, including recent developments, research, impact, industry perspectives, and future outlook.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parse the JSON response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedResponse = JSON.parse(content);
    return parsedResponse.articles || [];
  } catch (error) {
    console.error('Error generating news with OpenAI:', error);
    
    // Return mock data on error
    return [
      {
        title: `Latest developments in ${topic}`,
        content: `A recent breakthrough in ${topic} has researchers excited about potential applications in everyday technology.`
      },
      {
        title: `${topic} market expected to grow in coming years`,
        content: `Industry analysts predict significant expansion in the ${topic} sector, with new opportunities for businesses and consumers alike.`
      }
    ];
  }
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

    const news = await generateAINews(topic);
    
    return NextResponse.json({ news });
  } catch (error) {
    console.error('Error in generate-news API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate news' },
      { status: 500 }
    );
  }
} 