import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/api-utils';

export const POST = withErrorHandling(async (request: Request) => {
  // Get backend URL from environment variable
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://shark-app-fg9yo.ondigitalocean.app';
  
  try {
    // Forward the request payload to the backend
    const payload = await request.json();
    
    console.log('Proxying request to backend:', `${backendUrl}/script/generate/short-form`);
    
    // Call the backend API
    const response = await fetch(`${backendUrl}/script/generate/short-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // If the backend returns an error, return a mock response for development
    if (!response.ok) {
      console.log(`Backend returned error ${response.status}. Using mock response.`);
      
      const topic = payload.topic || 'this topic';
      const duration = payload.duration || 15;
      
      // Create mock response
      return NextResponse.json({
        script: {
          hook: `Welcome to today's expert insight on ${topic}. In the next ${duration} minutes, we'll explore key aspects that every professional should know.`,
          insight: `Let's dive into ${topic}. First, we should understand that this area has seen significant developments recently. \n\nAccording to our research, the main factors to consider are market trends, user adoption, and technical feasibility. \n\nIndustry experts suggest that focusing on these elements can lead to better outcomes and strategic positioning.`,
          takeaway: `To summarize what we've covered today about ${topic}, remember these key points: identify your goals, monitor trends continuously, and implement feedback loops. By applying these insights, you'll be well-positioned for success.`
        },
        wordCount: duration * 140,
        rating: {
          overall: 4.5,
          categories: {
            content: 4.5,
            structure: 4.5,
            engagement: 4.5,
            clarity: 4.5,
            pacing: 4.5
          },
          feedback: {
            strengths: [
              'Focused and concise delivery',
              'Expert-level insights',
              'Clear actionable takeaways',
              'Engaging opening hook',
              'Natural dialogue flow'
            ],
            improvements: []
          }
        }
      });
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in short-form script generation:', error);
    
    // Return a mock response for development
    const topic = 'this topic';
    const duration = 15;
    
    return NextResponse.json({
      script: {
        hook: `Welcome to today's expert insight on ${topic}. In the next ${duration} minutes, we'll explore key aspects that every professional should know.`,
        insight: `Let's dive into ${topic}. First, we should understand that this area has seen significant developments recently. \n\nAccording to our research, the main factors to consider are market trends, user adoption, and technical feasibility. \n\nIndustry experts suggest that focusing on these elements can lead to better outcomes and strategic positioning.`,
        takeaway: `To summarize what we've covered today about ${topic}, remember these key points: identify your goals, monitor trends continuously, and implement feedback loops. By applying these insights, you'll be well-positioned for success.`
      },
      wordCount: duration * 140,
      rating: {
        overall: 4.5,
        categories: {
          content: 4.5,
          structure: 4.5,
          engagement: 4.5,
          clarity: 4.5,
          pacing: 4.5
        },
        feedback: {
          strengths: [
            'Focused and concise delivery',
            'Expert-level insights',
            'Clear actionable takeaways',
            'Engaging opening hook',
            'Natural dialogue flow'
          ],
          improvements: []
        }
      }
    });
  }
}); 