import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
});

interface RatingCriteria {
  name: string;
  weight: number;
  description: string;
}

const ratingCriteria: RatingCriteria[] = [
  {
    name: 'Engagement',
    weight: 0.25,
    description: 'How well does the content capture and maintain listener interest?'
  },
  {
    name: 'Personal Connection',
    weight: 0.20,
    description: 'How effectively does the content connect with listeners through personal experiences?'
  },
  {
    name: 'Expertise',
    weight: 0.20,
    description: 'How well does the content demonstrate subject matter expertise and unique insights?'
  },
  {
    name: 'Structure',
    weight: 0.15,
    description: 'How well is the content organized and how smooth are the transitions?'
  },
  {
    name: 'Authenticity',
    weight: 0.20,
    description: 'How authentic and genuine does the content feel?'
  }
];

async function analyzeScript(script: string, openai: OpenAI): Promise<{
  ratings: { [key: string]: number };
  feedback: string[];
  overallScore: number;
}> {
  const prompt = `Analyze this podcast script and provide detailed ratings and feedback based on the following criteria:

${ratingCriteria.map(criteria => `
${criteria.name} (${criteria.weight * 100}%):
${criteria.description}
`).join('\n')}

Script to analyze:
${script}

Provide your analysis in the following JSON format:
{
  "ratings": {
    "Engagement": number between 1-5,
    "Personal Connection": number between 1-5,
    "Expertise": number between 1-5,
    "Structure": number between 1-5,
    "Authenticity": number between 1-5
  },
  "feedback": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2",
    "specific improvement suggestion 3"
  ],
  "overallScore": number between 1-5
}

Be critical and specific in your analysis. Consider:
- How well does the content engage listeners?
- Are personal experiences effectively integrated?
- Does the expertise shine through?
- Is the structure clear and logical?
- Does the content feel authentic and genuine?
- What specific improvements could be made?`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert podcast script analyst who provides detailed, critical feedback and accurate ratings."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1000,
  });

  const analysis = JSON.parse(completion.choices[0].message.content || '{}');
  
  // Calculate weighted average
  const weightedScore = Object.entries(analysis.ratings || {}).reduce((acc, [key, value]) => {
    const criteria = ratingCriteria.find(c => c.name === key);
    return acc + (value as number * (criteria?.weight || 0));
  }, 0);

  return {
    ratings: analysis.ratings || {},
    feedback: analysis.feedback || [],
    overallScore: Number(weightedScore.toFixed(1))
  };
}

export async function POST(request: Request) {
  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeScript(script, openai);

    return NextResponse.json({
      rating: analysis.overallScore,
      detailedRatings: analysis.ratings,
      feedback: analysis.feedback,
      criteria: ratingCriteria
    });
  } catch (error) {
    console.error('Error rating script:', error);
    return NextResponse.json(
      { error: 'Failed to rate script' },
      { status: 500 }
    );
  }
} 