export interface SelectedPoint {
  sectionIndex: number;
  pointIndex: number;
  text: string;
  elaboration?: string;
  promptType?: string;
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
  type: string;
  content: string;
  source?: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface GenerationStep {
  title: string;
  status: 'completed' | 'pending' | 'active' | 'error';
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
  { value: 1, label: '1 minute' },
  { value: 2, label: '2 minutes' },
  { value: 3, label: '3 minutes' }
];

export const MEMBER_OPTIONS = [
  { value: 1, label: 'Solo' },
  { value: 2, label: '2 People' },
  { value: 3, label: '3 People' },
  { value: 4, label: '4 People' }
];

export interface Section {
  title: string;
  points: string[];
}

export interface TrendsData {
  trends: string[];
  news?: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
  }>;
}

export interface AIRating {
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
}
