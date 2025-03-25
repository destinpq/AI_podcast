import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ScriptRating {
  overall: number;  // 1-5 scale
  categories: {
    content: number;
    structure: number;
    engagement: number;
    clarity: number;
    pacing: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
  };
}

export async function POST(request: Request) {
  try {
    const { script, duration } = await request.json();

    if (!script) {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      );
    }

    const prompt = `Rate this ${duration}-minute podcast script based on the following criteria:

1. Content Quality (1-5):
   - Depth of information
   - Accuracy and relevance
   - Value to listeners

2. Structure (1-5):
   - Logical flow
   - Clear transitions
   - Time management

3. Engagement (1-5):
   - Hook and introduction
   - Storytelling elements
   - Call to action

4. Clarity (1-5):
   - Language accessibility
   - Explanation quality
   - Technical term handling

5. Pacing (1-5):
   - Time allocation
   - Energy flow
   - Audience retention

Analyze the script and provide:
1. Numerical ratings for each category (1-5 scale)
2. An overall rating (1-5 scale)
3. 2-3 key strengths
4. 2-3 suggested improvements

Format your response as a JSON object with this structure:
{
  "overall": 4.2,
  "categories": {
    "content": 4,
    "structure": 4,
    "engagement": 5,
    "clarity": 4,
    "pacing": 4
  },
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  }
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert podcast script evaluator. Provide detailed, constructive feedback to help improve script quality."
        },
        {
          role: "user",
          content: `Script to evaluate:\n\n${script}\n\n${prompt}`
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const ratingResponse = completion.choices[0].message.content;
    if (!ratingResponse) {
      throw new Error('Failed to generate rating');
    }

    const rating: ScriptRating = JSON.parse(ratingResponse);
    return NextResponse.json(rating);
  } catch (error) {
    console.error('Script Rating Error:', error);
    return NextResponse.json(
      { error: 'Failed to rate script' },
      { status: 500 }
    );
  }
} 