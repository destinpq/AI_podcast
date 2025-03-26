import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Script ID is required' },
        { status: 400 }
      );
    }

    // In a real application, you would fetch the script from a database
    // For this demo, we'll return a simple text response
    
    const mockScript = `
PODCAST SCRIPT: AI and Machine Learning Trends 2023

HOST: Welcome to today's episode where we'll be diving deep into the latest AI trends in 2023. I'm joined by our expert, who will help us understand the fascinating developments in this field.

EXPERT: Thanks for having me! There's been incredible progress in AI recently, especially in generative models and their application across industries.

HOST: Let's start with the biggest trend - what's making waves right now?

EXPERT: Without question, multimodal AI models are the breakthrough of the year. These systems can work across text, images, audio, and even video simultaneously, creating more human-like interactions.

HOST: What does this mean for everyday applications?

EXPERT: For the average person, this translates to more intuitive digital assistants, content creation tools that can generate both images and text coherently, and even apps that can understand context in multiple formats.

HOST: I've heard a lot about responsible AI development. How is the industry addressing ethical concerns?

EXPERT: Great question. There's been a marked shift toward transparency frameworks. Companies are now implementing explainable AI techniques that help users understand how decisions are being made. Additionally, bias detection tools are becoming standard in development pipelines.

[TRANSITION]

HOST: Looking toward practical applications, which industries are seeing the biggest impact?

EXPERT: Healthcare is experiencing a revolution. AI systems are now assisting with everything from diagnostic imaging to drug discovery. In fact, a recent study showed AI-assisted diagnostics improved accuracy by 31% in certain conditions.

HOST: That's remarkable! And what about other sectors?

EXPERT: Education and financial services are close behind. In education, personalized learning platforms are using AI to adapt to individual student needs in real-time. And in finance, fraud detection systems have become so sophisticated they can identify patterns human analysts might miss.

HOST: As we wrap up today's episode, what's one piece of advice you'd give to our listeners about navigating this AI-powered future?

EXPERT: Stay curious and engaged. The best way to adapt to these changes is to understand the basic principles of how AI works. You don't need to become a programmer, but developing AI literacy will be as important as digital literacy was in the previous decade.

HOST: Excellent advice. Thank you for sharing your insights with us today!

EXPERT: My pleasure. Looking forward to seeing how these trends evolve in the coming months.

HOST: And thank you for listening. Join us next week as we explore another fascinating topic in the world of technology!

[END]
    `;
    
    // Set headers for a text file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set('Content-Disposition', `attachment; filename="podcast-script-${id}.txt"`);
    
    return new Response(mockScript, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error downloading script:', error);
    return NextResponse.json(
      { error: 'Failed to download script' },
      { status: 500 }
    );
  }
} 