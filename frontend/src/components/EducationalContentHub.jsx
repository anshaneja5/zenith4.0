import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  alpha
} from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Help as HelpIcon,
  MenuBook as GuideIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Gavel as LegalIcon,
  School as EducationIcon,
  Accessibility as AccessibilityIcon,
  EmojiObjects as InsightIcon,
  MenuBook 
} from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

// Custom styled components
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(to right bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

const ResourceCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

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

const EducationalContentHub = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [situation, setSituation] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contentLinks, setContentLinks] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!situation.trim()) {
      setError('Please describe your situation');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setContentLinks([]);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/educational-content/content-links`, {
        params: {
          situation,
          jurisdiction,
          language
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setContentLinks(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'article':
        return <ArticleIcon />;
      case 'video':
        return <VideoIcon />;
      case 'guide':
        return <GuideIcon />;
      case 'faq':
        return <HelpIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'article':
        return theme.palette.primary.main;
      case 'video':
        return theme.palette.error.main;
      case 'guide':
        return theme.palette.success.main;
      case 'faq':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    bn: 'Bengali',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi'
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box sx={{ 
          display: 'inline-flex', 
          p: 2, 
          borderRadius: '50%', 
          background: `linear-gradient(to right bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          mb: 2
        }}>
          <EducationIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Women's Legal Education Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Access inclusive resources designed to empower women with legal knowledge and rights awareness
        </Typography>
      </Box>

      <GradientPaper sx={{ p: { xs: 3, md: 4 }, mb: 5 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                <InsightIcon sx={{ mr: 1, fontSize: 20 }} />
                Tell us about your situation
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe your legal concern"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Example: I'm experiencing workplace harassment and need to understand my rights and options..."
                required
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
                helperText="Your information is confidential and helps us find resources tailored to your needs"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                Location helps us find relevant laws for your jurisdiction
              </Typography>
              <TextField
                fullWidth
                label="Your Location (State/City)"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="Example: Delhi, New Delhi"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
                Choose your preferred language for resources
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                  sx={{ borderRadius: 2 }}
                >
                  {Object.entries(languageNames).map(([code, name]) => (
                    <MenuItem key={code} value={code}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <GradientButton
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2 }}
                startIcon={loading ? undefined : <SearchIcon />}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Resources'}
              </GradientButton>
            </Grid>
          </Grid>
        </form>
      </GradientPaper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {contentLinks.length > 0 && (
        <GradientPaper sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <MenuBook sx={{ mr: 1 }} />
              Recommended Resources
            </Typography>
            <Chip 
              label={`${contentLinks.length} resources found`} 
              size="small" 
              sx={{ 
                borderRadius: 4,
                background: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.dark,
                fontWeight: 500
              }}
            />
          </Box>
          
          <Grid container spacing={3}>
            {contentLinks.map((item, index) => (
              <Grid item xs={12} key={index}>
                <ResourceCard
                  component="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      bgcolor: alpha(getIconColor(item.type), 0.1),
                      minWidth: isMobile ? '100%' : '120px',
                      minHeight: isMobile ? '100px' : '100%',
                      flexDirection: isMobile ? 'row' : 'column'
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: getIconColor(item.type),
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 12px ${alpha(getIconColor(item.type), 0.3)}`
                      }}
                    >
                      {getIcon(item.type)}
                    </Avatar>
                    {!isMobile && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mt: 2, 
                          textTransform: 'uppercase', 
                          fontWeight: 600,
                          color: getIconColor(item.type)
                        }}
                      >
                        {item.type}
                      </Typography>
                    )}
                  </Box>
                  
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.dark,
                        fontWeight: 600,
                        lineHeight: 1.3
                      }}
                    >
                      {item.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{ lineHeight: 1.6 }}
                    >
                      {item.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {isMobile && (
                        <Chip 
                          size="small" 
                          label={item.type}
                          sx={{ 
                            borderRadius: 4,
                            background: alpha(getIconColor(item.type), 0.1),
                            color: getIconColor(item.type),
                            fontWeight: 500
                          }}
                        />
                      )}
                      
                      <Chip 
                        size="small" 
                        label={item.category} 
                        sx={{ 
                          borderRadius: 4,
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark,
                          fontWeight: 500
                        }}
                      />
                      
                      <Chip 
                        size="small" 
                        label={languageNames[item.language] || item.language} 
                        icon={<LanguageIcon fontSize="small" />}
                        sx={{ 
                          borderRadius: 4,
                          background: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.dark,
                          fontWeight: 500
                        }}
                      />
                      
                      {item.jurisdiction && (
                        <Chip 
                          size="small" 
                          label={item.jurisdiction}
                          icon={<LocationIcon fontSize="small" />}
                          sx={{ 
                            borderRadius: 4,
                            background: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.dark,
                            fontWeight: 500
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </ResourceCard>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Resources are designed to be inclusive and accessible for all women, regardless of background or ability
            </Typography>
          </Box>
        </GradientPaper>
      )}
      
      {!loading && contentLinks.length === 0 && !error && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4,
            borderRadius: 3,
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
            <SearchIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          </Box>
          <Typography variant="h6" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
            Enter your situation to find resources
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            We'll help you find articles, videos, guides, and FAQs relevant to your legal concerns. 
            All resources are curated to support women's legal rights and empowerment.
          </Typography>
        </Box>
      )}
      
      {/* Supportive footer message */}
      <Box sx={{ 
        mt: 6, 
        textAlign: 'center',
        p: 3,
        borderRadius: 3,
        background: alpha(theme.palette.primary.light, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Typography variant="subtitle1" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
          Knowledge is Power
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Our resources are designed with inclusivity in mind, ensuring that all women have access to legal information
          that respects diverse perspectives and needs. Last updated: April 24, 2025 at 2:37 AM IST.
        </Typography>
      </Box>
    </Container>
  );
};

export default EducationalContentHub;
