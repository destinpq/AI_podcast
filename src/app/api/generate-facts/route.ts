import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'invalid-key', // Fallback for demo mode
  timeout: 60000, // Reduced timeout for consistent behavior
});

// Generate interesting facts for a topic using OpenAI
async function generateFacts(topic: string): Promise<string[]> {
  try {
    // If we're in demo mode without an API key, return mock data
    if (process.env.OPENAI_API_KEY === 'invalid-key') {
      return [
        `The term "${topic}" first appeared in published literature in the early 1980s, though the concept had been around much longer.`,
        `Approximately 72% of industry professionals consider ${topic} to be one of the most important developments in their field in the last decade.`,
        `The global market for ${topic}-related products and services is projected to reach $500 billion by 2030.`,
        `Researchers have identified at least 15 different ways that ${topic} can be applied to solve current environmental challenges.`,
        `A surprising study from 2022 revealed that ${topic} techniques can improve efficiency by up to 45% in traditional workflows.`
      ];
    }

    // Generate facts with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a specialized AI for generating interesting, surprising, and factual information about various topics. Your facts should be engaging, educational, and relevant."
        },
        {
          role: "user",
          content: `Generate 6 fascinating facts about "${topic}".
          
          Each fact should:
          1. Be surprising, interesting, or counter-intuitive
          2. Be specific and detailed (include statistics, dates, or specific research when relevant)
          3. Be suitable for a podcast discussion
          4. Be diverse (cover different aspects of the topic)
          
          Format the response as a JSON array of strings, with each string being a complete fact.
          Make sure the facts are plausible and realistic, even if you need to use phrases like "research suggests" or "experts estimate" for less certain information.`
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
    return parsedResponse.facts || [];
  } catch (error) {
    console.error('Error generating facts with OpenAI:', error);
    
    // Return mock data on error
    return [
      `Did you know that ${topic} has been studied by researchers for over 30 years?`,
      `A recent survey showed that over 60% of people are interested in learning more about ${topic}.`,
      `The most surprising aspect of ${topic} is how it connects to seemingly unrelated fields like psychology and economics.`
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

    const facts = await generateFacts(topic);
    
    return NextResponse.json({ facts });
  } catch (error) {
    console.error('Error in generate-facts API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate facts' },
      { status: 500 }
    );
  }
} 