import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface OutlineRequest {
  topic: string;
  duration: number;
  memberCount: number;
}

export async function POST(request: Request) {
  try {
    const body: OutlineRequest = await request.json();
    
    if (!body.topic) {
      return NextResponse.json({ error: 'Missing required field: topic' }, { status: 400 });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create prompt for outline generation
    const prompt = `Create a podcast outline for a ${body.duration}-minute discussion about "${body.topic}" with ${body.memberCount} speaker${body.memberCount > 1 ? 's' : ''}.

The outline should:
1. Have a clear introduction, main sections, and conclusion
2. Include engaging discussion points for each section
3. Be structured for a natural conversation flow
4. Be suitable for the specified duration

Format the response as a structured outline with sections and bullet points.`;

    // Generate outline with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert podcast outline creator. Create clear, engaging, and well-structured outlines for podcast discussions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse the completion into sections
    const content = completion.choices[0].message.content || '';
    const sections = parseOutline(content);

    return NextResponse.json({
      outline: {
        title: body.topic,
        sections
      }
    });

  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}

function parseOutline(content: string): Array<{ title: string; points: string[] }> {
  const sections: Array<{ title: string; points: string[] }> = [];
  let currentSection: { title: string; points: string[] } | null = null;

  // Split content into lines and process each line
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  for (const line of lines) {
    // Check if line is a section header (starts with # or number followed by period)
    if (line.startsWith('#') || /^\d+\./.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/^[#\d.]+\s*/, '').trim(),
        points: []
      };
    }
    // Check if line is a bullet point
    else if (line.startsWith('-') || line.startsWith('*') || /^\d+\)/.test(line)) {
      if (currentSection) {
        currentSection.points.push(line.replace(/^[-*\d)]+\s*/, '').trim());
      }
    }
  }

  // Add the last section if it exists
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections were found, create a basic structure
  if (sections.length === 0) {
    return [
      { title: 'Introduction', points: ['Opening discussion'] },
      { title: 'Main Discussion', points: ['Key points about the topic'] },
      { title: 'Conclusion', points: ['Summary and closing thoughts'] }
    ];
  }

  return sections;
} 