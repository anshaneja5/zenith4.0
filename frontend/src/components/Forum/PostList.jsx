import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  CardActions,
  Button,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  Whatshot as WhatshotIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { styled } from '@mui/material/styles';

// Custom styled components
const PostCard = styled(Card)(({ theme }) => ({
  width: '100%',
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
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

const VoteButton = styled(IconButton)(({ theme, active, votetype }) => ({
  backgroundColor: active 
    ? alpha(votetype === 'upvote' ? theme.palette.success.main : theme.palette.error.main, 0.1)
    : 'transparent',
  color: active 
    ? (votetype === 'upvote' ? theme.palette.success.main : theme.palette.error.main)
    : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: alpha(votetype === 'upvote' ? theme.palette.success.main : theme.palette.error.main, 0.1),
  }
}));

const ViewButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  borderRadius: 20,
  padding: '4px 16px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  }
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.4,
  marginBottom: 8,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  }
}));

const PostContent = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.6,
  marginBottom: 16,
}));

const PostList = ({ posts, onVote, currentUser }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleVote = (e, postId, voteType) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    onVote(postId, voteType);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {posts.map((post) => (
        <PostCard 
          key={post._id} 
          component={Link} 
          to={`/forum/posts/${post._id}`}
          sx={{ textDecoration: 'none' }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar 
                sx={{ 
                  mr: 2,
                  bgcolor: post.isAnonymous 
                    ? alpha(theme.palette.text.secondary, 0.1) 
                    : `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: post.isAnonymous ? theme.palette.text.secondary : 'white',
                  width: 40,
                  height: 40
                }}
              >
                {post.isAnonymous ? <VisibilityOffIcon /> : post.author?.name?.[0] || 'A'}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
                  </Typography>
                  
                  {!post.isAnonymous && post.author?.isVerified && (
                    <Tooltip title="Verified Member">
                      <VerifiedIcon 
                        sx={{ 
                          ml: 0.5, 
                          fontSize: 16, 
                          color: theme.palette.primary.main 
                        }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
              
              {post.trending && (
                <Chip
                  icon={<WhatshotIcon fontSize="small" />}
                  label="Trending"
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                    borderRadius: 4
                  }}
                />
              )}
            </Box>

            <PostTitle variant="h6" component="h2">
              {post.title}
            </PostTitle>

            <PostContent variant="body2">
              {truncateContent(post.content)}
            </PostContent>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {post.tags?.slice(0, 3).map((tag) => (
                <StyledChip 
                  key={tag} 
                  label={tag} 
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/forum?tag=${tag}`);
                  }}
                />
              ))}
              {post.tags?.length > 3 && (
                <Chip
                  label={`+${post.tags.length - 3} more`}
                  size="small"
                  sx={{ 
                    borderRadius: 16,
                    bgcolor: alpha(theme.palette.text.secondary, 0.1),
                    color: theme.palette.text.secondary,
                  }}
                />
              )}
            </Box>
          </CardContent>

          <Divider sx={{ opacity: 0.6 }} />
          
          <CardActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VoteButton
                size="small"
                onClick={(e) => handleVote(e, post._id, 'upvote')}
                active={post.upvotes?.includes(currentUser?._id) ? 1 : 0}
                votetype="upvote"
                aria-label="Upvote"
              >
                <ThumbUpIcon fontSize="small" />
              </VoteButton>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  minWidth: 24,
                  textAlign: 'center'
                }}
              >
                {post.upvotes?.length - post.downvotes?.length || 0}
              </Typography>
              
              <VoteButton
                size="small"
                onClick={(e) => handleVote(e, post._id, 'downvote')}
                active={post.downvotes?.includes(currentUser?._id) ? 1 : 0}
                votetype="downvote"
                aria-label="Downvote"
              >
                <ThumbDownIcon fontSize="small" />
              </VoteButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge 
                  badgeContent={post.comments?.length || 0} 
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      fontSize: 10,
                      height: 18,
                      minWidth: 18,
                      borderRadius: 9
                    }
                  }}
                >
                  <ChatBubbleOutlineIcon fontSize="small" color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Comments
                </Typography>
              </Box>

              <ViewButton
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/forum/posts/${post._id}`);
                }}
              >
                View Discussion
              </ViewButton>
            </Box>
          </CardActions>
        </PostCard>
      ))}
      
      {posts.length === 0 && (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to start a conversation
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PostList;
