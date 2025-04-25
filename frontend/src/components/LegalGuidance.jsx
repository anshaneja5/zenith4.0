import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert, 
  TextField, 
  Button, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  AccessTime as TimeIcon,
  Gavel as GavelIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Twitter as TwitterIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

// Error Boundary Component
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Markdown rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-600 font-medium">Error rendering content</div>;
    }
    return this.props.children;
  }
}

const renderMarkdown = (content) => {
  try {
    return (
      <MarkdownErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-300 pl-4 italic mb-4" {...props} />,
            code: ({ node, inline, ...props }) => inline ? 
              <code className="bg-gray-100 px-1 rounded font-mono text-sm" {...props} /> : 
              <code className="block bg-gray-100 p-3 rounded mb-4 overflow-x-auto font-mono text-sm" {...props} />,
            pre: ({ node, ...props }) => <pre className="bg-gray-100 p-3 rounded-lg mb-4 overflow-x-auto shadow-sm" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return <div className="text-red-600 font-medium">Error rendering content</div>;
  }
};

const LegalGuidance = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [twitterPosts, setTwitterPosts] = useState([]);
  const theme = useTheme();
  
  // Voice recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Text-to-speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Load available voices when component mounts
  const [availableVoices, setAvailableVoices] = useState([]);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' }
  ];

  // Map language codes to speech synthesis language codes
  const speechLanguages = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'mr': 'mr-IN'
  };

  // Language-specific placeholders
  const placeholdersByLanguage = {
    'en': 'Enter your question...',
    'hi': 'à¤…à¤ªà¤¨à¤¾ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚...',
    'bn': 'à¦†à¦ªà¦¨à¦¾à¦° à¦ªà§à¦°à¦¶à§à¦¨ à¦²à¦¿à¦–à§à¦¨...',
    'ta': 'à®‰à®™à¯à®•à®³à¯ à®•à¯‡à®³à¯à®µà®¿à®¯à¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯...',
    'te': 'à°®à±€ à°ªà±à°°à°¶à±à°¨à°¨à± à°¨à°®à±‹à°¦à± à°šà±‡à°¯à°‚à°¡à°¿...',
    'mr': 'à¤†à¤ªà¤²à¤¾ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤Ÿà¤¾à¤•à¤¾...'
  };

  // Initialize voices when available
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesisRef.current.getVoices();
      setAvailableVoices(voices);
    };

    // Load voices right away if already available
    loadVoices();

    // Chrome loads voices asynchronously, so we need this event
    if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (user && user._id) {
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages);
      setJurisdiction(currentSession.jurisdiction || '');
      setLanguage(currentSession.language || 'en');
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const fetchSessions = async () => {
    if (!user?._id) {
      setError(t('error.userNotAuthenticated'));
      return;
    }

    try {
      const response = await axios.get(`/api/legal/sessions?userId=${user._id}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(t('error.fetchingSessions'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !jurisdiction) return;
    if (!user?._id) {
      setError(t('error.userNotAuthenticated'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/legal/chat', {
        message: input,
        jurisdiction,
        language,
        sessionId: currentSession?._id,
        userId: user._id
      });

      // Store Twitter posts if they exist in the response
      if (response.data.twitterPosts && response.data.twitterPosts.length > 0) {
        setTwitterPosts(response.data.twitterPosts);
      } else {
        setTwitterPosts([]);
      }

      if (!currentSession) {
        // Create a new session
        const newSession = {
          _id: response.data.sessionId,
          title: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
          jurisdiction,
          language,
          messages: [
            { role: 'user', content: input },
            { role: 'assistant', content: response.data.response }
          ],
          createdAt: new Date().toISOString()
        };
        setCurrentSession(newSession);
        setSessions([newSession, ...sessions]);
      } else {
        // Update existing session
        const updatedSession = {
          ...currentSession,
          messages: [
            ...currentSession.messages,
            { role: 'user', content: input },
            { role: 'assistant', content: response.data.response }
          ]
        };
        setCurrentSession(updatedSession);
        setSessions(sessions.map(s => 
          s._id === updatedSession._id ? updatedSession : s
        ));
      }

      setInput('');
      
      // Scroll to bottom after message is added
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
      // Auto speak the response if enabled
      if (autoSpeak) {
        setTimeout(() => {
          speakText(response.data.response);
        }, 300);
      }
      
    } catch (error) {
      console.error('Error in chat:', error);
      setError(t('error.chatError'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    setInput('');
    setJurisdiction('');
    setTwitterPosts([]);
  };

  const handleSelectSession = async (sessionId) => {
    try {
      const response = await axios.get(`/api/legal/sessions/${sessionId}`);
      setCurrentSession(response.data);
      setTwitterPosts([]); // Clear Twitter posts when switching sessions
    } catch (error) {
      console.error('Error fetching session:', error);
      setError(t('error.fetchingSession'));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`/api/legal/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s._id !== sessionId));
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        setTwitterPosts([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError(t('error.deletingSession'));
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Voice recording functions
  const startRecording = async () => {
    setRecordingError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Using WebM format for better compatibility
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToServer(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const sendAudioToServer = async (audioBlob) => {
    try {
      setLoading(true);
      
      // Create form data to send audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      // Add the current language to the request
      formData.append('language', language);
      
      // Send to backend for speech-to-text processing
      const response = await axios.post('/api/legal/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Check for empty transcription
      if (response.data.text && response.data.text.trim()) {
        setInput(response.data.text);
      } else {
        console.error('Empty transcription received:', response.data);
        setRecordingError('Could not transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setRecordingError(`Speech recognition error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Text-to-speech functions
  const speakText = (text) => {
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Set language based on current language selection
    utterance.lang = speechLanguages[language] || 'en-US';
    
    // Set voice properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Add event listeners
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Find a suitable voice for the selected language
    if (availableVoices.length > 0) {
      const langCode = speechLanguages[language] || 'en-US';
      const langPrefix = langCode.split('-')[0]; // 'hi' from 'hi-IN'
      
      // Try to find a voice that matches the language
      let matchingVoice = availableVoices.find(voice => 
        voice.lang.startsWith(langPrefix) || 
        (langPrefix === 'hi' && voice.lang.includes('in-IN')) // Special case for Hindi
      );
      
      // If no exact match, try to find a voice for Indian English
      if (!matchingVoice && langPrefix !== 'en') {
        matchingVoice = availableVoices.find(voice => 
          voice.lang === 'en-IN' || voice.lang.includes('en-IN')
        );
      }
      
      // If still no match, use any English voice
      if (!matchingVoice && langPrefix !== 'en') {
        matchingVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en')
        );
      }
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }
    
    // Speak the text
    speechSynthesisRef.current.speak(utterance);
  };
  
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // If we're in a session, update it
    if (currentSession) {
      // This doesn't save to the backend, just updates the UI
      // The next message will save the updated language
      setCurrentSession({
        ...currentSession,
        language: newLanguage
      });
    }
  };

  // Get language-specific placeholder
  const getPlaceholder = () => {
    if (isRecording) {
      return placeholdersByLanguage[language] ? 'Listening...' : 'Listening...';
    }
    return placeholdersByLanguage[language] || 'Enter your question...';
  };

  // Render Twitter posts component
  const renderTwitterPosts = () => {
    if (!twitterPosts || twitterPosts.length === 0) return null;
    
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TwitterIcon sx={{ color: '#1DA1F2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Relevant Twitter Posts
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {twitterPosts.map((post, index) => (
          <Box 
            key={index}
            sx={{ 
              mb: index < twitterPosts.length - 1 ? 3 : 0,
              pb: index < twitterPosts.length - 1 ? 3 : 0,
              borderBottom: index < twitterPosts.length - 1 ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}` : 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                @{post.username}
              </Typography>
              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                {new Date(post.date).toLocaleDateString()}
              </Typography>
              <IconButton 
                size="small" 
                component="a" 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  ml: 'auto',
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  }
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={() => window.open(post.url, '_blank', 'noopener,noreferrer')}>
              {post.text}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  if (authLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: `linear-gradient(to right bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box 
        p={4} 
        sx={{
          background: `linear-gradient(to right bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            maxWidth: 500, 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <GavelIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Women's Legal Assistant
            </Typography>
          </Box>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              mb: 2
            }}
          >
            {t('error.userNotAuthenticated')}
          </Alert>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              mt: 2,
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: 2,
              py: 1.5
            }}
            href="/login"
          >
            Sign In to Continue
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <div className="flex h-screen" style={{ 
      background: `linear-gradient(to right bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})` 
    }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white shadow-md flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
        style={{ 
          borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          zIndex: 10 
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: alpha(theme.palette.primary.main, 0.1) }}>
          <div className="flex items-center mb-4">
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                width: 40,
                height: 40,
                mr: 2
              }}
            >
              <GavelIcon />
            </Avatar>
            <div>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                Women's Legal AI
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatDate(new Date().toISOString())}
              </Typography>
            </div>
          </div>
          
          <Button
            onClick={handleNewChat}
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-2px)',
              },
            }}
            startIcon={<AddIcon />}
          >
            {t('newChat')}
          </Button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-3">
          <Typography 
            variant="subtitle2" 
            sx={{ 
              textTransform: 'uppercase', 
              color: 'text.secondary', 
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: 0.5,
              mb: 1.5,
              ml: 1
            }}
          >
            Recent Conversations
          </Typography>
          
          <div className="space-y-2">
            {sessions.length === 0 && (
              <Box 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  fontSize: '0.875rem'
                }}
              >
                No conversations yet
              </Box>
            )}
            
            {sessions.map(session => (
              <Paper
                key={session._id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: currentSession?._id === session._id 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'white',
                  border: `1px solid ${currentSession?._id === session._id 
                    ? alpha(theme.palette.primary.main, 0.3)
                    : alpha(theme.palette.primary.main, 0.05)}`,
                  '&:hover': {
                    bgcolor: currentSession?._id === session._id 
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => handleSelectSession(session._id)}
                    className="flex-1 truncate"
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: currentSession?._id === session._id 
                          ? 'primary.main'
                          : 'text.primary',
                        mb: 0.5,
                        lineHeight: 1.3
                      }}
                    >
                      {session.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      <Chip
                        icon={<LocationIcon sx={{ fontSize: '0.75rem !important' }} />}
                        label={session.jurisdiction}
                        size="small"
                        sx={{ 
                          height: 20,
                          '& .MuiChip-label': { px: 1, fontSize: '0.65rem' },
                          '& .MuiChip-icon': { ml: 0.5 },
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark
                        }}
                      />
                      
                      <Chip
                        icon={<LanguageIcon sx={{ fontSize: '0.75rem !important' }} />}
                        label={languages.find(l => l.code === session.language)?.name || session.language}
                        size="small"
                        sx={{ 
                          height: 20,
                          '& .MuiChip-label': { px: 1, fontSize: '0.65rem' },
                          '& .MuiChip-icon': { ml: 0.5 },
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.dark
                        }}
                      />
                    </Box>
                  </div>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSession(session._id)}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' },
                      p: 0.5,
                      ml: 1
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </Paper>
            ))}
          </div>
        </div>
        
        <div className="p-3 border-t" style={{ borderColor: alpha(theme.palette.primary.main, 0.1) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 600,
                mr: 1.5
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {user.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile sidebar toggle */}
        <IconButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ 
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 20,
            bgcolor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: { xs: 'flex', md: 'none' }
          }}
        >
          {sidebarOpen ? <ArrowBackIcon /> : <ChatIcon />}
        </IconButton>
        
        {/* Chat header */}
        <Paper 
          elevation={0} 
          sx={{ 
            px: 3, 
            py: 2, 
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                <GavelIcon />
              </Avatar>
              
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                  {currentSession ? currentSession.title : 'New Conversation'}
                </Typography>
                
                {currentSession && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <LocationIcon sx={{ color: 'text.secondary', fontSize: '0.875rem', mr: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {currentSession.jurisdiction}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LanguageIcon sx={{ color: 'text.secondary', fontSize: '0.875rem', mr: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {languages.find(l => l.code === currentSession.language)?.name || currentSession.language}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Auto-speak toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSpeak}
                    onChange={toggleAutoSpeak}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                    <VolumeUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Auto-speak
                  </Typography>
                }
                sx={{ mr: 1 }}
              />
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
        
        {/* Messages */}
        <div 
          id="chat-messages"
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ 
            background: `linear-gradient(to right bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})` 
          }}
        >
          {messages.length === 0 && !loading && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                textAlign: 'center',
                p: 3
              }}
            >
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mb: 3,
                  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                <GavelIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}>
                Women's Legal Assistant
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 500 }}>
                Your confidential AI legal assistant, designed to provide guidance on women's legal rights and issues.
              </Typography>
              
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  maxWidth: 500,
                  bgcolor: 'white',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  How to get started:
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      mr: 2,
                      mt: 0.5
                    }}
                  >
                    1
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    Enter your location in the jurisdiction field below
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      mr: 2,
                      mt: 0.5
                    }}
                  >
                    2
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    Select your preferred language from the dropdown
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      mr: 2,
                      mt: 0.5
                    }}
                  >
                    3
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    Type your question or use the microphone to speak
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-6 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 36,
                    height: 36,
                    mr: 1.5,
                    mt: 1
                  }}
                >
                  <GavelIcon fontSize="small" />
                </Avatar>
              )}
              
              <div
                className={`max-w-3xl rounded-2xl shadow-sm p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-800'
                }`}
                style={{
                  borderTopRightRadius: message.role === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: message.role === 'assistant' ? '4px' : '16px',
                  position: 'relative'
                }}
              >
                {message.role === 'assistant' && (
                  <IconButton
                    size="small"
                    onClick={() => message.role === 'assistant' && speakText(message.content)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                      width: 28,
                      height: 28,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <VolumeUpIcon fontSize="small" />
                  </IconButton>
                )}
                
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">{renderMarkdown(message.content)}</div>
                ) : (
                  <div>{message.content}</div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    width: 36,
                    height: 36,
                    ml: 1.5,
                    mt: 1
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Render Twitter posts after the last message */}
          {messages.length > 0 && twitterPosts.length > 0 && renderTwitterPosts()}
          
          {loading && (
            <div className="flex justify-center my-6">
              <div className="flex flex-col items-center">
                <CircularProgress 
                  size={40} 
                  thickness={4} 
                  sx={{ 
                    color: theme.palette.primary.main,
                    mb: 2
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {isRecording ? 'Processing your speech...' : 'Researching legal information...'}
                </Typography>
              </div>
            </div>
          )}
          
          {isSpeaking && (
            <div className="fixed bottom-24 right-8">
              <Paper
                elevation={3}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main,
                      mr: 1.5,
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(103, 58, 183, 0.4)'
                        },
                        '70%': {
                          boxShadow: '0 0 0 10px rgba(103, 58, 183, 0)'
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(103, 58, 183, 0)'
                        }
                      }
                    }}
                  >
                    <VolumeUpIcon />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mr: 2 }}>
                    Speaking in {languages.find(l => l.code === language)?.name || 'English'}...
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={stopSpeaking}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.2),
                      },
                    }}
                  >
                    <VolumeOffIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </div>
          )}
          
          {(error || recordingError) && (
            <Alert 
              severity="error" 
              variant="outlined"
              sx={{ 
                mb: 4,
                borderRadius: 2,
                borderColor: theme.palette.error.light
              }}
              onClose={() => {
                setError('');
                setRecordingError('');
              }}
            >
              {error || recordingError}
            </Alert>
          )}
        </div>

        {/* Input form */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 0
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="jurisdiction"
                  label="Jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder={t('enterJurisdiction')}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                    sx: { borderRadius: 2 }
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    labelId="language-label"
                    id="language"
                    value={language}
                    onChange={handleLanguageChange}
                    label="Language"
                    startAdornment={<LanguageIcon color="action" sx={{ ml: 1, mr: 1 }} />}
                    sx={{ borderRadius: 2 }}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          <form onSubmit={handleSubmit} className="flex items-center">
            <TextField
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              variant="outlined"
              disabled={loading || !jurisdiction || isRecording}
              multiline
              maxRows={4}
              InputProps={{
                sx: { 
                  borderRadius: '12px',
                  pr: 1,
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
              sx={{ mr: 1 }}
            />
            
            {/* Voice recording button */}
            <IconButton
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading || !jurisdiction}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                mr: 1,
                bgcolor: isRecording ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                color: isRecording ? theme.palette.error.main : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: isRecording ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.primary.main, 0.2),
                },
                '&.Mui-disabled': {
                  bgcolor: alpha(theme.palette.action.disabled, 0.1),
                  color: alpha(theme.palette.action.disabled, 0.5)
                },
                animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                  }
                }
              }}
            >
              {isRecording ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            
            <Button
              type="submit"
              disabled={loading || !jurisdiction || !input.trim() || isRecording}
              sx={{
                minWidth: 56,
                height: 56,
                borderRadius: '12px',
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
                '&.Mui-disabled': {
                  background: alpha(theme.palette.primary.main, 0.2),
                  color: alpha('#ffffff', 0.5)
                }
              }}
            >
              {loading && !isRecording ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                <SendIcon />
              )}
            </Button>
          </form>
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 2, 
              color: 'text.secondary',
              px: 2
            }}
          >
            Last updated: April 26, 2025 at 1:31 AM IST. This AI assistant provides general legal information, not legal advice.
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

export default LegalGuidance;