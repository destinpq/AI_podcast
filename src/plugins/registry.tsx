import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Plugin } from '@/types/plugin';
import { WordnetPlugin } from './wordnet';

export const plugins: Plugin[] = [
  {
    id: 'wordnet',
    name: 'Trends Wordnet',
    description: 'Select relevant trends and topics for your podcast script',
    component: WordnetPlugin,
    icon: <TrendingUpIcon />,
  },
  // Add more plugins here as needed
];

export const getPlugin = (id: string): Plugin | undefined => {
  return plugins.find(plugin => plugin.id === id);
}; 