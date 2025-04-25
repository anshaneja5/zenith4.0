import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Flag as FlagIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Forum as ForumIcon,
  Person as PersonIcon,
  VisibilityOff as VisibilityOffIcon,
  FormatQuote as FormatQuoteIcon,
  InsertLink as InsertLinkIcon,
  ContentCopy as ContentCopyIcon,
  Report as ReportIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Verified as VerifiedIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
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

const CommentCard = styled(Paper)(({ theme, isauthor }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, isauthor ? 0.2 : 0.1)}`,
  backgroundColor: isauthor ? alpha(theme.palette.primary.main, 0.03) : 'white',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  }
}));

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/forum/posts/${id}`);
      setPost(response.data);
      // Check if post is bookmarked by current user (this would be in your actual API)
      setIsBookmarked(response.data.bookmarks?.includes(user?._id) || false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load the post. It may have been removed or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/forum/posts/${id}/vote`, { voteType });
      fetchPost();
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to register your vote. Please try again.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    try {
      await api.post(`/forum/posts/${id}/comments`, {
        content: comment,
        isAnonymous: false,
        parentId: replyingTo
      });
      setComment('');
      setReplyingTo(null);
      fetchPost();
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to post your comment. Please try again.');
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/forum/comments/${commentId}/vote`, { voteType });
      fetchPost();
    } catch (error) {
      console.error('Error voting on comment:', error);
      setError('Failed to register your vote on this comment. Please try again.');
    }
  };

  const handleReply = (commentId, authorName) => {
    setReplyingTo(commentId);
    setComment(`@${authorName} `);
    // Scroll to comment box and focus it
    document.getElementById('comment-input').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('comment-input').focus();
  };

  const handleShareClick = (event) => {
    setShareMenuAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareMenuAnchorEl(null);
  };

  const handleMoreClick = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreMenuAnchorEl(null);
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // This would be your actual API call
      await api.post(`/forum/posts/${id}/bookmark`);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error bookmarking post:', error);
      setError('Failed to bookmark this post. Please try again.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    handleShareClose();
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000);
  };

  const handleReport = () => {
    // Implement report functionality
    handleMoreClose();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={30} />
        </Box>
        
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={80} />
            </Box>
          </Box>
          
          <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          
          <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
            <Skeleton variant="rounded" width={60} height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={70} height={24} />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Paper>
        
        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rounded" height={100} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
        
        {[1, 2].map((i) => (
          <Paper key={i} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
              <Box>
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={70} />
              </Box>
            </Box>
            
            <Skeleton variant="text" />
            <Skeleton variant="text" width="90%" />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={20} />
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} sx={{ ml: 'auto' }} />
            </Box>
          </Paper>
        ))}
      </Container>
    );
  }

  if (error && !post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          {error}
        </Alert>
        
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.error.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <InfoIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
          </Box>
          <Typography variant="h6" gutterBottom>
            Post Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The post you're looking for may have been removed or you might not have permission to view it.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/forum')}
            sx={{ borderRadius: 2 }}
          >
            Back to Forum
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
          Home
        </Link>
        <Link 
          to="/forum" 
          style={{ 
            textDecoration: 'none', 
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ForumIcon fontSize="small" sx={{ mr: 0.5 }} />
          Forum
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 500 }}>
          Post
        </Typography>
      </Breadcrumbs>
      
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
      
      {copySuccess && (
        <Alert 
          severity="success" 
          icon={<CheckIcon fontSize="inherit" />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
          onClose={() => setCopySuccess(false)}
        >
          Link copied to clipboard!
        </Alert>
      )}
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <Avatar 
            sx={{ 
              mr: 2,
              bgcolor: post.isAnonymous 
                ? alpha(theme.palette.text.secondary, 0.1) 
                : `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: post.isAnonymous ? theme.palette.text.secondary : 'white',
              width: 48,
              height: 48
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
          
          <Box>
            <IconButton onClick={handleMoreClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={moreMenuAnchorEl}
              open={Boolean(moreMenuAnchorEl)}
              onClose={handleMoreClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  mt: 1, 
                  borderRadius: 2,
                  minWidth: 180
                }
              }}
            >
              <MenuItem onClick={handleReport}>
                <ListItemIcon>
                  <FlagIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Report Post</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3,
            fontWeight: 700,
            color: theme.palette.text.primary
          }}
        >
          {post.title}
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3,
            lineHeight: 1.7,
            color: theme.palette.text.primary
          }}
        >
          {post.content}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {post.tags?.map((tag) => (
            <StyledChip 
              key={tag} 
              label={tag} 
              size="small"
              onClick={() => navigate(`/forum?tag=${tag}`)}
            />
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VoteButton
              size="small"
              onClick={() => handleVote('upvote')}
              active={post.upvotes?.includes(user?._id) ? 1 : 0}
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
              onClick={() => handleVote('downvote')}
              active={post.downvotes?.includes(user?._id) ? 1 : 0}
              votetype="downvote"
              aria-label="Downvote"
            >
              <ThumbDownIcon fontSize="small" />
            </VoteButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share">
              <IconButton 
                onClick={handleShareClick}
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={shareMenuAnchorEl}
              open={Boolean(shareMenuAnchorEl)}
              onClose={handleShareClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  mt: 1, 
                  borderRadius: 2,
                  minWidth: 180
                }
              }}
            >
              <MenuItem onClick={handleCopyLink}>
                <ListItemIcon>
                  <ContentCopyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy Link</ListItemText>
              </MenuItem>
            </Menu>
            
            <Tooltip title={isBookmarked ? "Remove Bookmark" : "Bookmark"}>
              <IconButton 
                onClick={handleBookmark}
                size="small"
                sx={{ 
                  bgcolor: isBookmarked 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600
          }}
        >
          <Badge 
            badgeContent={post.comments?.length || 0} 
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': {
                fontSize: 12,
                height: 20,
                minWidth: 20,
                borderRadius: 10
              }
            }}
          >
            <CommentIcon sx={{ mr: 1 }} />
          </Badge>
          Comments
        </Typography>

        {user ? (
          <Box sx={{ mb: 4 }}>
            <TextField
              id="comment-input"
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={replyingTo ? "Write your reply..." : "Add a comment..."}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {replyingTo && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setReplyingTo(null);
                    setComment('');
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel Reply
                </Button>
              )}
              
              <GradientButton
                variant="contained"
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  ml: replyingTo ? 'auto' : 0
                }}
              >
                {replyingTo ? 'Reply' : 'Comment'}
              </GradientButton>
            </Box>
          </Box>
        ) : (
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Sign in to join the conversation
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 2 }}
            >
              Sign In
            </Button>
          </Paper>
        )}

        {post.comments?.length === 0 ? (
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
              No comments yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share your thoughts
            </Typography>
          </Box>
        ) : (
          post.comments?.map((comment) => (
            <CommentCard 
              key={comment._id} 
              isauthor={comment.author?._id === post.author?._id ? 1 : 0}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    mr: 2,
                    bgcolor: comment.isAnonymous 
                      ? alpha(theme.palette.text.secondary, 0.1) 
                      : comment.author?._id === post.author?._id
                        ? `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        : alpha(theme.palette.primary.main, 0.1),
                    color: comment.isAnonymous 
                      ? theme.palette.text.secondary 
                      : comment.author?._id === post.author?._id
                        ? 'white'
                        : theme.palette.primary.main,
                    width: 36,
                    height: 36
                  }}
                >
                  {comment.isAnonymous 
                    ? <VisibilityOffIcon fontSize="small" /> 
                    : comment.author?.name?.[0] || 'A'}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        color: comment.author?._id === post.author?._id
                          ? theme.palette.primary.main
                          : theme.palette.text.primary
                      }}
                    >
                      {comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown'}
                    </Typography>
                    
                    {comment.author?._id === post.author?._id && (
                      <Chip
                        label="Author"
                        size="small"
                        sx={{ 
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          borderRadius: 4
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1,
                      mb: 2,
                      lineHeight: 1.6,
                      color: theme.palette.text.primary
                    }}
                  >
                    {comment.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VoteButton
                      size="small"
                      onClick={() => handleCommentVote(comment._id, 'upvote')}
                      active={comment.upvotes?.includes(user?._id) ? 1 : 0}
                      votetype="upvote"
                      aria-label="Upvote comment"
                    >
                      <ThumbUpIcon fontSize="small" />
                    </VoteButton>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        minWidth: 16,
                        textAlign: 'center'
                      }}
                    >
                      {comment.upvotes?.length - comment.downvotes?.length || 0}
                    </Typography>
                    
                    <VoteButton
                      size="small"
                      onClick={() => handleCommentVote(comment._id, 'downvote')}
                      active={comment.downvotes?.includes(user?._id) ? 1 : 0}
                      votetype="downvote"
                      aria-label="Downvote comment"
                    >
                      <ThumbDownIcon fontSize="small" />
                    </VoteButton>
                    
                    {user && (
                      <Tooltip title="Reply">
                        <IconButton
                          size="small"
                          onClick={() => handleReply(comment._id, comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown')}
                          sx={{ 
                            ml: 1,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }
                          }}
                        >
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            </CommentCard>
          ))
        )}
      </Box>
      
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
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PostDetail;
