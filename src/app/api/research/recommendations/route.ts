import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Trend {
  title: string;
  traffic: string;
  articles: string[];
}

export async function POST(request: Request) {
  try {
    const { topic, trends } = await request.json();

    if (!topic || !trends) {
      return NextResponse.json(
        { error: 'Topic and trends are required' },
        { status: 400 }
      );
    }

    // Create an enhanced prompt for OpenAI with detailed requirements for examples and citations
    const prompt = `Based on the following research topic and related trends, provide detailed recommendations for research and content creation:

Topic: ${topic}

Related Trends:
${trends.map((trend: Trend) => `- ${trend.title} (Traffic: ${trend.traffic})`).join('\n')}

Please provide:

1. **Key research areas to focus on**
   Include at least 3 specific research areas with 1-2 paragraph explanations of each, including relevant statistics, methodologies, and why they're important.

2. **Live examples with proper citations**
   For each key area, provide 2-3 detailed real-world examples (at least 3-4 sentences each) with proper academic citations in APA format from reputable sources (academic journals, industry reports, etc.). Include publication years and DOIs or URLs when available.

3. **Potential angles for content creation**
   Suggest at least 4 content angles with paragraph-length explanations of how to approach each one, including tone, target audience, and specific data points to include.

4. **Related topics to explore**
   Provide a list of 5-7 related topics with brief justifications and how they connect to the main subject.

5. **Comprehensive article outline**
   Create a detailed outline with main sections and subsections (at least 3 levels deep), including key points to address in each section. Each section should have a brief description.

6. **Critical questions for research**
   List 8-10 essential questions that should be addressed in the research, explaining why each question matters and how it contributes to understanding the topic.

7. **Expert perspectives to include**
   Recommend 3-5 types of expert perspectives that should be included, with explanations of their relevance and specific insights they might provide.

8. **Methodological considerations**
   Discuss research methodologies appropriate for the topic, including data collection approaches, ethical considerations, and analysis techniques.

Format the response in a clear, structured way with proper headings, subheadings, and bullet points where appropriate. Each example must include specific details rather than general statements, with proper citations that can be verified.`;

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a senior research and content strategy expert with extensive academic and industry experience. Provide detailed, actionable recommendations based on the given topic and trends. Always include specific examples with proper citations, detailed explanations, and evidence-based insights rather than general statements. Your goal is to provide comprehensive research guidance that demonstrates depth of knowledge and analytical rigor."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const recommendations = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ 
      trends,
      recommendations 
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
} 