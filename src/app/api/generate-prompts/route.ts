import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { topic, duration, memberCount, style, format, requirements } = await request.json();

    // Validate input
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!duration) {
      return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Configure style-specific instructions
    const styleInstructions = {
      'expert': {
        tone: 'authoritative and data-driven',
        content: 'expert analysis, credible sources, and professional insights',
        delivery: 'clear, confident, and precise delivery'
      },
      'storyteller': {
        tone: 'engaging and narrative-focused',
        content: 'personal anecdotes, examples, and emotionally resonant stories',
        delivery: 'dynamic pacing with natural storytelling flow'
      },
      'educator': {
        tone: 'clear and explanatory',
        content: 'structured explanations, analogies, and educational insights',
        delivery: 'methodical progression from simpler to complex concepts'
      }
    };

    const selectedStyle = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.expert;

    // Research prompt
    const researchPrompt = `Research the topic "${topic}" thoroughly and create a concise research summary for a ${duration}-minute podcast. 
Focus on:
1. Latest trends and developments
2. Key controversies or debates 
3. Noteworthy statistics and data points
4. Expert opinions from credible sources
5. Common misconceptions to address

Format as bullet points organized by subtopic. Keep the research focused, accurate, and relevant to ${format.type === 'short_form' ? 'a short-form expert insight' : 'a standard podcast'}.`;

    // Outline prompt  
    const outlinePrompt = `Create a structured outline for a ${duration}-minute ${style} podcast on "${topic}" featuring ${memberCount} speakers.

The outline should:
1. Follow a ${selectedStyle.tone} tone
2. Focus on ${selectedStyle.content}
3. Optimize for ${selectedStyle.delivery}
4. Be structured with ${format.structure.hook.duration} seconds for hook, ${format.structure.insight.duration} seconds for main insights, and ${format.structure.takeaway.duration} seconds for takeaways
5. Be formatted as a list of key discussion points

Make each point specific, substantive, and optimal for a ${duration}-minute timeframe.`;

    // Engagement hooks prompt
    const hooksPrompt = `Create engaging elements for a ${duration}-minute ${style} podcast on "${topic}".

Generate:
1. 3 thought-provoking questions to pose to listeners
2. 2 surprising statistics or facts that challenge assumptions
3. 2 powerful analogies or metaphors to illustrate key concepts
4. 1 compelling personal story prompt for the host to consider
5. 2 actionable takeaways for listeners to implement

Make these elements concise, memorable, and aligned with a ${selectedStyle.tone} delivery style.`;

    // Generate research summary
    const researchResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a professional podcast researcher creating concise, fact-based summaries." },
        { role: "user", content: researchPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    // Generate outline
    const outlineResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a professional podcast producer creating structured, engaging outlines." },
        { role: "user", content: outlinePrompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    // Generate engagement hooks
    const hooksResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a podcast engagement expert creating hooks and interactive elements." },
        { role: "user", content: hooksPrompt }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    const prompts = [
      researchResponse.choices[0].message.content || 'Research data unavailable',
      outlineResponse.choices[0].message.content || 'Outline unavailable',
      hooksResponse.choices[0].message.content || 'Engagement hooks unavailable'
    ];

    return NextResponse.json({ 
      prompts: prompts,
      style,
      metadata: {
        promptGeneration: {
          model: "gpt-4-turbo-preview",
          temperature: 0.7,
          style: style,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompts. Please try again.' },
      { status: 500 }
    );
  }
} 