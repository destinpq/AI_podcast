import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  CircularProgress, 
  Alert, 
  Tooltip, 
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Collapse,
  Badge,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ForumIcon from '@mui/icons-material/Forum';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { TrendingContent } from '@/types/trends';

interface WordnetPluginProps {
  topic: string;
  onTrendsSelected: (trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => void;
}

export const WordnetPlugin: React.FC<WordnetPluginProps> = ({ topic, onTrendsSelected }) => {
  const [trends, setTrends] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }>({
    news: [],
    discussions: [],
    relatedQueries: [],
  });
  
  const [selectedTrends, setSelectedTrends] = useState<{
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }>({
    news: [],
    discussions: [],
    relatedQueries: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    news: true,
    discussions: true,
    relatedQueries: true
  });

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/research/trends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }

        const data = await response.json();
        setTrends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends');
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchTrends();
    }
  }, [topic]);

  const handleTrendSelect = (
    type: 'news' | 'discussions' | 'relatedQueries',
    item: TrendingContent | string,
    selected: boolean
  ) => {
    setSelectedTrends(prev => {
      const newSelected = { ...prev };
      if (selected) {
        if (type === 'relatedQueries') {
          newSelected[type] = [...prev[type], item as string];
        } else {
          newSelected[type] = [...prev[type], item as TrendingContent];
        }
      } else {
        if (type === 'relatedQueries') {
          newSelected[type] = prev[type].filter(q => q !== item);
        } else {
          newSelected[type] = prev[type].filter(
            t => (t as TrendingContent).title !== (item as TrendingContent).title
          );
        }
      }
      return newSelected;
    });
  };

  const handleProceed = () => {
    onTrendsSelected(selectedTrends);
  };

  const toggleSection = (section: 'news' | 'discussions' | 'relatedQueries') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const selectedCount = 
    selectedTrends.news.length + 
    selectedTrends.discussions.length + 
    selectedTrends.relatedQueries.length;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <NewspaperIcon />
                </Avatar>
              }
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6">News Articles</Typography>
                  <Badge badgeContent={selectedTrends.news.length} color="primary" sx={{ mr: 2 }}>
                    <IconButton onClick={() => toggleSection('news')} size="small">
                      {expandedSections.news ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Badge>
                </Box>
              }
            />
            <Collapse in={expandedSections.news}>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {trends.news.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No news articles found for this topic.</Typography>
                  ) : (
                    trends.news.map((news, index) => {
                      const isSelected = selectedTrends.news.some(n => n.title === news.title);
                      return (
                        <Tooltip key={index} title={`${news.source} • ${news.url}`}>
                          <Chip
                            label={news.title}
                            onClick={() => handleTrendSelect('news', news, !isSelected)}
                            color={isSelected ? "primary" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            sx={{ 
                              maxWidth: '100%', 
                              height: 'auto',
                              '& .MuiChip-label': { 
                                whiteSpace: 'normal',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                py: 0.5
                              }
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  )}
                </Box>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                  <ForumIcon />
                </Avatar>
              }
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6">Current Discussions</Typography>
                  <Badge badgeContent={selectedTrends.discussions.length} color="secondary" sx={{ mr: 2 }}>
                    <IconButton onClick={() => toggleSection('discussions')} size="small">
                      {expandedSections.discussions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Badge>
                </Box>
              }
            />
            <Collapse in={expandedSections.discussions}>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {trends.discussions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No discussions found for this topic.</Typography>
                  ) : (
                    trends.discussions.map((discussion, index) => {
                      const isSelected = selectedTrends.discussions.some(d => d.title === discussion.title);
                      return (
                        <Tooltip key={index} title={`${discussion.source} • ${discussion.url}`}>
                          <Chip
                            label={discussion.title}
                            onClick={() => handleTrendSelect('discussions', discussion, !isSelected)}
                            color={isSelected ? "secondary" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            sx={{ 
                              maxWidth: '100%', 
                              height: 'auto',
                              '& .MuiChip-label': { 
                                whiteSpace: 'normal',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                py: 0.5
                              }
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  )}
                </Box>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <SearchIcon />
                </Avatar>
              }
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6">Related Queries</Typography>
                  <Badge badgeContent={selectedTrends.relatedQueries.length} color="info" sx={{ mr: 2 }}>
                    <IconButton onClick={() => toggleSection('relatedQueries')} size="small">
                      {expandedSections.relatedQueries ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Badge>
                </Box>
              }
            />
            <Collapse in={expandedSections.relatedQueries}>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {trends.relatedQueries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No related queries found for this topic.</Typography>
                  ) : (
                    trends.relatedQueries.map((query, index) => {
                      const isSelected = selectedTrends.relatedQueries.includes(query);
                      return (
                        <Chip
                          key={index}
                          label={query}
                          onClick={() => handleTrendSelect('relatedQueries', query, !isSelected)}
                          color={isSelected ? "info" : "default"}
                          variant={isSelected ? "filled" : "outlined"}
                        />
                      );
                    })
                  )}
                </Box>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </Grid>

      {selectedCount > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: '16px',
              width: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge badgeContent={selectedCount} color="primary">
                <TrendingUpIcon color="primary" />
              </Badge>
              <Typography variant="body1" sx={{ ml: 2 }}>
                {selectedCount} items selected
              </Typography>
              <IconButton 
                color="primary" 
                onClick={handleProceed}
                sx={{ ml: 2, bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              >
                <TrendingUpIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}; 