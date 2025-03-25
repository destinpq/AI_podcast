import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Trend {
  title: string;
  traffic: string;
  articles: string[];
}

export async function POST(request: Request) {
  try {
    const { topic, trends } = await request.json();

    if (!topic || !trends) {
      return NextResponse.json(
        { error: 'Topic and trends are required' },
        { status: 400 }
      );
    }

    // Create a prompt for OpenAI
    const prompt = `Based on the following research topic and related trends, provide detailed recommendations for research and content creation:

Topic: ${topic}

Related Trends:
${trends.map((trend: Trend) => `- ${trend.title} (Traffic: ${trend.traffic})`).join('\n')}

Please provide:
1. Key research areas to focus on
2. Potential angles for content creation
3. Related topics to explore
4. Suggested outline for a comprehensive article
5. Key questions to address in the research

Format the response in a clear, structured way.`;

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a research and content strategy expert. Provide detailed, actionable recommendations based on the given topic and trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const recommendations = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ 
      trends,
      recommendations 
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
} 