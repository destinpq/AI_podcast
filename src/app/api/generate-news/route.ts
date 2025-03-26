import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates fictional news article summaries for podcasters to discuss. Provide 5 article summaries relevant to the topic. RESPOND ONLY WITH VALID JSON in this format: { \"articles\": [ { \"title\": \"Article Title\", \"content\": \"Brief summary of article content\" } ] }. Do not include any other text outside of the JSON."
        },
        {
          role: "user",
          content: `Generate 5 fictional news article summaries about: ${topic}. Make the titles engaging and the summaries informative but brief. RESPOND WITH VALID JSON ONLY.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    console.log('OpenAI response:', completion.choices[0].message.content);
    
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
          return parsedResponse.articles || [];
        } catch (parseError) {
          console.error('Failed to parse extracted JSON:', parseError);
          // Return a fallback response
          return [
            { title: `Latest news about ${topic}`, content: "We're experiencing issues retrieving news. Please try again." }
          ];
        }
      }
      
      // If no JSON could be extracted, return fallback
      return [
        { title: `Latest news about ${topic}`, content: "We're experiencing issues retrieving news. Please try again." }
      ];
    }
    
    try {
      const parsedResponse = JSON.parse(content);
      return parsedResponse.articles || [];
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Content:', content);
      return [
        { title: `Latest news about ${topic}`, content: "We're experiencing issues retrieving news. Please try again." }
      ];
    }
  } catch (error) {
    console.error('Error generating news with OpenAI:', error);
    return [
      { title: `News about ${topic}`, content: "We're experiencing issues retrieving news. Please try again." }
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