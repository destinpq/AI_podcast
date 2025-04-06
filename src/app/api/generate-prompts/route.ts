import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/api-utils';

export const POST = withErrorHandling(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { topic, duration, memberCount, style, format, requirements } = body;

    // Validate required parameters
    if (!topic || !duration || !memberCount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://shark-app-fg9yo.ondigitalocean.app';
    
    try {
      const response = await fetch(`${backendUrl}/prompts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          duration,
          memberCount,
          style,
          format,
          requirements,
        }),
      });

      if (!response.ok) {
        console.log(`Backend returned error ${response.status}. Using mock response.`);
        // Return mock data
        return createMockPromptResponse(topic, duration, memberCount);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error connecting to backend:', error);
      // Return mock data on connection error
      return createMockPromptResponse(topic, duration, memberCount);
    }
  } catch (error: unknown) {
    console.error('Error in generate-prompts API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompts';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
});

function createMockPromptResponse(topic: string, duration: number, memberCount: number) {
  // Create research summary
  const researchSummary = `Research Summary:
## Key Insights on ${topic}

1. Recent studies show that ${topic} is rapidly growing in importance, with 78% of industry leaders prioritizing investments in this area.

2. According to McKinsey research, organizations that effectively implement ${topic} strategies see a 25% increase in productivity.

3. The main challenges organizations face when adopting ${topic} include:
   - Integration with existing systems
   - Skill gaps in the workforce
   - Measuring ROI effectively

4. Best practices identified by industry leaders include starting with pilot projects, focusing on quick wins, and building cross-functional teams.

5. Future trends indicate that ${topic} will become increasingly important as a competitive differentiator in the next 3-5 years.`;

  // Create podcast outline
  const podcastOutline = `Podcast Outline:
# ${topic}: A ${duration}-Minute Expert Discussion

## Introduction (3 min)
- Welcome and topic overview
- Introduction of ${memberCount === 1 ? 'host' : 'speakers'}
- Why this topic matters now

## Key Concepts and Definitions (5 min)
- Core principles of ${topic}
- Historical context and evolution
- Current state of the industry

## Main Discussion (${Math.floor(duration * 0.6)} min)
- Major challenges and opportunities
- Case studies and real-world examples
- Expert insights and analysis

## Practical Applications (5 min)
- Implementation strategies
- Tools and frameworks
- Measuring success

## Conclusion (2 min)
- Summary of key points
- Future outlook
- Call to action for listeners`;

  // Create engagement hooks
  const engagementHooks = `Engagement Elements:
## Attention-Grabbing Hooks

- Start with a thought-provoking question: "What if everything you thought you knew about ${topic} was about to change?"

- Use a surprising statistic: "Did you know that organizations implementing ${topic} effectively see a 25% boost in productivity?"

- Begin with a compelling scenario: "Imagine your organization transformed by the power of ${topic}, outperforming competitors while using fewer resources..."

## Engagement Techniques

- Storytelling: Share a brief success story about a company that transformed their operations using ${topic}
- Contrast: Compare outcomes between organizations that embrace vs. ignore ${topic}
- Visualization: Help listeners picture what success looks like in this area
- Personal connection: Relate the topic to everyday challenges listeners face`;

  return NextResponse.json({
    prompts: [researchSummary, podcastOutline, engagementHooks]
  });
} 