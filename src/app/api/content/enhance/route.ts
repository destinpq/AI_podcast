import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content, enhancementType } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    switch (enhancementType) {
      case 'grammar':
        systemPrompt = 'You are a grammar and spelling expert. Fix any grammatical errors and improve spelling while maintaining the original meaning.';
        break;
      case 'clarity':
        systemPrompt = 'You are a clarity expert. Improve the readability and clarity of the text while maintaining its core message.';
        break;
      case 'tone':
        systemPrompt = 'You are a tone and style expert. Enhance the writing style and tone while keeping the content professional and engaging.';
        break;
      case 'seo':
        systemPrompt = 'You are an SEO expert. Optimize the content for search engines while maintaining readability and natural flow.';
        break;
      default:
        systemPrompt = 'You are a content enhancement expert. Improve the overall quality of the text while maintaining its original meaning.';
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please enhance the following content:\n\n${content}`
        }
      ],
      temperature: 0.7,
    });

    const enhancedContent = completion.choices[0].message.content;

    // Generate suggestions for further improvement
    const suggestionsCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a content improvement expert. Provide 3-5 specific suggestions for further enhancing the content."
        },
        {
          role: "user",
          content: `Please provide specific suggestions for improving this content:\n\n${enhancedContent}`
        }
      ],
      temperature: 0.7,
    });

    const suggestions = suggestionsCompletion.choices[0].message.content
      ?.split('\n')
      .filter(s => s.trim().length > 0)
      .map(s => s.replace(/^\d+\.\s*/, ''))
      .slice(0, 5) || [];

    return NextResponse.json({
      enhancedContent,
      suggestions
    });
  } catch (error) {
    console.error('Error enhancing content:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
} 