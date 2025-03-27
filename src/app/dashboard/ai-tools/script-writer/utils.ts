import { collection, addDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import { db } from '@/lib/firebase';
import { ScriptData } from './types';

// Function to save script to Firestore
export const saveScriptToFirestore = async (scriptData: ScriptData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'scripts'), scriptData);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to save script to Firestore');
  }
};

// Function to save script as PDF
export const saveScriptAsPDF = (scriptContent: string): void => {
  try {
    const doc = new jsPDF();
    doc.text(scriptContent, 10, 10);
    doc.save('script.pdf');
  } catch (e) {
    console.error('Error saving PDF: ', e);
    throw new Error('Failed to save script as PDF');
  }
};

// Function to generate a random color
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to generate placeholder images when thumbnails aren't available
export const getPlaceholderImage = (text: string, topic: string, type: string = 'article'): string => {
  // Generate a random but consistent hash based on text
  const hash = Math.abs(text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000);
  
  // Use different placeholder services based on content type
  if (type === 'article') {
    return `https://source.unsplash.com/featured/300x200?${encodeURIComponent(topic)}&sig=${hash}`;
  } else {
    return `https://via.placeholder.com/300x200/4a90e2/ffffff?text=${encodeURIComponent(text.substring(0, 20))}`;
  }
};

// Function to format the script content with proper styling
export const formatScriptContent = (script: string): string => {
  if (!script) return '';

  // Split the script into lines
  const lines = script.split('\n');
  
  // Format the script for display
  return lines.map(line => {
    // Check for section headers (like [INTRO], [Conclusion], etc.)
    if (line.match(/^\[(.*?)\]$/) || line.match(/^#+\s+(.*)$/)) {
      const titleMatch = line.match(/^\[(.*?)\]$/) || line.match(/^#+\s+(.*)$/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[0]) : line;
      return `\n[${title.replace(/[\[\]#]/g, '').trim()}]\n`;
    } 
    // Check for speaker lines (e.g., "HOST: Hello")
    else if (line.match(/^([A-Z0-9 ]+):\s+(.*)/)) {
      return line; // Keep speaker lines as they are
    } 
    // Empty lines stay empty
    else if (line.trim() === '') {
      return '';
    } 
    // Regular text line
    else {
      return line;
    }
  }).join('\n');
};

// News prompt templates for different emotional angles
export const getNewsPromptTemplates = () => {
  return {
    positive: {
      title: "Positive News",
      emoji: "✅",
      prompt: "Give me a recent uplifting or positive real news story about [your topic] that shows progress or innovation. Include a credible source or citation."
    },
    negative: {
      title: "Negative News",
      emoji: "❌",
      prompt: "Share a recent negative or concerning real news story related to [your topic], highlighting the problem or controversy. Add a credible source or citation."
    },
    wholesome: {
      title: "Wholesome News",
      emoji: "💖",
      prompt: "Find a recent wholesome or heartwarming real news story about [your topic] that restores faith in humanity. Include a reliable source or citation."
    },
    alarming: {
      title: "Alarming News",
      emoji: "🚨",
      prompt: "What's a recent alarming or urgent real news headline about [your topic] that most people might not be aware of? Add a citation or link to a trusted source."
    },
    whacky: {
      title: "Whacky News",
      emoji: "🤯",
      prompt: "Give me the most bizarre, unbelievable, or whacky real news story about [your topic] from the last few years. Include a credible citation or link."
    }
  };
};

// Viral content prompt templates for engaging podcast segments
export const getViralContentPrompts = () => {
  return {
    main: {
      title: "Viral Content Template",
      emoji: "🧠",
      prompt: "Give me a short, emotionally charged and curiosity-driven script segment on [your topic], structured like a viral podcast intro or segment — make it hook the audience in the first 10 seconds and build from there."
    },
    addons: [
      {
        title: "Controversial Claim",
        description: "Include a controversial or surprising claim."
      },
      {
        title: "Shareable Content",
        description: "Make it sound like something people have to share or debate."
      },
      {
        title: "Punchy Language",
        description: "Use casual but punchy language, like a charismatic podcast host."
      }
    ],
    example: "Give me a short, emotionally charged and curiosity-driven script segment on the dark side of productivity, structured like a viral podcast intro or segment — make it hook the audience in the first 10 seconds and include a controversial claim."
  };
};

// Sequential query structure for viral podcast content
export const getSequentialPrompts = () => {
  return [
    {
      title: "Hook (Query 1)",
      emoji: "1️⃣",
      prompt: "Give me a shocking or controversial opening line about [topic], like a viral podcast would start."
    },
    {
      title: "The Why (Query 2)",
      emoji: "2️⃣",
      prompt: "Explain in a punchy way why this topic matters to everyone listening — add urgency or relevance."
    },
    {
      title: "Hidden Truth (Query 3)",
      emoji: "3️⃣",
      prompt: "Share a hidden or surprising truth about [topic] most people don't know."
    },
    {
      title: "Myth Busting (Query 4)",
      emoji: "4️⃣",
      prompt: "Bust one common myth about [topic] in an engaging way — keep it short."
    },
    {
      title: "Real-World Hook (Query 5)",
      emoji: "5️⃣",
      prompt: "Tell a real or hypothetical story that illustrates the emotional impact of [topic]."
    },
    {
      title: "Call to Thought (Query 6)",
      emoji: "6️⃣",
      prompt: "End with a mind-opening takeaway or thought-provoking question that would make people want to share the episode."
    }
  ];
};
