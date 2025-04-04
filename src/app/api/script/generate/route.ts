import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Fallback script generator function to use when API calls time out
function generateFallbackScript(
  title: string,
  sections: Array<{title: string, points?: string[]}>,
  duration: number,
  memberCount: number,
  userReferences: Array<{
  id: string;
    type: string;
  content: string;
  source?: string;
  }> = []
) {
  // Collect news articles and facts for reference
  const newsArticles = userReferences
    .filter(ref => ref.type === 'article')
    .map(article => article.content)
    .slice(0, 3);
  
  const facts = userReferences
    .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
    .map(fact => fact.content)
    .slice(0, 3);
  
  // Create speaker labels based on member count
  const speakers = memberCount === 1 
    ? ['HOST']
    : Array.from({ length: memberCount }, (_, i) => i === 0 ? 'HOST' : `GUEST ${i}`);
  
  // Introduction
  let script = `# ${title}\n\n`;
  script += `## Introduction\n\n`;
  script += `${speakers[0]}: Welcome to the podcast! Today we're discussing ${title}. `;
  
  if (memberCount > 1) {
    script += `I'm joined by ${memberCount - 1} guest${memberCount > 2 ? 's' : ''} who will help us explore this fascinating topic. `;
    script += `Let's start by introducing ourselves.\n\n`;
    
    for (let i = 1; i < speakers.length; i++) {
      script += `${speakers[i]}: Thanks for having me! I'm excited to talk about ${title} today.\n\n`;
    }
  } else {
    script += `In this episode, we'll be exploring various aspects of this fascinating topic.\n\n`;
  }
  
  // Main content - go through each section
  sections.forEach((section, sectionIndex) => {
    script += `## ${section.title}\n\n`;
    
    // Determine which speaker introduces this section
    const sectionIntroSpeaker = speakers[sectionIndex % speakers.length];
    script += `${sectionIntroSpeaker}: Let's talk about ${section.title}. `;
    
    if (sectionIndex === 0 && newsArticles.length > 0) {
      script += `According to recent news, ${newsArticles[0]}. `;
    }
    
    script += `This is an important aspect of ${title} because it helps us understand the bigger picture.\n\n`;
    
    // Add points from this section
    if (section.points && section.points.length > 0) {
      section.points.forEach((point, pointIndex) => {
        const speaker = speakers[(sectionIndex + pointIndex + 1) % speakers.length];
        script += `${speaker}: ${point} `;
        
        // Add a fact if available
        if (facts.length > pointIndex && pointIndex < 2) {
          script += `In fact, ${facts[pointIndex]}. `;
        }
        
        script += `\n\n`;
      });
    } else {
      // If no points, add some generic content
      const speaker1 = speakers[sectionIndex % speakers.length];
      const speaker2 = speakers[(sectionIndex + 1) % speakers.length];
      
      script += `${speaker1}: One key thing to understand about ${section.title} is its impact on everyday life. `;
      script += `When we consider the broader implications, it becomes clear why this matters.\n\n`;
      
      if (memberCount > 1) {
        script += `${speaker2}: That's an excellent point. I'd add that ${section.title} also relates to recent developments in the field. `;
        script += `Many experts have been discussing this topic extensively.\n\n`;
      }
    }
    
    // Add transition to next section if not the last section
    if (sectionIndex < sections.length - 1) {
      const transitionSpeaker = speakers[(sectionIndex + 2) % speakers.length];
      script += `${transitionSpeaker}: That covers the key aspects of ${section.title}. Now, let's move on to discuss ${sections[sectionIndex + 1].title}.\n\n`;
    }
  });
  
  // Conclusion
  script += `## Conclusion\n\n`;
  const concludingSpeaker = speakers[0];
  script += `${concludingSpeaker}: We've covered a lot of ground in our discussion about ${title}. `;
  
  if (newsArticles.length > 0) {
    script += `We talked about ${newsArticles[0]} and its implications. `;
  }
  
  script += `To summarize our main points: ${sections.map(s => s.title).join(', ')}.\n\n`;
  
  if (memberCount > 1) {
    for (let i = 1; i < speakers.length; i++) {
      script += `${speakers[i]}: It's been a great discussion. I think the key takeaway is the importance of understanding ${title} from multiple perspectives.\n\n`;
    }
  }
  
  script += `${speakers[0]}: Thank you for listening to our podcast on ${title}. We hope you found it informative and engaging. Until next time!\n\n`;
  
  return script;
}

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

    // Generate script based on format
    if (format === 'expert_insight' || enhancedQuality) {
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
    } else {
      // Legacy: Handle regular script generation
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: `You are an expert podcast scriptwriter creating a ${duration}-minute podcast script for ${memberCount} speakers.` 
          },
          { 
            role: "user", 
            content: `Create a podcast script about ${topic} based on this outline: ${JSON.stringify(outline)}. The script should be ${duration} minutes long for ${memberCount} speakers.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return NextResponse.json({
        script: response.choices[0].message.content
      });
    }
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

interface Section {
  title: string;
  points?: string[];
}

interface Reference {
  id: string;
  type: string;
  content: string;
  source?: string;
}

interface SelectedPoint {
  sectionIndex: number;
  pointIndex: number;
  text: string;
  elaboration?: string;
  promptType?: string;
}

async function generateSequentialScript(
  openai: OpenAI,
  title: string,
  sections: Section[],
  selectedPoints: SelectedPoint[],
  duration: number,
  memberCount: number,
  personalExperiences: string[],
  userReferences: Reference[],
  targetWordCount: { min: number; max: number }
) {
  // Generate introduction first
  const introPrompt = createIntroPrompt(title, sections, memberCount);
  const introCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert podcast script writer. Create a natural and engaging introduction that sets up the topic and speakers."
      },
      {
        role: "user",
        content: introPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  let fullScript = introCompletion.choices[0].message.content || '';
  fullScript += '\n\n';

  // Generate each section sequentially with context from previous sections
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const prevSection = i > 0 ? sections[i - 1] : null;
    const nextSection = i < sections.length - 1 ? sections[i + 1] : null;

    // Calculate references for this section
    const sectionReferences = distributeSectionReferences(userReferences, i, sections.length);
    const sectionPoints = selectedPoints.filter(p => p.sectionIndex === i);

    const sectionPrompt = createSectionPrompt(
      title,
      section,
      prevSection,
      nextSection,
      sectionPoints,
      memberCount,
      sectionReferences,
      personalExperiences,
      fullScript // Pass current script for context
    );

    const sectionCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert podcast script writer. Create a natural flowing section that connects well with the previous content and leads into the next section."
        },
        {
          role: "user",
          content: sectionPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: Math.min(1000, calculateMaxTokens(targetWordCount.max / sections.length)),
    });

    fullScript += sectionCompletion.choices[0].message.content || '';
    fullScript += '\n\n';
  }

  // Generate conclusion
  const conclusionPrompt = createConclusionPrompt(title, sections, memberCount, fullScript);
  const conclusionCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert podcast script writer. Create a natural and engaging conclusion that wraps up all the main points discussed."
      },
      {
        role: "user",
        content: conclusionPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  fullScript += conclusionCompletion.choices[0].message.content || '';

  return fullScript;
}

function createIntroPrompt(title: string, sections: Section[], memberCount: number) {
  return `Create a natural podcast introduction for a ${memberCount}-person discussion about "${title}".
The podcast will cover the following sections: ${sections.map(s => s.title).join(', ')}.
Format the script with speaker labels (HOST, ${memberCount > 1 ? 'GUEST 1, GUEST 2, etc.' : ''}).
Make it engaging and set up expectations for what will be discussed.`;
}

function createSectionPrompt(
  title: string,
  currentSection: Section,
  prevSection: Section | null,
  nextSection: Section | null,
  sectionPoints: SelectedPoint[],
  memberCount: number,
  references: Reference[],
  personalExperiences: string[],
  currentScript: string
) {
  const prompt = `Continue the podcast script about "${title}" with the section "${currentSection.title}".
Current speakers: HOST${memberCount > 1 ? ', ' + Array.from({length: memberCount - 1}, (_, i) => `GUEST ${i + 1}`).join(', ') : ''}.

${prevSection ? `Previous section was about "${prevSection.title}".` : ''}
${nextSection ? `Next section will be about "${nextSection.title}".` : ''}

Key points to cover:
${sectionPoints.map(p => `- ${p.text}`).join('\n')}

References to incorporate:
${references.map(r => `- ${r.content}`).join('\n')}

${personalExperiences.length > 0 ? `Personal experiences to weave in:
${personalExperiences.join('\n')}` : ''}

Create a natural flowing conversation that:
1. Transitions smoothly from the previous section (if applicable)
2. Covers the key points while maintaining a conversational tone
3. Incorporates references and experiences naturally
4. Sets up the next section (if applicable)

Current script context (last 200 characters):
${currentScript.slice(-200)}`;

  return prompt;
}

function createConclusionPrompt(title: string, sections: Section[], memberCount: number, currentScript: string) {
  return `Create a natural conclusion for the podcast about "${title}".
Speakers: HOST${memberCount > 1 ? ', ' + Array.from({length: memberCount - 1}, (_, i) => `GUEST ${i + 1}`).join(', ') : ''}.

Summarize the main points discussed:
${sections.map(s => `- ${s.title}`).join('\n')}

Current script context (last 200 characters):
${currentScript.slice(-200)}

Create a conclusion that:
1. Naturally wraps up the discussion
2. Summarizes key takeaways
3. Ends on an engaging note
4. Thanks the listeners and any guests`;
}

function distributeSectionReferences(references: Reference[], sectionIndex: number, totalSections: number) {
  // Distribute references evenly across sections while maintaining narrative flow
  const referencesPerSection = Math.ceil(references.length / totalSections);
  const start = sectionIndex * referencesPerSection;
  const end = Math.min(start + referencesPerSection, references.length);
  return references.slice(start, end);
}

// Helper function to calculate max tokens based on target word count
function calculateMaxTokens(maxWords: number) {
  // Estimate 1.5 tokens per word for English text
  const estimatedTokens = maxWords * 1.5;
  // Add 20% buffer, but cap at reasonable limit
  return Math.min(Math.ceil(estimatedTokens * 1.2), 4000);
} 