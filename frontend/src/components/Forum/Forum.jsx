import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Paper, 
  Pagination, 
  Chip,
  Tabs,
  Tab,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostList from './PostList';
import CreatePostDialog from './CreatePostDialog';
import { api } from '../../utils/api';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon,
  Favorite as FavoriteIcon,
  Forum as ForumIcon,
  Add as AddIcon,
  Sort as SortIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Whatshot as WhatshotIcon,
  AccessTime as AccessTimeIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Info as InfoIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    background: theme.palette.action.disabledBackground,
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 16,
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

const popularTags = [
  'Workplace Harassment', 
  'Domestic Violence', 
  'Equal Pay', 
  'Maternity Rights', 
  'Sexual Harassment',
  'Legal Aid'
];

const Forum = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async (pageNum = 1, sort = 'latest', tag = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = `/forum/posts?page=${pageNum}&limit=10`;
      
      if (sort === 'trending') {
        endpoint += '&sort=trending';
      } else if (sort === 'top') {
        endpoint += '&sort=votes';
      }
      
      if (tag) {
        endpoint += `&tag=${encodeURIComponent(tag)}`;
      }
      
      if (searchQuery) {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await api.get(endpoint);
      setPosts(response.data.posts);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load forum posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sortType = tabValue === 0 ? 'latest' : tabValue === 1 ? 'trending' : 'top';
    fetchPosts(page, sortType, selectedTag);
  }, [page, tabValue, selectedTag]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(1, tabValue === 0 ? 'latest' : tabValue === 1 ? 'trending' : 'top', selectedTag);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCreatePost = async (postData) => {
    try {
      setLoading(true);
      await api.post('/forum/posts', postData);
      fetchPosts(page);
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/forum/posts/${postId}/vote`, { voteType });
      fetchPosts(page);
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to register your vote. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Clear the tag filter if it's already selected
    } else {
      setSelectedTag(tag);
    }
    setPage(1); // Reset to first page when changing tag filter
  };

  const handleSortMenuOpen = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (index) => {
    setTabValue(index);
    handleSortMenuClose();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            <ForumIcon />
          </Avatar>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Community Forum
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Connect, share experiences, and find support
            </Typography>
          </Box>
        </Box>
        
        {user ? (
          <GradientButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ 
              py: 1.5, 
              px: 3,
              borderRadius: 2,
              fontSize: '0.95rem'
            }}
          >
            Share Your Story
          </GradientButton>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ 
              py: 1.5, 
              px: 3,
              borderRadius: 2,
              fontSize: '0.95rem'
            }}
          >
            Sign in to Post
          </Button>
        )}
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          p: 0, 
          mb: 4, 
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                mb: { xs: 2, sm: 0 },
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  mx: 0.5,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 1.5,
                }
              }}
            >
              <Tab 
                label="Latest" 
                icon={<AccessTimeIcon fontSize="small" />} 
                iconPosition="start"
              />
              <Tab 
                label="Trending" 
                icon={<WhatshotIcon fontSize="small" />} 
                iconPosition="start"
              />
              <Tab 
                label="Top Rated" 
                icon={<ThumbUpIcon fontSize="small" />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: { xs: 2, sm: 0 } }}>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowDropDownIcon />}
              onClick={handleSortMenuOpen}
              sx={{ borderRadius: 2 }}
            >
              {tabValue === 0 ? 'Latest' : tabValue === 1 ? 'Trending' : 'Top Rated'}
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  mt: 1, 
                  borderRadius: 2,
                  minWidth: 180
                }
              }}
            >
              <MenuItem onClick={() => handleSortSelect(0)} selected={tabValue === 0}>
                <ListItemIcon>
                  <AccessTimeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Latest</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect(1)} selected={tabValue === 1}>
                <ListItemIcon>
                  <WhatshotIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Trending</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect(2)} selected={tabValue === 2}>
                <ListItemIcon>
                  <ThumbUpIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Top Rated</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
              <TextField
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        type="submit" 
                        edge="end"
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </form>
          </Box>
        </Box>
        
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
              Popular topics:
            </Typography>
            
            {selectedTag && (
              <Chip
                label="Clear filters"
                size="small"
                onDelete={() => setSelectedTag(null)}
                sx={{ 
                  mr: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  borderRadius: 4
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {popularTags.map((tag) => (
              <StyledChip
                key={tag}
                label={tag}
                size="small"
                onClick={() => handleTagClick(tag)}
                sx={{ 
                  borderRadius: 4,
                  bgcolor: selectedTag === tag 
                    ? alpha(theme.palette.primary.main, 0.2) 
                    : alpha(theme.palette.primary.main, 0.1),
                  fontWeight: selectedTag === tag ? 600 : 500,
                }}
              />
            ))}
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {loading && posts.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : posts.length === 0 ? (
            <Box 
              sx={{ 
                py: 8, 
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <QuestionAnswerIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
                {searchQuery || selectedTag ? 'No matching posts found' : 'No posts yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                {searchQuery || selectedTag 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Be the first to start a conversation in our community forum.'}
              </Typography>
              {!searchQuery && !selectedTag && user && (
                <GradientButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Share Your Story
                </GradientButton>
              )}
            </Box>
          ) : (
            <>
              <PostList
                posts={posts}
                onVote={handleVote}
                currentUser={user}
              />
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: theme.palette.primary.main }} />
                </Box>
              )}
            </>
          )}
        </Box>
        
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 3,
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                  background: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            />
          </Box>
        )}
      </Paper>
      
      <Box sx={{ 
        mt: 4, 
        p: 3,
        borderRadius: 3,
        background: alpha(theme.palette.primary.light, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        display: 'flex',
        alignItems: 'flex-start'
      }}>
        <InfoIcon sx={{ color: theme.palette.primary.main, mr: 2, mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle1" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
            Community Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our forum is a safe space for women to share experiences and seek advice. Please be respectful, supportive, and 
            considerate in your interactions. We encourage constructive discussions and empathy towards all community members.
            Last updated: April 24, 2025 at 3:45 AM IST.
          </Typography>
        </Box>
      </Box>

      <CreatePostDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreatePost}
      />
    </Container>
  );
};

export default Forum;
