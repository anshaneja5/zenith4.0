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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
  alpha
} from '@mui/material';
import {
  AccountBalance as NGOIcon,
  Gavel as LegalAidIcon,
  Psychology as CounselingIcon,
  Support as SupportIcon,
  Person as LawyerIcon,
  LocalHospital as ClinicIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Home as AddressIcon,
  Search as SearchIcon,
  StarBorder as StarIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Gavel // Add this import for the Gavel icon
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

const ResourceListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
    transform: 'translateY(-2px)',
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

const LegalResourcesHub = () => {
  const [situation, setSituation] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [language, setLanguage] = useState('en');
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [referralLetter, setReferralLetter] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const serviceTypes = [
    { value: 'counseling', label: 'Counseling', icon: <CounselingIcon fontSize="small" /> },
    { value: 'legal_aid', label: 'Legal Aid', icon: <LegalAidIcon fontSize="small" /> },
    { value: 'support', label: 'Support Services', icon: <SupportIcon fontSize="small" /> },
    { value: 'ngo', label: 'NGO Assistance', icon: <NGOIcon fontSize="small" /> },
    { value: 'legal_clinic', label: 'Legal Clinic', icon: <ClinicIcon fontSize="small" /> }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'NGO':
        return <NGOIcon color="primary" />;
      case 'Legal Aid':
        return <LegalAidIcon color="primary" />;
      case 'Counseling':
        return <CounselingIcon color="primary" />;
      case 'Support Service':
        return <SupportIcon color="primary" />;
      case 'Lawyer':
        return <LawyerIcon color="primary" />;
      case 'Legal Clinic':
        return <ClinicIcon color="primary" />;
      default:
        return <NGOIcon color="primary" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!situation.trim() || !jurisdiction.trim()) {
      setError('Please describe your situation and provide your location');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResources([]);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/legal-resources/match`, {
        params: {
          situation,
          jurisdiction,
          language,
          needs: needs.join(',')
        }
      });

      setResources(response.data.resources);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to find resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReferral = async (resource) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/legal-resources/referral`, {
        userId: 'current-user',
        resourceId: resource._id || resource.id,
        situation
      });

      setReferralLetter(response.data.letter);
      setSelectedResource(resource);
      setReferralDialogOpen(true);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to generate referral letter.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReferralLetter = () => {
    const blob = new Blob([referralLetter], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-letter-${selectedResource?.name || 'resource'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setReferralDialogOpen(false);
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
          <Gavel sx={{ fontSize: 40, color: 'white' }} />
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
          Women's Legal Resources Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Find support, legal aid, and resources tailored to your specific situation
        </Typography>
      </Box>

      <GradientPaper sx={{ p: { xs: 3, md: 4 }, mb: 5 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Tell us about your situation
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe your situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Example: I'm experiencing workplace harassment and need legal assistance..."
                required
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
                helperText="Your information is confidential and helps us find the most relevant resources"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Location (State/City)"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="Example: Maharashtra, Mumbai"
                required
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Preferred Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Preferred Language"
                  sx={{ borderRadius: 2 }}
                  startAdornment={<LanguageIcon color="action" sx={{ ml: 1, mr: 1 }} />}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="bn">Bengali</MenuItem>
                  <MenuItem value="ta">Tamil</MenuItem>
                  <MenuItem value="te">Telugu</MenuItem>
                  <MenuItem value="mr">Marathi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Required Services</InputLabel>
                <Select
                  multiple
                  value={needs}
                  onChange={(e) => setNeeds(e.target.value)}
                  label="Required Services"
                  sx={{ borderRadius: 2 }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const service = serviceTypes.find(st => st.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={service?.label} 
                            icon={service?.icon}
                            sx={{ 
                              borderRadius: 4,
                              background: `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.secondary.light, 0.2)})`,
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {serviceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {React.cloneElement(type.icon, { sx: { mr: 1 } })}
                        {type.label}
                      </Box>
                    </MenuItem>
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

      {resources.length > 0 && (
        <GradientPaper sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <StarIcon sx={{ mr: 1 }} />
              Recommended Resources
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {resources.length} matches found
            </Typography>
          </Box>
          
          <List sx={{ p: 0 }}>
            {resources.map((resource, index) => (
              <ResourceListItem key={index} alignItems="flex-start">
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: '100%',
                  p: 2
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    pr: { xs: 0, sm: 2 },
                    pb: { xs: 2, sm: 0 },
                    borderRight: { xs: 'none', sm: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` },
                    borderBottom: { xs: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, sm: 'none' },
                    minWidth: { xs: '100%', sm: '70%' }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: 'auto',
                      mr: 2,
                      mt: 0.5,
                      '& .MuiSvgIcon-root': {
                        fontSize: 28
                      }
                    }}>
                      {getIcon(resource.type)}
                    </ListItemIcon>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.dark,
                            mr: 1
                          }}
                        >
                          {resource.name}
                        </Typography>
                        
                        <Rating 
                          value={resource.rating || 3} 
                          readOnly 
                          size="small"
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: theme.palette.secondary.main,
                            },
                          }}
                        />
                        
                        {resource.isProBono && (
                          <Chip 
                            label="Pro Bono" 
                            size="small" 
                            sx={{ 
                              ml: 1,
                              background: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.dark,
                              fontWeight: 600,
                              borderRadius: 4
                            }} 
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.primary" 
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.6
                        }}
                      >
                        {resource.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Chip
                          icon={<LocationIcon fontSize="small" />}
                          label={resource.jurisdiction}
                          size="small"
                          sx={{ 
                            borderRadius: 4,
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.dark
                          }}
                        />
                        
                        {resource.languages && resource.languages.map((lang) => (
                          <Chip
                            key={lang}
                            icon={<LanguageIcon fontSize="small" />}
                            label={lang}
                            size="small"
                            sx={{ 
                              borderRadius: 4,
                              background: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.dark
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    pl: { xs: 0, sm: 2 },
                    pt: { xs: 2, sm: 0 },
                    minWidth: { xs: '100%', sm: '30%' }
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {resource.contact?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{resource.contact.phone}</Typography>
                        </Box>
                      )}
                      
                      {resource.contact?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {resource.contact.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {resource.contact?.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <WebsiteIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography 
                            variant="body2" 
                            component="a" 
                            href={resource.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            Visit Website
                          </Typography>
                        </Box>
                      )}
                      
                      {resource.contact?.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <AddressIcon fontSize="small" color="action" sx={{ mr: 1, mt: 0.3 }} />
                          <Typography variant="body2">{resource.contact.address}</Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {resource._id && (
                      <GradientButton
                        variant="contained"
                        onClick={() => handleGenerateReferral(resource)}
                        disabled={loading}
                        size="small"
                        sx={{ 
                          mt: 'auto',
                          borderRadius: 2,
                          alignSelf: 'flex-start'
                        }}
                      >
                        Get Referral
                      </GradientButton>
                    )}
                  </Box>
                </Box>
              </ResourceListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              Last updated: April 24, 2025 at 2:22 AM
            </Typography>
          </Box>
        </GradientPaper>
      )}

      <Dialog
        open={referralDialogOpen}
        onClose={() => setReferralDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LegalAidIcon sx={{ mr: 1 }} />
            Referral Letter
          </Box>
          <IconButton 
            onClick={() => setReferralDialogOpen(false)}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.primary.light, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 2,
              mb: 3
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2, lineHeight: 1.8 }}>
              {referralLetter}
            </Typography>
          </Paper>
          
          {selectedResource && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center'
              }}>
                <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                Resource Contact Information:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedResource.contact?.phone && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <PhoneIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body2">{selectedResource.contact.phone}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {selectedResource.contact?.email && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <EmailIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2">{selectedResource.contact.email}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {selectedResource.contact?.website && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <WebsiteIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Website</Typography>
                        <Typography 
                          variant="body2" 
                          component="a"
                          href={selectedResource.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Visit Website
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {selectedResource.contact?.address && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <AddressIcon color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography variant="body2">{selectedResource.contact.address}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="text.secondary">
              This referral letter is valid as of {new Date().toLocaleDateString()}. Please contact the resource directly to confirm their availability.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setReferralDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          <GradientButton
            onClick={downloadReferralLetter}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2 }}
          >
            Download Letter
          </GradientButton>
        </DialogActions>
      </Dialog>
      
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
          You Are Not Alone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Every woman deserves access to justice and support. Our platform connects you with trusted legal resources
          that understand your unique challenges. Your privacy and security are our top priorities.
        </Typography>
      </Box>
    </Container>
  );
};

export default LegalResourcesHub;