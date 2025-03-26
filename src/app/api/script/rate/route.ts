import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-api-key',
  timeout: 60000,
});

interface RatingCriteria {
  name: string;
  weight: number;
  description: string;
}

// Default values to use when the API call fails
const DEFAULT_RATINGS = {
  Engagement: 3.5,
  "Personal Connection": 3.2,
  Expertise: 3.7,
  Structure: 3.4,
  Authenticity: 3.6
};

const DEFAULT_FEEDBACK = {
  strengths: [
    "Good overall structure and flow",
    "Clear explanations of complex topics",
    "Effective use of transitions between segments"
  ],
  improvements: [
    "Consider adding more personal anecdotes",
    "Shorten introductions to key topics",
    "Include more specific examples to illustrate main points"
  ]
};

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
  feedback: {
    strengths: string[];
    improvements: string[];
  };
  overallScore: number;
}> {
  try {
    // Check if script is too short for meaningful analysis
    if (!script || script.length < 50) {
      console.log('Script too short for analysis. Using default ratings.');
      return {
        ratings: DEFAULT_RATINGS,
        feedback: DEFAULT_FEEDBACK,
        overallScore: 3.5
      };
    }

    // Check if OpenAI is configured with a real API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-api-key') {
      console.log('Using demo mode. Returning default ratings.');
      return {
        ratings: DEFAULT_RATINGS,
        feedback: DEFAULT_FEEDBACK,
        overallScore: 3.5
      };
    }

    const prompt = `Analyze this podcast script and provide detailed ratings and feedback based on the following criteria:

${ratingCriteria.map(criteria => `
${criteria.name} (${criteria.weight * 100}%):
${criteria.description}
`).join('\n')}

Script to analyze:
${script.substring(0, 4000)}

Provide your analysis in the following JSON format:
{
  "ratings": {
    "Engagement": number between 1-5,
    "Personal Connection": number between 1-5,
    "Expertise": number between 1-5,
    "Structure": number between 1-5,
    "Authenticity": number between 1-5
  },
  "feedback": {
    "strengths": [
      "specific strength 1",
      "specific strength 2",
      "specific strength 3"
    ],
    "improvements": [
      "specific improvement suggestion 1",
      "specific improvement suggestion 2",
      "specific improvement suggestion 3"
    ]
  },
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
      model: "gpt-3.5-turbo",
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

    const analysisText = completion.choices[0].message.content || '{}';
    let analysis;

    try {
      analysis = JSON.parse(analysisText);
      
      // Validate the structure of the analysis
      if (!analysis.ratings || !analysis.feedback || !analysis.feedback.strengths || !analysis.feedback.improvements) {
        throw new Error('Invalid response structure');
      }
      
      // Calculate weighted average
      let weightedScore = 0;
      let totalWeight = 0;
      
      Object.entries(analysis.ratings).forEach(([key, value]) => {
        const criteria = ratingCriteria.find(c => c.name === key);
        if (criteria) {
          weightedScore += (Number(value) * criteria.weight);
          totalWeight += criteria.weight;
        }
      });
      
      // If totalWeight is 0, use default calculations
      if (totalWeight === 0) {
        weightedScore = 3.5;
      } else {
        // Normalize if weights don't add up to 1
        weightedScore = weightedScore / totalWeight;
      }
      
      return {
        ratings: analysis.ratings,
        feedback: {
          strengths: analysis.feedback.strengths || DEFAULT_FEEDBACK.strengths,
          improvements: analysis.feedback.improvements || DEFAULT_FEEDBACK.improvements
        },
        overallScore: Number(weightedScore.toFixed(1))
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      console.log('Response received:', analysisText);
      
      // Return default ratings on error
      return {
        ratings: DEFAULT_RATINGS,
        feedback: DEFAULT_FEEDBACK,
        overallScore: 3.5
      };
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    // Return default ratings on error
    return {
      ratings: DEFAULT_RATINGS,
      feedback: DEFAULT_FEEDBACK,
      overallScore: 3.5
    };
  }
}

export async function POST(request: Request) {
  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json({
        rating: 3.5,
        detailedRatings: DEFAULT_RATINGS,
        feedback: DEFAULT_FEEDBACK,
        criteria: ratingCriteria
      });
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
    
    return NextResponse.json({
      rating: 3.5,
      detailedRatings: DEFAULT_RATINGS,
      feedback: DEFAULT_FEEDBACK,
      criteria: ratingCriteria
    });
  }
} 