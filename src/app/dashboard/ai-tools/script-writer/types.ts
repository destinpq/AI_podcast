export interface SelectedPoint {
  sectionIndex: number;
  pointIndex: number;
  text: string;
  elaboration?: string;
  promptType?: 'life_experience' | 'joke' | 'analogy' | 'example' | 'statistic' | 'quote';
}

export interface Outline {
  title: string;
  sections: Array<{
    title: string;
    points: string[];
  }>;
}

export interface TrendingContent {
  title: string;
  source: string;
  url: string;
  score?: number;
  publishedAt?: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  urlToImage?: string;
  thumbnail?: string;
}

export interface UserReference {
  id: string;
  type: 'article' | 'factoid' | 'stat';
  content: string;
  url?: string;
  source?: string;
  description?: string;
  thumbnail?: string;
  color?: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface GenerationStep {
  title: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

export interface ScriptData {
  topic: string;
  script: string;
  outline: {
    intro: string;
    topics: string[];
    conclusion: string;
  };
  duration: number;
  memberCount: number;
  userId: string | undefined;
  rating: number;
  aiRating: {
    overall: number;
    categories: {
      content: number;
      structure: number;
      engagement: number;
      clarity: number;
      pacing: number;
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  } | null;
  createdAt: string;
  references: UserReference[];
}

export interface SaveScriptButtonProps {
  topic: string;
  script: string;
  outline: {
    intro: string;
    topics: string[];
    conclusion: string;
  };
  duration: number;
  memberCount: number;
  userId: string | undefined;
  trends?: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  };
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export const PROMPT_TYPES = [
  { value: 'life_experience', label: 'Life Experience' },
  { value: 'joke', label: 'Joke or Humor' },
  { value: 'analogy', label: 'Analogy' },
  { value: 'example', label: 'Real-world Example' },
  { value: 'statistic', label: 'Statistic or Fact' },
  { value: 'quote', label: 'Quote' },
];

export const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

export const MEMBER_OPTIONS = [
  { value: 1, label: 'Solo' },
  { value: 2, label: '2 Members' },
  { value: 3, label: '3 Members' },
  { value: 4, label: '4 Members' },
];
