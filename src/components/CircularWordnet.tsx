'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Tooltip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { TrendingContent } from '@/types/trends';

// We'll dynamically import the ForceGraph2D component to avoid SSR issues
import dynamic from 'next/dynamic';

// Dynamically import the ForceGraph2D with no SSR
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
);

interface CircularWordnetProps {
  open: boolean;
  onClose: () => void;
  topic: string;
  trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  };
  onTrendsSelected: (trends: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  }) => void;
}

// Define our internal node type
interface Node {
  id: string;
  name: string;
  type: 'topic' | 'news' | 'discussion' | 'query';
  url?: string;
  source?: string;
  val: number;
  color: string;
  x?: number;
  y?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  color: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export const CircularWordnet: React.FC<CircularWordnetProps> = ({
  open,
  onClose,
  topic,
  trends = { news: [], discussions: [], relatedQueries: [] },
  onTrendsSelected,
}) => {
  const [isClient, setIsClient] = useState(false);

  // Only render the graph on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const graphData = useMemo<GraphData>(() => {
    const nodes: Node[] = [
      {
        id: 'topic',
        name: topic,
        type: 'topic',
        val: 20,
        color: '#1976d2', // Primary color
      },
    ];

    const links: Link[] = [];

    // Add news nodes and links
    if (trends?.news?.length > 0) {
      trends.news.forEach((news, index) => {
        const nodeId = `news-${index}`;
        nodes.push({
          id: nodeId,
          name: news.title,
          type: 'news',
          url: news.url,
          source: news.source,
          val: 10,
          color: '#2e7d32', // Success color
        });
        links.push({
          source: 'topic',
          target: nodeId,
          color: '#2e7d32',
        });
      });
    }

    // Add discussion nodes and links
    if (trends?.discussions?.length > 0) {
      trends.discussions.forEach((discussion, index) => {
        const nodeId = `discussion-${index}`;
        nodes.push({
          id: nodeId,
          name: discussion.title,
          type: 'discussion',
          url: discussion.url,
          source: discussion.source,
          val: 10,
          color: '#ed6c02', // Warning color
        });
        links.push({
          source: 'topic',
          target: nodeId,
          color: '#ed6c02',
        });
      });
    }

    // Add related query nodes and links
    if (trends?.relatedQueries?.length > 0) {
      trends.relatedQueries.forEach((query, index) => {
        const nodeId = `query-${index}`;
        nodes.push({
          id: nodeId,
          name: query,
          type: 'query',
          val: 8,
          color: '#9c27b0', // Purple color
        });
        links.push({
          source: 'topic',
          target: nodeId,
          color: '#9c27b0',
        });
      });
    }

    return { nodes, links };
  }, [topic, trends]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (node: any) => {
    if (node.url) {
      window.open(node.url, '_blank');
    }
  };

  const handleProceed = () => {
    onTrendsSelected(trends);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" component="span">
          Topic Wordnet: {topic}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ ml: 'auto' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: '100%', position: 'relative' }}>
          {open && isClient ? (
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeRelSize={6}
              linkWidth={1}
              linkDirectionalParticles={1}
              linkDirectionalParticleSpeed={0.004}
              onNodeClick={handleNodeClick}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, node.val, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, node.x || 0, node.y || 0);
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              gap: 2,
            }}
          >
            <Tooltip title="Proceed with selected trends">
              <IconButton
                onClick={handleProceed}
                color="primary"
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TrendingUpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 