import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
  Autocomplete,
  Typography,
  IconButton,
  useTheme,
  alpha,
  InputAdornment,
  Tooltip,
  Divider,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Tag as TagIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  Add as AddIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatQuote as FormatQuoteIcon,
  InsertLink as InsertLinkIcon
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
  },
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    }
  }
}));

const TextFormatButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  padding: 8,
  borderRadius: 4,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }
}));

const suggestedTags = [
  'Workplace Harassment', 
  'Domestic Violence', 
  'Equal Pay', 
  'Maternity Rights', 
  'Sexual Harassment',
  'Gender Discrimination', 
  'Divorce', 
  'Child Custody', 
  'Alimony', 
  'Property Rights',
  'Legal Aid', 
  'Women Empowerment', 
  'Safety', 
  'Education Rights', 
  'Healthcare'
];

const CreatePostDialog = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formatButtons, setFormatButtons] = useState({
    bold: false,
    italic: false,
    bulletList: false,
    numberedList: false,
    quote: false,
    link: false
  });

  const handleSubmit = () => {
    onSubmit({
      title,
      content,
      isAnonymous,
      tags
    });
    // Reset form
    setTitle('');
    setContent('');
    setIsAnonymous(false);
    setTags([]);
  };

  const handleTagAdd = (event) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
      event.preventDefault(); // Prevent form submission
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const toggleFormat = (format) => {
    setFormatButtons({
      ...formatButtons,
      [format]: !formatButtons[format]
    });
  };

  const handleTagSelection = (event, newValue) => {
    setTags(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          Share Your Experience
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Your voice matters. Share your story, ask questions, or seek advice from our supportive community.
          </Typography>
          
          <TextField
            autoFocus
            label="Title"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="What's on your mind?"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <TextFormatButton 
                size="small" 
                onClick={() => toggleFormat('bold')}
                active={formatButtons.bold ? 1 : 0}
                aria-label="Bold"
              >
                <FormatBoldIcon fontSize="small" />
              </TextFormatButton>
              
              <TextFormatButton 
                size="small" 
                onClick={() => toggleFormat('italic')}
                active={formatButtons.italic ? 1 : 0}
                aria-label="Italic"
              >
                <FormatItalicIcon fontSize="small" />
              </TextFormatButton>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
              <TextFormatButton 
                size="small" 
                onClick={() => toggleFormat('bulletList')}
                active={formatButtons.bulletList ? 1 : 0}
                aria-label="Bullet List"
              >
                <FormatListBulletedIcon fontSize="small" />
              </TextFormatButton>
              
              <TextFormatButton 
                size="small" 
                onClick={() => toggleFormat('numberedList')}
                active={formatButtons.numberedList ? 1 : 0}
                aria-label="Numbered List"
              >
                <FormatListNumberedIcon fontSize="small" />
              </TextFormatButton>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
              <TextFormatButton 
                size="small" 
                onClick={() => toggleFormat('quote')}
                active={formatButtons.quote ? 1 : 0}
                aria-label="Quote"
              >
                <FormatQuoteIcon fontSize="small" />
              </TextFormatButton>
              
              <TextFormatButton 
                size="small" 
                onClick={() => toggleFormat('link')}
                active={formatButtons.link ? 1 : 0}
                aria-label="Link"
              >
                <InsertLinkIcon fontSize="small" />
              </TextFormatButton>
            </Box>
            
            <TextField
              label="Share your story"
              type="text"
              fullWidth
              multiline
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your situation, question, or experience in detail. The more information you provide, the better advice you'll receive."
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
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: isAnonymous ? alpha(theme.palette.text.secondary, 0.1) : alpha(theme.palette.primary.main, 0.1),
                color: isAnonymous ? theme.palette.text.secondary : theme.palette.primary.main,
                mr: 2
              }}
            >
              {isAnonymous ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Post anonymously
                  </Typography>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                Your identity will be hidden from other community members
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <TagIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
              Add relevant tags
            </Typography>
            
            <Autocomplete
              multiple
              id="tags-input"
              options={suggestedTags.filter(option => !tags.includes(option))}
              value={tags}
              onChange={handleTagSelection}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <StyledChip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Add tags to help others find your post"
                  InputProps={{
                    ...params.InputProps,
                    sx: { borderRadius: 2 }
                  }}
                  onKeyDown={handleTagAdd}
                  onChange={(e) => setTagInput(e.target.value)}
                />
              )}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                Suggested tags:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedTags.slice(0, 5).map((tag) => (
                  !tags.includes(tag) && (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => setTags([...tags, tag])}
                      sx={{ 
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.secondary.main, 0.2),
                        }
                      }}
                      icon={<AddIcon fontSize="small" />}
                    />
                  )
                ))}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <InfoIcon sx={{ color: theme.palette.info.main, mr: 1.5, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Your post will be reviewed by our community moderators to ensure it adheres to our community guidelines. 
              Please be respectful and supportive of others in our community.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          Cancel
        </Button>
        
        <GradientButton
          onClick={handleSubmit}
          disabled={!title || !content}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Share Post
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
