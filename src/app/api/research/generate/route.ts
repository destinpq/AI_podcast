import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate comprehensive research about "${topic}". Include:
1. Key findings and insights
2. Supporting evidence and data
3. Relevant sources and references
4. Potential implications or applications

Format the response as a JSON object with the following structure:
{
  "keyFindings": ["finding1", "finding2", ...],
  "sources": ["source1", "source2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a research assistant that provides well-structured, factual information with proper citations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating research:', error);
    return NextResponse.json(
      { error: 'Failed to generate research' },
      { status: 500 }
    );
  }
} 