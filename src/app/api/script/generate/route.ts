import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    console.log('Received script generation request');
    const body = await request.json();
    
    // Log the request body to debug
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.outline) {
      console.error('Missing required field: outline');
      return NextResponse.json({ error: 'Missing required field: outline' }, { status: 400 });
    }
    
    // Set defaults for optional fields
    const selectedPoints = body.selectedPoints || [];
    const duration = body.duration || 15;
    const memberCount = body.memberCount || 1;
    const personalExperiences = body.personalExperiences || [];
    const userReferences = body.userReferences || [];
    const targetWordCount = body.targetWordCount || {
      min: duration * 100,
      max: duration * 150
    };
    
    // Extract sections from outline
    const outlineTitle = body.outline.title || 'Podcast Script';
    const sections = body.outline.sections || [];
    
    if (sections.length === 0) {
      console.error('No sections provided in outline');
      return NextResponse.json({ error: 'No sections provided in outline' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000, // 60 second timeout
    });

    // Prepare the completion prompt
    const prompt = createScriptPrompt(
      outlineTitle,
      sections,
      selectedPoints,
      duration,
      memberCount,
      personalExperiences,
      userReferences,
      targetWordCount
    );

    console.log('Sending prompt to OpenAI:', prompt.substring(0, 200) + '...');

    // Generate the script with OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "You are an expert podcast script writer. Create conversational, engaging, and informative podcast scripts. Format appropriately for the specified number of speakers."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: calculateMaxTokens(targetWordCount.max),
      });

      const script = completion.choices[0].message.content || '';
      return NextResponse.json({ script });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json({ 
        error: 'Failed to generate script with AI',
        details: openaiError instanceof Error ? openaiError.message : String(openaiError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 400 });
  }
}

// Helper function to create the script prompt
function createScriptPrompt(
  title: string,
  sections: Array<{title: string, points?: string[]}>,
  selectedPoints: Array<{
    sectionIndex: number;
    pointIndex: number;
    text: string;
    elaboration?: string;
    promptType?: string;
  }>,
  duration: number,
  memberCount: number,
  personalExperiences: string[],
  userReferences: Array<{
    id: string;
    type: string;
    content: string;
    source?: string;
  }>,
  targetWordCount: { min: number, max: number }
) {
  // Format sections and selected points
  const formattedSections = sections.map((section, index) => {
    const sectionPoints = selectedPoints
      .filter(point => point.sectionIndex === index)
      .map(point => {
        let pointText = `- ${point.text}`;
        if (point.elaboration) {
          pointText += ` (Additional context: ${point.elaboration})`;
        }
        if (point.promptType) {
          pointText += ` [Present this as a ${point.promptType.replace('_', ' ')}]`;
        }
        return pointText;
      })
      .join('\n');

    return `## ${section.title}\n${sectionPoints || '- No specific points selected for this section'}`;
  }).join('\n\n');

  // Format references (news articles and facts)
  const newsArticles = userReferences
    .filter(ref => ref.type === 'article')
    .map(article => `- ${article.content}${article.source ? ` (Source: ${article.source})` : ''}`)
    .join('\n');

  const facts = userReferences
    .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
    .map(fact => `- ${fact.content}${fact.source ? ` (Source: ${fact.source})` : ''}`)
    .join('\n');

  // Format personal experiences
  const experiences = personalExperiences.length > 0
    ? personalExperiences.map(exp => `- ${exp}`).join('\n')
    : 'No personal experiences provided';

  // Create the final prompt
  return `
# Podcast Script: ${title}

## Format Instructions
- Create a ${duration}-minute podcast script for ${memberCount} speaker${memberCount > 1 ? 's' : ''}.
- Target word count: ${targetWordCount.min}-${targetWordCount.max} words.
- Format the script with speaker labels like "HOST:", "GUEST:", or "SPEAKER 1:", "SPEAKER 2:", etc.
- For a multi-person podcast, create natural dialogue and interaction between speakers.
- Include transitions between topics and sections.

## Content Instructions
${formattedSections}

## Reference Materials
### News Articles
${newsArticles || 'No specific news articles provided'}

### Facts and Statistics
${facts || 'No specific facts provided'}

### Personal Experiences to Include
${experiences}

## Writing Guidelines
- Start with a brief introduction to the topic and speakers.
- End with a clear conclusion and possibly a call to action.
- Maintain a conversational, engaging tone throughout.
- Create natural transitions between sections.
- Include specific facts, news references, and personal anecdotes where relevant.
- Balance educational content with engaging dialogue.
- Avoid overly technical language unless necessary for the topic.
`;
}

// Helper function to calculate max tokens based on target word count
function calculateMaxTokens(maxWords: number) {
  // Estimate 1.5 tokens per word for English text
  const estimatedTokens = maxWords * 1.5;
  // Add 20% buffer
  return Math.min(Math.ceil(estimatedTokens * 1.2), 16000);
} 