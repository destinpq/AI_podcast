import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Fallback script generator function to use when API calls time out
function generateFallbackScript(
  title: string,
  sections: Array<{title: string, points?: string[]}>,
  duration: number,
  memberCount: number,
  userReferences: Array<{
  id: string;
    type: string;
  content: string;
  source?: string;
  }> = []
) {
  // Collect news articles and facts for reference
  const newsArticles = userReferences
    .filter(ref => ref.type === 'article')
    .map(article => article.content)
    .slice(0, 3);
  
  const facts = userReferences
    .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
    .map(fact => fact.content)
    .slice(0, 3);
  
  // Create speaker labels based on member count
  const speakers = memberCount === 1 
    ? ['HOST']
    : Array.from({ length: memberCount }, (_, i) => i === 0 ? 'HOST' : `GUEST ${i}`);
  
  // Introduction
  let script = `# ${title}\n\n`;
  script += `## Introduction\n\n`;
  script += `${speakers[0]}: Welcome to the podcast! Today we're discussing ${title}. `;
  
  if (memberCount > 1) {
    script += `I'm joined by ${memberCount - 1} guest${memberCount > 2 ? 's' : ''} who will help us explore this fascinating topic. `;
    script += `Let's start by introducing ourselves.\n\n`;
    
    for (let i = 1; i < speakers.length; i++) {
      script += `${speakers[i]}: Thanks for having me! I'm excited to talk about ${title} today.\n\n`;
    }
  } else {
    script += `In this episode, we'll be exploring various aspects of this fascinating topic.\n\n`;
  }
  
  // Main content - go through each section
  sections.forEach((section, sectionIndex) => {
    script += `## ${section.title}\n\n`;
    
    // Determine which speaker introduces this section
    const sectionIntroSpeaker = speakers[sectionIndex % speakers.length];
    script += `${sectionIntroSpeaker}: Let's talk about ${section.title}. `;
    
    if (sectionIndex === 0 && newsArticles.length > 0) {
      script += `According to recent news, ${newsArticles[0]}. `;
    }
    
    script += `This is an important aspect of ${title} because it helps us understand the bigger picture.\n\n`;
    
    // Add points from this section
    if (section.points && section.points.length > 0) {
      section.points.forEach((point, pointIndex) => {
        const speaker = speakers[(sectionIndex + pointIndex + 1) % speakers.length];
        script += `${speaker}: ${point} `;
        
        // Add a fact if available
        if (facts.length > pointIndex && pointIndex < 2) {
          script += `In fact, ${facts[pointIndex]}. `;
        }
        
        script += `\n\n`;
      });
    } else {
      // If no points, add some generic content
      const speaker1 = speakers[sectionIndex % speakers.length];
      const speaker2 = speakers[(sectionIndex + 1) % speakers.length];
      
      script += `${speaker1}: One key thing to understand about ${section.title} is its impact on everyday life. `;
      script += `When we consider the broader implications, it becomes clear why this matters.\n\n`;
      
      if (memberCount > 1) {
        script += `${speaker2}: That's an excellent point. I'd add that ${section.title} also relates to recent developments in the field. `;
        script += `Many experts have been discussing this topic extensively.\n\n`;
      }
    }
    
    // Add transition to next section if not the last section
    if (sectionIndex < sections.length - 1) {
      const transitionSpeaker = speakers[(sectionIndex + 2) % speakers.length];
      script += `${transitionSpeaker}: That covers the key aspects of ${section.title}. Now, let's move on to discuss ${sections[sectionIndex + 1].title}.\n\n`;
    }
  });
  
  // Conclusion
  script += `## Conclusion\n\n`;
  const concludingSpeaker = speakers[0];
  script += `${concludingSpeaker}: We've covered a lot of ground in our discussion about ${title}. `;
  
  if (newsArticles.length > 0) {
    script += `We talked about ${newsArticles[0]} and its implications. `;
  }
  
  script += `To summarize our main points: ${sections.map(s => s.title).join(', ')}.\n\n`;
  
  if (memberCount > 1) {
    for (let i = 1; i < speakers.length; i++) {
      script += `${speakers[i]}: It's been a great discussion. I think the key takeaway is the importance of understanding ${title} from multiple perspectives.\n\n`;
    }
  }
  
  script += `${speakers[0]}: Thank you for listening to our podcast on ${title}. We hope you found it informative and engaging. Until next time!\n\n`;
  
  return script;
}

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

    // Check for API key - use fallback if not configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-api-key') {
      console.log('No valid API key, using fallback script generator');
      const fallbackScript = generateFallbackScript(
        outlineTitle,
        sections,
        duration,
        memberCount,
        userReferences
      );
      return NextResponse.json({ script: fallbackScript });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 25000, // reduced timeout to prevent Vercel function timeout
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

    // Generate the script with OpenAI with timeout handling
    try {
      // Set up timeout to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      // Use a smaller model with smaller max tokens for faster generation
  const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use standard model, not 16k version
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
        // Use smaller max tokens to ensure faster response
        max_tokens: Math.min(2000, calculateMaxTokens(Math.min(300, targetWordCount.max))),
      }).finally(() => clearTimeout(timeoutId));

      const script = completion.choices[0].message.content || '';
      return NextResponse.json({ script });
    } catch (openaiError: unknown) {
      console.error('OpenAI API error:', openaiError);
      
      // Check for abort error (timeout)
      if (openaiError instanceof Error && openaiError.name === 'AbortError') {
        console.log('API request timed out, using fallback script generator');
      }
      
      // Use fallback script generator for any OpenAI errors
      const fallbackScript = generateFallbackScript(
        outlineTitle,
        sections,
      duration, 
        memberCount,
        userReferences
      );
      return NextResponse.json({ 
        script: fallbackScript,
        notice: 'Using generated script due to API limitations'
      });
    }
  } catch (error) {
    console.error('Script generation error:', error);
    
    // Extract title and sections from the error for fallback
    let title = 'Podcast Script';
    let sections: Array<{title: string, points?: string[]}> = [];
    let duration = 15;
    let memberCount = 1;
    
    try {
      // Try to extract information from the failed request for fallback
      if (error instanceof Error && error.cause && typeof error.cause === 'object') {
        const body = error.cause as Record<string, unknown>;
        if (body.outline && typeof body.outline === 'object') {
          const outline = body.outline as Record<string, unknown>;
          if (outline.title && typeof outline.title === 'string') {
            title = outline.title;
          }
          if (outline.sections && Array.isArray(outline.sections)) {
            sections = outline.sections as Array<{title: string, points?: string[]}>;
          }
        }
        if (body.duration && typeof body.duration === 'number') {
          duration = body.duration;
        }
        if (body.memberCount && typeof body.memberCount === 'number') {
          memberCount = body.memberCount;
        }
      }
    } catch (extractError) {
      console.error('Error extracting fallback data:', extractError);
    }
    
    const fallbackScript = generateFallbackScript(title, sections, duration, memberCount);

    return NextResponse.json({
      script: fallbackScript,
      notice: 'Using generated script due to server error'
    }, { status: 200 }); // Return 200 to avoid cascading errors
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
  // Format sections and selected points - limit size of input to reduce token usage
  const formattedSections = sections.map((section, index) => {
    const sectionPoints = selectedPoints
      .filter(point => point.sectionIndex === index)
      .slice(0, 3) // Limit to 3 points per section to reduce token count
      .map(point => {
        let pointText = `- ${point.text}`;
        if (point.elaboration) {
          pointText += ` (${point.elaboration.substring(0, 100)})`;
        }
        if (point.promptType) {
          pointText += ` [As ${point.promptType.replace('_', ' ')}]`;
        }
        return pointText;
      })
      .join('\n');

    return `## ${section.title}\n${sectionPoints || '- Key points for this section'}`;
  }).join('\n\n');

  // Format references (news articles and facts) - limit to 3 of each
  const newsArticles = userReferences
    .filter(ref => ref.type === 'article')
    .slice(0, 3)
    .map(article => `- ${article.content}${article.source ? ` (${article.source})` : ''}`)
    .join('\n');

  const facts = userReferences
    .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
    .slice(0, 3)
    .map(fact => `- ${fact.content}${fact.source ? ` (${fact.source})` : ''}`)
    .join('\n');

  // Format personal experiences - limit to 2
  const experiences = personalExperiences.length > 0
    ? personalExperiences.slice(0, 2).map(exp => `- ${exp}`).join('\n')
    : 'No personal experiences provided';

  // Create a more concise prompt
  return `
# Podcast Script: ${title}

## Format Instructions
- ${duration}-minute podcast for ${memberCount} speaker${memberCount > 1 ? 's' : ''}
- Target length: ${targetWordCount.min}-${targetWordCount.max} words
- Use speaker labels: ${memberCount === 1 ? 'HOST' : 'HOST, GUEST 1, GUEST 2, etc.'}
- Include intro, sections, and conclusion

## Content
${formattedSections}

## References
${newsArticles || 'No news articles'}

${facts || 'No facts'}

${experiences}

## Guidelines
- Conversational tone
- Include facts where relevant
- Simple intro and conclusion
`;
}

// Helper function to calculate max tokens based on target word count
function calculateMaxTokens(maxWords: number) {
  // Estimate 1.5 tokens per word for English text
  const estimatedTokens = maxWords * 1.5;
  // Add 20% buffer, but cap at reasonable limit
  return Math.min(Math.ceil(estimatedTokens * 1.2), 4000);
} 