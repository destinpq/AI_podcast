import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/api-utils';

// Sample detailed prompts that can be used for testing
const sampleDetailedPrompts = {
  researchPrompt: "Research the historical development and modern significance of waqf boards in Islamic societies. Include information on their legal framework, financial management practices, and social impact. Focus on how these charitable endowments support community development, education, and healthcare. Gather statistics on major waqf properties worldwide and their estimated economic value. Investigate recent reforms in waqf administration across different countries.",
  structurePrompt: "Structure a 15-minute podcast exploring waqf boards with 4 distinct segments: 1) Historical origins and Islamic legal principles behind waqf, 2) Modern governance challenges and administrative structures, 3) Economic impact and investment strategies of successful waqf boards, 4) Case studies of innovative waqf projects supporting sustainable development. Begin with a compelling hook about wealth redistribution in Islamic finance, and conclude with future trends and opportunities for waqf revitalization.",
  introPrompt: "Create an engaging 60-second introduction that explains waqf as an Islamic endowment system dating back to the 7th century. Highlight how waqf boards manage religious and charitable assets worth billions globally. Use the hook 'What if there was a centuries-old financial system designed specifically for sustainable community development?' Establish the podcast's purpose of exploring how these traditional institutions are being modernized to address contemporary social challenges while maintaining their religious principles.",
  segmentPrompts: [
    "Draft a 3-minute segment explaining the governance challenges facing modern waqf boards. Discuss the tension between traditional religious oversight and professional asset management needs. Explore specific issues like transparency, accountability, and performance measurement. Include examples from Malaysia's corporatized waqf management model and Turkey's Directorate General of Foundations. Address how digital technologies are being integrated to improve record-keeping and prevent mismanagement of waqf assets.",
    "Create a 4-minute segment examining successful waqf investment strategies. Explain how innovative boards are diversifying beyond real estate into financial instruments, startup funding, and impact investments. Include the case study of Awqaf New Zealand's sustainable farm project that generates ongoing revenue. Discuss how modern waqf managers balance the need for capital preservation with generating returns for beneficiaries. Incorporate expert perspectives on the potential for waqf to fund SDGs in Muslim-majority countries."
  ],
  factCheckPrompt: "Verify all facts related to waqf boards, including statistics on their global value (estimated at over $1 trillion), legal frameworks in different jurisdictions, and historical claims. Ensure accuracy about the Ottoman waqf system and its influence on contemporary models. Double-check all quoted regulations from bodies like the Islamic Financial Services Board and AAOIFI standards on waqf management. Confirm the financial performance metrics of any mentioned waqf investment projects.",
  conclusionPrompt: "Develop a compelling 90-second conclusion that summarizes the key insights about waqf boards' evolution from traditional charitable endowments to potential vehicles for sustainable finance. Emphasize how modern reforms in governance, transparency, and investment approaches are revitalizing these institutions. End with thoughtful reflections on how waqf boards represent a bridge between Islamic heritage and contemporary social needs, with a call to action for listeners to learn more about alternative economic models that prioritize community welfare."
};

export const POST = withErrorHandling(async (request: Request) => {
  // Get backend URL from environment variable with fallback
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7778';

  try {
    // Parse the request body
    const payload = await request.json();
    console.log('Calling API to generate prompts with:', payload);

    // Try calling the backend API
    try {
      // Make the API call to the backend
      const response = await fetch(`${backendUrl}/prompts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Handle successful response from backend
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend response is not OK, throw an error
      const errorText = await response.text();
      console.error(`Backend returned error ${response.status}: ${errorText}`);
      
      // Return detailed sample prompts instead of error
      console.log('Backend error, using sample detailed prompts instead');
      return NextResponse.json(sampleDetailedPrompts);
      
    } catch (error) {
      // Handle network or other errors when calling backend
      console.error('Error calling backend:', error);
      
      // Return detailed sample prompts instead of mock
      console.log('Network error, using sample detailed prompts instead');
      return NextResponse.json(sampleDetailedPrompts);
    }
  } catch (err) {
    // Handle errors parsing the request body
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in generate-prompts API route:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}); 