import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Outline {
  title: string;
  sections: Array<{
    title: string;
    points: string[];
  }>;
}

interface SelectedPoint {
  sectionIndex: number;
  pointIndex: number;
  text: string;
  elaboration?: string;
  promptType?: 'life_experience' | 'joke' | 'analogy' | 'example' | 'statistic' | 'quote';
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants for timing calculations
const WORDS_PER_MINUTE = 150;
const TRANSITION_TIME = 0.5; // minutes
const PAUSE_TIME = 0.2; // minutes per pause
const PAUSES_PER_MINUTE = 2;

function calculateWordCount(duration: number): number {
  const speakingTime = duration - (TRANSITION_TIME * 2); // Account for intro/outro transitions
  const totalPauses = Math.floor(speakingTime * PAUSES_PER_MINUTE);
  const pauseTime = totalPauses * PAUSE_TIME;
  const actualSpeakingTime = speakingTime - pauseTime;
  return Math.floor(actualSpeakingTime * WORDS_PER_MINUTE);
}

async function generateScriptPart(
  section: Outline['sections'][0],
  selectedPoints: SelectedPoint[],
  duration: number,
  memberCount: number,
  sectionIndex: number,
  totalSections: number
): Promise<string> {
  const sectionDuration = duration / totalSections;
  const targetWordCount = Math.floor(calculateWordCount(sectionDuration) / totalSections);
  
  // Create speaker roles based on member count
  const speakers = Array.from({ length: memberCount }, (_, i) => `Speaker ${i + 1}`);
  const speakerRoles = speakers.map((speaker, i) => 
    `${speaker}: ${i === 0 ? 'Host/Main Speaker' : i === 1 ? 'Co-host' : 'Guest Expert'}`
  ).join('\n');

  const prompt = `Create a detailed podcast script section for the following topic and points. 
Target approximately ${targetWordCount} words for this section.

Topic: ${section.title}

Selected Points to Elaborate:
${selectedPoints.map(point => `- ${point.text}${point.elaboration ? `\n  Elaboration: ${point.elaboration}` : ''}`).join('\n')}

Speaker Roles:
${speakerRoles}

Guidelines:
1. Write in a conversational, engaging style
2. Include natural dialogue between speakers
3. Add smooth transitions between points
4. Include brief pauses and reactions
5. Maintain a good balance between speakers
6. Add engaging questions and responses
7. Include brief speaker tags (e.g., "Host:", "Co-host:", "Guest:")
8. Keep the pacing natural and engaging
9. Add brief sound effects or transitions in [brackets]
10. Include brief speaker reactions and interjections

Format the script with clear speaker labels and natural dialogue flow.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert podcast script writer. Create engaging, natural-sounding dialogue that flows well between speakers."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  return completion.choices[0].message.content || '';
}

export async function POST(request: Request) {
  try {
    const { outline, selectedPoints, duration, memberCount } = await request.json();

    if (!outline || !outline.sections || !Array.isArray(outline.sections)) {
      return NextResponse.json(
        { error: 'Invalid outline format' },
        { status: 400 }
      );
    }

    // Generate each section in parallel
    const scriptPartPromises = outline.sections.map((section: Outline['sections'][0], index: number) => 
      generateScriptPart(
        section,
        selectedPoints.filter((p: SelectedPoint) => p.sectionIndex === index),
        duration,
        memberCount,
        index,
        outline.sections.length
      )
    );

    const scriptParts = await Promise.all(scriptPartPromises);
    const fullScript = scriptParts.join('\n\n[Transition Music]\n\n');

    return NextResponse.json({ 
      script: fullScript,
      metadata: {
        totalWordCount: fullScript.split(/\s+/).length,
        estimatedSpeakingDuration: Math.round(fullScript.split(/\s+/).length / WORDS_PER_MINUTE),
        targetDuration: duration,
        sections: outline.sections.length
      }
    });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 