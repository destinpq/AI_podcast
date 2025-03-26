import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Generate interesting facts about a topic using OpenAI
export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Missing required parameter: topic' }, { status: 400 });
    }
    
    const facts = await generateFacts(topic);
    return NextResponse.json({ facts });
  } catch (error) {
    console.error('Error in facts API:', error);
    return NextResponse.json({ error: 'Failed to generate facts' }, { status: 500 });
  }
}

async function generateFacts(topic: string): Promise<string[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides interesting facts about various topics. RESPOND ONLY WITH VALID JSON in this format: { \"facts\": [\"fact 1\", \"fact 2\", \"fact 3\", \"fact 4\", \"fact 5\"] }. Do not include any other text outside of the JSON."
        },
        {
          role: "user",
          content: `Generate 5 fascinating facts about ${topic}. Make them accurate, interesting and suitable for use in a podcast. RESPOND WITH VALID JSON ONLY.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    console.log('OpenAI facts response:', completion.choices[0].message.content);
    
    // Get the content from the completion
    const content = completion.choices[0].message.content?.trim() || '';
    
    // Check if content starts and ends with JSON brackets
    if (!content.startsWith('{') || !content.endsWith('}')) {
      console.error('Invalid JSON format received from OpenAI:', content);
      // Try to extract JSON from the response if possible
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJSON = jsonMatch[0];
        console.log('Extracted JSON from response:', extractedJSON);
        try {
          const parsedResponse = JSON.parse(extractedJSON);
          return parsedResponse.facts || [];
        } catch (parseError) {
          console.error('Failed to parse extracted JSON:', parseError);
          // Return a fallback response
          return [
            `Here's an interesting fact about ${topic}`,
            `We're experiencing issues retrieving facts about ${topic}. Please try again.`
          ];
        }
      }
      
      // If no JSON could be extracted, return fallback
      return [
        `Here's an interesting fact about ${topic}`,
        `We're experiencing issues retrieving facts about ${topic}. Please try again.`
      ];
    }
    
    try {
      const parsedResponse = JSON.parse(content);
      return parsedResponse.facts || [];
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Content:', content);
      return [
        `Here's an interesting fact about ${topic}`,
        `We're experiencing issues retrieving facts about ${topic}. Please try again.`
      ];
    }
  } catch (error) {
    console.error('Error generating facts with OpenAI:', error);
    return [
      `Interesting fact about ${topic}`,
      `We're experiencing issues retrieving facts about ${topic}. Please try again.`
    ];
  }
} 