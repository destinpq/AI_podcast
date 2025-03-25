import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Pagination,
  Stack,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon
} from '@mui/icons-material';

export default function ResearchProjects() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Research Projects
        </Typography>
        <Button
          component={Link}
          href="/dashboard/ai-tools/research-generator"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          New Research Project
        </Button>
      </Box>

      {/* Project Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                defaultValue="all"
              >
                <MenuItem value="all">All Projects</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                defaultValue="newest"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="updated">Recently Updated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {/* Empty State */}
        <Grid item xs={12}>
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ScienceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" component="h3" gutterBottom>
              No Research Projects Yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Get started by creating your first research project.
            </Typography>
            <Button
              component={Link}
              href="/dashboard/ai-tools/research-generator"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
            >
              Create New Project
            </Button>
          </Paper>
        </Grid>

        {/* Project Card Template (commented out until needed) */}
        {/* <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  Project Title
                </Typography>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                />
              </Box>
              <Typography color="text.secondary" paragraph>
                Project description goes here...
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last updated: 2 days ago
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <IconButton size="small">
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid> */}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={3} color="primary" />
      </Box>
    </Box>
  );
} 