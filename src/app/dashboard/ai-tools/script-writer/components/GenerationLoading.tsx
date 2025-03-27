'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Stack,
  Avatar,
  Checkbox
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Assignment as AssignmentIcon,
  Article as ArticleIcon,
  Bolt as BoltIcon,
  Lightbulb as LightbulbIcon,
  MenuBook as MenuBookIcon,
  Mic as MicIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { GenerationStep, UserReference } from '../types';
import TabPanel from './TabPanel';

interface GenerationLoadingProps {
  memberCount: number;
  tabValue: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  generationSteps: GenerationStep[];
  userReferences: UserReference[];
  selectedReferences: string[];
  aiGeneratingNews: boolean;
  aiGeneratingFacts: boolean;
  handleArticlePreview: (event: React.MouseEvent, article: UserReference) => void;
  toggleReferenceSelection: (id: string) => void;
  theme: Theme;
}

const GenerationLoading: React.FC<GenerationLoadingProps> = ({
  memberCount,
  tabValue,
  handleTabChange,
  generationSteps,
  userReferences,
  selectedReferences,
  aiGeneratingNews,
  aiGeneratingFacts,
  handleArticlePreview,
  toggleReferenceSelection,
  theme
}) => {
  return (
    <Box sx={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, sm: 4 }
    }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        maxWidth: 950, 
        width: '100%',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 24,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: { xs: 1, sm: 1.5 },
          position: 'relative',
          height: 120
        }}>
          {/* Animated person reading animation */}
          <motion.div
            style={{ 
              position: 'absolute',
              width: '100%',
              maxWidth: 300,
              height: 120,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box sx={{ 
              position: 'relative', 
              width: 100, 
              height: 100,
              bgcolor: 'primary.light',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 3
            }}>
              <PersonIcon sx={{ fontSize: 60, color: 'white' }} />
              
              {/* Circular orbit for the book */}
              <Box sx={{ 
                position: 'absolute',
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '1px dashed rgba(255,255,255,0.2)',
                animation: 'spin 8s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}>
                {/* Orbiting book */}
                <motion.div
                  animate={{
                    rotate: 0,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  style={{
                    position: 'absolute',
                    top: -18,
                    left: 65,
                    background: theme.palette.secondary.main,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 20, color: 'white' }} />
                </motion.div>
              </Box>

              {/* Microphone to represent podcast */}
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                style={{
                  position: 'absolute',
                  bottom: -15,
                  left: 50,
                  transform: 'translateX(-50%)',
                  background: theme.palette.primary.main,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                <MicIcon sx={{ fontSize: 18, color: 'white' }} />
              </motion.div>
            </Box>
          </motion.div>
        </Box>

        <Typography 
          variant="h5" 
          gutterBottom 
          align="center"
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            mb: 2
          }}
        >
          Generating Your {memberCount > 1 ? `${memberCount}-Person ` : ''}Podcast Script
        </Typography>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ 
            mb: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Tab 
            label="Script Progress" 
            icon={<AssignmentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="News Articles" 
            icon={<ArticleIcon />} 
            iconPosition="start"
            sx={{ color: userReferences.filter(ref => ref.type === 'article').length > 0 ? 'primary.main' : 'inherit' }}
          />
          <Tab 
            label="Amazing Facts" 
            icon={<BoltIcon />} 
            iconPosition="start"
            sx={{ color: userReferences.filter(ref => ref.type === 'factoid').length > 0 ? 'secondary.main' : 'inherit' }}
          />
        </Tabs>

        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'hidden',
          display: 'flex',
          minHeight: '350px',
          maxHeight: '50vh'
        }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 1, height: '100%', overflow: 'auto' }}>
              <Typography variant="body1" fontWeight={500} gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Finalizing your script...
              </Typography>
              
              <Box sx={{ overflow: 'auto', pr: 1 }}>
                <AnimatePresence>
                  {generationSteps.map((step) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1,
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <Typography 
                            variant="body1"
                            sx={{ 
                              flex: 1,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              color: step.status === 'completed' 
                                ? 'success.main' 
                                : step.status === 'active' 
                                ? 'primary.main' 
                                : 'text.secondary'
                            }}
                          >
                            {step.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              ml: { xs: 0, sm: 2 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {step.progress}%
                          </Typography>
                        </Box>
                        <Box 
                          component={motion.div}
                          sx={{ 
                            height: { xs: 4, sm: 6 }, 
                            bgcolor: 'background.default',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            component={motion.div}
                            animate={{ 
                              width: `${step.progress}%`,
                              backgroundColor: step.status === 'completed' 
                                ? '#4caf50' 
                                : step.status === 'active' 
                                ? '#2196f3' 
                                : '#9e9e9e'
                            }}
                            initial={{ width: 0 }}
                            transition={{ duration: 0.5 }}
                            sx={{ 
                              height: '100%',
                              borderRadius: 3
                            }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <Typography variant="body1" color="primary" fontWeight={500} sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                News Articles Found ({userReferences.filter(ref => ref.type === 'article').length})
              </Typography>
              
              <Grid container spacing={2}>
                {userReferences
                  .filter(ref => ref.type === 'article')
                  .map((article) => (
                    <Grid item xs={12} md={6} key={article.id}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          display: 'flex',
                          height: '100%',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        {article.thumbnail && (
                          <CardMedia
                            component="img"
                            sx={{ width: 120, height: 'auto', objectFit: 'cover' }}
                            image={article.thumbnail}
                            alt={article.content}
                          />
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
                          <CardContent sx={{ flex: '1 0 auto', py: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="subtitle1" component="div" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                {article.content}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleArticlePreview(e, article)}
                                sx={{ 
                                  bgcolor: 'action.hover',
                                  ml: 1,
                                  '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                }}
                              >
                                <ArticleIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            {article.description && (
                              <Typography variant="body2" color="text.secondary" sx={{
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}>
                                {article.description}
                              </Typography>
                            )}
                            <Chip 
                              size="small" 
                              label={article.source}
                              sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              color={selectedReferences.includes(article.id) ? "primary" : "default"}
                              variant={selectedReferences.includes(article.id) ? "filled" : "outlined"}
                            />
                          </CardContent>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
              
              {userReferences.filter(ref => ref.type === 'article').length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ArticleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Searching for relevant news articles...
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <Typography variant="body1" color="secondary" fontWeight={500} sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                Amazing Facts Discovered ({userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length})
              </Typography>
              
              <Stack spacing={2}>
                {userReferences
                  .filter(ref => ref.type === 'factoid' || ref.type === 'stat')
                  .map((fact) => {
                    const isSelected = selectedReferences.includes(fact.id);
                    return (
                      <Paper
                        key={fact.id}
                        elevation={3}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          position: 'relative',
                          overflow: 'hidden',
                          border: isSelected ? 2 : 0,
                          borderColor: 'secondary.main',
                          borderLeft: `6px solid ${fact.color || 'secondary.main'}`,
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 6
                          }
                        }}
                        onClick={() => toggleReferenceSelection(fact.id)}
                      >
                        {isSelected && (
                          <Checkbox
                            checked
                            sx={{ 
                              position: 'absolute', 
                              top: 5, 
                              right: 5, 
                              zIndex: 1,
                              color: 'secondary.main',
                              bgcolor: 'rgba(255,255,255,0.8)',
                              borderRadius: '50%'
                            }}
                          />
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Avatar
                            sx={{
                              bgcolor: fact.color || 'secondary.main',
                              mr: 2,
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 }
                            }}
                          >
                            {fact.type === 'factoid' ? <BoltIcon sx={{ fontSize: { xs: 16, sm: 24 } }} /> : <PsychologyIcon sx={{ fontSize: { xs: 16, sm: 24 } }} />}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {fact.content}
                            </Typography>
                            {fact.source && (
                              <Chip 
                                variant="outlined"
                                size="small"
                                icon={<ArticleIcon sx={{ fontSize: '0.7rem' }} />}
                                label={`Source: ${fact.source}`}
                                color="secondary"
                                sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
              </Stack>
              
              {userReferences.filter(ref => ref.type === 'factoid' || ref.type === 'stat').length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LightbulbIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Discovering amazing facts about this topic...
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          pt: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          mt: 2
        }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Weaving everything together to create your perfect podcast script...
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default GenerationLoading;
