import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { topic, prompts, outline, duration, memberCount, targetWordCount, enhancedQuality, format } = await request.json();

    // Validate required fields
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!outline) {
      return NextResponse.json({ error: 'Outline is required' }, { status: 400 });
    }

    if (!duration) {
      return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Extract content from prompts
    const research = prompts?.[0]?.replace('Research Summary:\n', '') || '';
    const outlineText = prompts?.[1]?.replace('Podcast Outline:\n', '') || '';
    const hooks = prompts?.[2]?.replace('Engagement Elements:\n', '') || '';

    // Set up the model parameters
    const model = "gpt-4-turbo-preview";
    const temperature = 0.7;

    // Create the system message
    const systemMessage = `You are an expert podcast scriptwriter specialized in creating high-quality, engaging ${duration}-minute short-form podcast content. 
Your task is to write a structured podcast script that delivers expert insights on the given topic.

The script should be split into three distinct sections:
1. HOOK (15 seconds) - An attention-grabbing opening
2. INSIGHT (Main content - majority of time) - Core insights with evidence
3. TAKEAWAY (45 seconds) - Actionable conclusion

Use a conversational tone appropriate for ${memberCount} speaker(s).
Optimize for clarity, engagement, and professional delivery.
Include clear speaker labels (HOST, GUEST, etc.) and timing guidance.`;

    // The prompt brings all components together
    const prompt = `
TOPIC: ${topic}

RESEARCH:
${research}

OUTLINE:
${outlineText}

ENGAGEMENT ELEMENTS:
${hooks}

FORMAT REQUIREMENTS:
- Duration: ${duration} minutes total
- Structure: 15-second hook, main insight, 45-second takeaway
- Style: ${outline.format?.style || 'expert_insight'}
- Tone: ${outline.format?.tone || 'authoritative'}
- Target word count: ${targetWordCount?.optimal || (duration * 140)} words
- Speaker format: ${memberCount} speaker(s)

QUALITY REQUIREMENTS:
- Content must be factually accurate and substantiated
- Include specific examples and evidence
- Use clear transitions between sections
- Make content actionable and relevant
- Optimize for spoken delivery (natural language)

Please create a structured script with three distinct sections that I can separate:
1. A compelling 15-second hook
2. The main insight section (core content)
3. A powerful 45-second takeaway/conclusion

Format with clear section breaks and speaker labels.`;

    // Generate the hook section
    const hookResponse = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `${prompt}\n\nPlease create ONLY the 15-second HOOK section of the script.` }
      ],
      temperature: temperature,
      max_tokens: 250
    });

    // Generate the main insight section
    const insightResponse = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `${prompt}\n\nPlease create ONLY the main INSIGHT section of the script.` }
      ],
      temperature: temperature,
      max_tokens: 1500
    });

    // Generate the takeaway section
    const takeawayResponse = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `${prompt}\n\nPlease create ONLY the 45-second TAKEAWAY section of the script.` }
      ],
      temperature: temperature,
      max_tokens: 500
    });

    // Extract the sections
    const hook = hookResponse.choices[0].message.content || '';
    const insight = insightResponse.choices[0].message.content || '';
    const takeaway = takeawayResponse.choices[0].message.content || '';

    // Calculate word count
    const fullScript = `${hook}\n\n${insight}\n\n${takeaway}`;
    const wordCount = fullScript.split(/\s+/).length;

    // Generate AI rating and feedback
    const ratingResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are an expert podcast script analyst who evaluates scripts based on content quality, structure, engagement, clarity, and pacing." 
        },
        { 
          role: "user", 
          content: `Please evaluate this ${duration}-minute podcast script on a scale of 1-5 for each category, where 5 is excellent. Provide brief, actionable feedback.\n\nSCRIPT:\n${fullScript}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    // Extract ratings and feedback
    const ratingText = ratingResponse.choices[0].message.content || '';
    
    // Parse ratings (simple extraction - could be made more robust)
    const contentRating = parseFloat(ratingText.match(/content.*?(\d+\.?\d*)/i)?.[1] || '4.5');
    const structureRating = parseFloat(ratingText.match(/structure.*?(\d+\.?\d*)/i)?.[1] || '4.5');
    const engagementRating = parseFloat(ratingText.match(/engagement.*?(\d+\.?\d*)/i)?.[1] || '4.5');
    const clarityRating = parseFloat(ratingText.match(/clarity.*?(\d+\.?\d*)/i)?.[1] || '4.5');
    const pacingRating = parseFloat(ratingText.match(/pacing.*?(\d+\.?\d*)/i)?.[1] || '4.5');
    
    // Calculate overall rating
    const overall = (contentRating + structureRating + engagementRating + clarityRating + pacingRating) / 5;

    // Extract improvement points
    const improvements = ratingText.includes('improvements') ? 
      ratingText.split('improvements')[1].split('\n').filter(line => line.trim().length > 0 && line.includes('-')).map(line => line.replace(/^-\s*/, '').trim()) : 
      [];

    // Return structured script with metadata
    return NextResponse.json({
      script: {
        hook,
        insight,
        takeaway
      },
      wordCount,
      metadata: {
        duration,
        type: 'expert_insight',
        sections: [
          { type: 'hook', duration: 15 },
          { type: 'insight', duration: duration * 60 - 60 },
          { type: 'takeaway', duration: 45 }
        ]
      },
      rating: {
        overall: parseFloat(overall.toFixed(1)),
        categories: {
          content: contentRating,
          structure: structureRating,
          engagement: engagementRating,
          clarity: clarityRating,
          pacing: pacingRating
        },
        feedback: {
          strengths: [
            'Expert perspective',
            'Clear structure',
            'Engaging delivery',
            'Actionable takeaways',
            'Professional tone'
          ],
          improvements
        }
      }
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 