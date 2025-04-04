import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to handle API timeouts
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms / 1000} seconds`));
    }, ms);
  });
};

export const runtime = 'edge'; // Use edge runtime for better performance

export async function POST(req: Request) {
  try {
    const { topic, duration, memberCount } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // First, get background research and trending topics
    const researchPrompt = `Research the topic "${topic}" and provide:
1. Latest trends and developments
2. Key controversies or debates
3. Recent statistics or studies
4. Expert opinions
5. Common misconceptions
6. Real-world examples or case studies

Format as a concise research brief with citations where possible.`;

    try {
      // Use Promise.race to implement a timeout
      const researchCompletion = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert researcher and podcast content strategist. Provide well-researched, factual information with a focus on recent developments and engaging angles."
            },
            {
              role: "user",
              content: researchPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
        timeoutPromise(45000) // 45 second timeout
      ]) as OpenAI.Chat.Completions.ChatCompletion;

      const research = researchCompletion.choices[0].message.content;

      // Then, use the research to create a detailed podcast outline
      const outlinePrompt = `Using this research:

${research}

Create an engaging podcast outline for a ${duration}-minute discussion about "${topic}" with ${memberCount} speakers. The outline should be natural and conversational, including:

1. Opening Hook (2-3 min):
   - An attention-grabbing fact, story, or question
   - Brief speaker introductions that establish credibility
   - Why this topic matters right now

2. Main Discussion (${duration - 8} min):
   - Key narratives and storylines
   - Personal experiences and expert insights
   - Engaging debates and different perspectives
   - Real-world examples and case studies
   - Natural transitions between subtopics

3. Interactive Elements:
   - Questions for discussion between hosts
   - Hypothetical scenarios
   - Audience engagement points
   - Moments for personal stories
   - Points of humor or lighter discussion

4. Closing Segment (3-5 min):
   - Key takeaways
   - Call to action
   - Future implications
   - Personal reflections

For each section:
- Include specific talking points and questions
- Add timing suggestions
- Note potential guest expertise moments
- Suggest natural transition phrases
- Include points for audience engagement

Make it feel like a natural conversation between ${memberCount} knowledgeable friends, not a scripted lecture.`;

      const outlineCompletion = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert podcast producer who specializes in creating natural, engaging conversation flows. Focus on making the discussion feel authentic and dynamic, while maintaining structure and value."
            },
            {
              role: "user",
              content: outlinePrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        }),
        timeoutPromise(45000) // 45 second timeout
      ]) as OpenAI.Chat.Completions.ChatCompletion;

      const outline = outlineCompletion.choices[0].message.content;

      // Finally, generate engagement hooks and dynamic elements
      const hooksPrompt = `For this podcast outline:

${outline}

Generate:
1. 3-5 compelling "hook" questions to spark discussion
2. 2-3 controversial or debatable points to explore
3. 2-3 personal story prompts for hosts
4. 2-3 audience engagement questions
5. 2-3 relevant current events to reference
6. 2-3 expert insights or statistics to share
7. 2-3 common misconceptions to address
8. 2-3 practical takeaways or action items`;

      const hooksCompletion = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert in audience engagement and podcast dynamics. Focus on elements that will make the discussion more interactive and memorable."
            },
            {
              role: "user",
              content: hooksPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        }),
        timeoutPromise(45000) // 45 second timeout
      ]) as OpenAI.Chat.Completions.ChatCompletion;

      const hooks = hooksCompletion.choices[0].message.content;

      return NextResponse.json({ 
        outline,
        research,
        hooks,
        suggestedStructure: {
          duration,
          memberCount,
          topic,
          sections: [
            { type: 'opening', duration: 3 },
            { type: 'main', duration: duration - 8 },
            { type: 'closing', duration: 5 }
          ]
        }
      });
    } catch (timeoutError) {
      console.error('API timeout:', timeoutError);
      return NextResponse.json(
        { error: 'The request took too long to process. Please try again with a simpler topic or shorter duration.' },
        { status: 504 }
      );
    }

  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 