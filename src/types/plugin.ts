import { TrendingContent } from './trends';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<WordnetPluginProps>;
  icon?: React.ReactNode;
}

export interface WordnetPluginProps {
  topic: string;
  onTrendsSelected: (trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => void;
} 