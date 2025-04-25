import React, { useState, useEffect, useRef } from 'react';
import '../styles/editor.css';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Description as DocumentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AutoFixHigh as AutoFixHighIcon,
  Add as AddIcon,
  Gavel as GavelIcon,
  Mail as MailIcon,
  Assignment as AssignmentIcon,
  FileCopy as FileCopyIcon,
  LibraryBooks as LibraryBooksIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { Document, Page, Text, StyleSheet, pdf, View } from '@react-pdf/renderer';
import { styled } from '@mui/material/styles';

// PDF Styles remain the same
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  metadata: {
    marginBottom: 15,
    borderBottom: '1pt solid #000',
    paddingBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  metadataLabel: {
    width: '30%',
    fontWeight: 'bold',
  },
  metadataValue: {
    width: '70%',
  },
  content: {
    marginTop: 12,
    lineHeight: 1.2,
  },
  paragraph: {
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecoration: 'underline',
  },
  header1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 8,
  },
  header2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 7,
  },
  header3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 6,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 5,
  },
  bulletPoint: {
    width: 10,
  },
  listContent: {
    flex: 1,
  },
  review: {
    marginTop: 20,
    padding: 10,
    border: '1pt solid #000',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewSection: {
    marginBottom: 10,
  },
  reviewScore: {
    fontWeight: 'bold',
  }
});

// MyDocument component remains the same
const MyDocument = ({ doc }) => {
  // Convert HTML to PDF-compatible format
  const parseHtmlForPdf = (html) => {
    if (!html) return [<Text key="empty"></Text>];
    
    // Use a proper HTML parser
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Function to recursively convert DOM nodes to React-PDF components
    const convertNodeToPdf = (node, index = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const childElements = Array.from(node.childNodes).map((child, idx) => 
          convertNodeToPdf(child, idx)
        );
        
        switch (node.nodeName.toLowerCase()) {
          case 'p':
            return <Text key={index} style={styles.paragraph}>{childElements}</Text>;
          case 'strong':
          case 'b':
            return <Text key={index} style={styles.bold}>{childElements}</Text>;
          case 'em':
          case 'i':
            return <Text key={index} style={styles.italic}>{childElements}</Text>;
          case 'u':
            return <Text key={index} style={styles.underline}>{childElements}</Text>;
          case 'h1':
            return <Text key={index} style={styles.header1}>{childElements}</Text>;
          case 'h2':
            return <Text key={index} style={styles.header2}>{childElements}</Text>;
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return <Text key={index} style={styles.header3}>{childElements}</Text>;
          case 'ul':
            return childElements;
          case 'ol':
            return childElements;
          case 'li':
            return (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>• </Text>
                <Text style={styles.listContent}>{childElements}</Text>
              </View>
            );
          case 'br':
            return <Text key={index}>{'\n'}</Text>;
          case 'div':
          case 'span':
          default:
            return <Text key={index}>{childElements}</Text>;
        }
      }
      
      return null;
    };
    
    // Convert all top-level nodes
    const components = Array.from(tmp.childNodes).map((node, index) => 
      convertNodeToPdf(node, index)
    );
    
    return components.length > 0 ? components : [<Text key="default">No content</Text>];
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* <Text style={styles.title}>{doc.title}</Text> */}
        
        {/* <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Type:</Text>
            <Text style={styles.metadataValue}>{doc.type}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Jurisdiction:</Text>
            <Text style={styles.metadataValue}>{doc.metadata.jurisdiction}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Date:</Text>
            <Text style={styles.metadataValue}>{new Date(doc.createdAt).toLocaleDateString()}</Text>
          </View>
          {doc.metadata.caseNumber && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Case Number:</Text>
              <Text style={styles.metadataValue}>{doc.metadata.caseNumber}</Text>
            </View>
          )}
          {doc.metadata.recipient && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Recipient:</Text>
              <Text style={styles.metadataValue}>{doc.metadata.recipient}</Text>
            </View>
          )}
          {doc.metadata.relatedParties?.length > 0 && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Related Parties:</Text>
              <Text style={styles.metadataValue}>{doc.metadata.relatedParties.join(', ')}</Text>
            </View>
          )}
        </View> */}
        
        <View style={styles.content}>
          {parseHtmlForPdf(doc.content)}
        </View>

        {doc.review && (
          <View style={styles.review}>
            <Text style={styles.reviewTitle}>Review Scores</Text>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewScore}>Completeness: {doc.review.completeness.score}/10</Text>
              <Text>{doc.review.completeness.feedback}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewScore}>Clarity: {doc.review.clarity.score}/10</Text>
              <Text>{doc.review.clarity.feedback}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewScore}>Risk: {doc.review.risk.score}/10</Text>
              <Text>{doc.review.risk.feedback}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

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

const DocumentCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 12,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

const DocumentTypeChip = styled(Chip)(({ theme, doctype }) => {
  let color;
  switch (doctype) {
    case 'complaint':
      color = theme.palette.error.main;
      break;
    case 'legal_letter':
      color = theme.palette.primary.main;
      break;
    case 'affidavit':
      color = theme.palette.success.main;
      break;
    default:
      color = theme.palette.secondary.main;
  }
  
  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 600,
    borderRadius: 16,
    '& .MuiChip-label': {
      padding: '0 12px',
    }
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'draft':
      color = theme.palette.info.main;
      break;
    case 'reviewed':
      color = theme.palette.success.main;
      break;
    case 'final':
      color = theme.palette.primary.main;
      break;
    default:
      color = theme.palette.warning.main;
  }
  
  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 600,
    borderRadius: 16,
    '& .MuiChip-label': {
      padding: '0 12px',
    }
  };
});

const DocumentHub = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewMode, setPreviewMode] = useState('edit');
  const quillRef = useRef(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    details: '',
    metadata: {
      jurisdiction: '',
      recipient: '',
      caseNumber: '',
      relatedParties: []
    }
  });
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image',
    'color', 'background'
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/documents');
      setDocuments(response.data.documents);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/documents/generate', formData);
      setDocuments([response.data.document, ...documents]);
      setDialogOpen(false);
      setFormData({
        type: '',
        title: '',
        details: '',
        metadata: {
          jurisdiction: '',
          recipient: '',
          caseNumber: '',
          relatedParties: []
        }
      });
    } catch (err) {
      setError('Failed to generate document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (documentId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/documents/${documentId}/review`);
      setDocuments(documents.map(doc => 
        doc._id === documentId ? response.data.document : doc
      ));
    } catch (err) {
      setError('Failed to review document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setEditorContent(doc.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put(`/documents/${selectedDocument._id}`, {
        content: editorContent,
        status: 'draft'
      });
      
      setDocuments(documents.map(doc => 
        doc._id === selectedDocument._id ? response.data.document : doc
      ));
      
      setEditDialogOpen(false);
      setSelectedDocument(null);
      setEditorContent('');
    } catch (err) {
      setError('Failed to update document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelection = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        setSelectedText(quill.getText(selection.index, selection.length));
      }
    }
  };

  const handleAIModify = async () => {
    try {
      // First, ensure we have the current selection
      if (!selectedText || selectedText.trim() === '') {
        // If no text is currently selected, check if we can get it directly
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          const selection = quill.getSelection();
          if (selection && selection.length > 0) {
            setSelectedText(quill.getText(selection.index, selection.length));
          } else {
            setError("Please select text to modify first");
            return;
          }
        } else {
          setError("Please select text to modify first");
          return;
        }
      }

      setLoading(true);
      console.log("Sending AI modify request with text:", selectedText, "and prompt:", aiPrompt);
      
      // Get the editor and its current selection BEFORE the async operation
      let savedEditor = null;
      let savedSelection = null;
      
      if (quillRef.current) {
        savedEditor = quillRef.current.getEditor();
        savedSelection = savedEditor.getSelection();
        
        // If there's no active selection, try to find the text in the content
        if (!savedSelection || savedSelection.length === 0) {
          const content = savedEditor.getText();
          const position = content.indexOf(selectedText);
          
          if (position !== -1) {
            // If the text is found, create a selection for it
            savedSelection = { index: position, length: selectedText.length };
            console.log("Created selection based on text search:", savedSelection);
          }
        }
        
        console.log("Saved selection before API call:", savedSelection);
      }
      
      const response = await axios.post('/documents/ai-modify', {
        text: selectedText,
        prompt: aiPrompt
      });
      
      console.log("Received AI response:", response.data);
      
      // Use the saved selection or find the text in the document
      if (savedEditor) {
        if (savedSelection && savedSelection.length > 0) {
          const position = savedSelection.index;
          const selectionLength = savedSelection.length;
          const modifiedText = response.data.modifiedText;
          
          console.log("Using saved selection to replace text at position", position, "with:", modifiedText);
          
          // Delete the selected text
          savedEditor.deleteText(position, selectionLength);
          
          // Insert the modified text
          savedEditor.insertText(position, modifiedText);
          
          // Force a re-render
          setEditorContent(savedEditor.root.innerHTML);
          
          // Ensure the cursor is placed after the inserted text
          savedEditor.setSelection(position + modifiedText.length, 0);
          savedEditor.focus();
        } else {
          // If we still don't have a selection, try to find the text in the content
          const content = savedEditor.getText();
          const position = content.indexOf(selectedText);
          
          if (position !== -1) {
            const modifiedText = response.data.modifiedText;
            
            console.log("Found text in content at position", position, "replacing with:", modifiedText);
            
            // Delete the found text
            savedEditor.deleteText(position, selectedText.length);
            
            // Insert the modified text
            savedEditor.insertText(position, modifiedText);
            
            // Force a re-render
            setEditorContent(savedEditor.root.innerHTML);
            
            // Ensure the cursor is placed after the inserted text
            savedEditor.setSelection(position + modifiedText.length, 0);
            savedEditor.focus();
          } else {
            console.error("Cannot find the text to replace");
            setError("Couldn't find the text to replace. Please try selecting it again.");
          }
        }
      } else {
        console.error("Editor reference not available");
        setError("Editor reference not available. Please try again.");
      }
      
      setSelectedText('');
      setAiPrompt('');
    } catch (err) {
      console.error("AI modification failed:", err);
      setError('Failed to modify text with AI: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      // First, make sure the document content is properly formatted
      // This prevents issues with the PDF generation
      const tempDoc = {...doc};
      
      // Create the PDF
      const blob = await pdf(<MyDocument doc={tempDoc} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/\s+/g, '_')}_${doc.type}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to download document: ' + err.message);
    }
  };

  const handleShare = async (doc) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: doc.title,
          text: doc.content,
          url: window.location.href
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = doc.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Document content copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing document:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <InfoIcon color="info" />;
      case 'reviewed':
        return <CheckCircleIcon color="success" />;
      case 'final':
        return <CheckCircleIcon color="primary" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <GavelIcon />;
      case 'legal_letter':
        return <MailIcon />;
      case 'affidavit':
        return <AssignmentIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const convertPlainTextToHtml = (text) => {
    if (!text) return '';
    
    // First, detect if the content already has HTML tags
    if (/<[a-z][\s\S]*>/i.test(text)) {
      console.log("Content appears to be HTML, using as is");
      return text;
    }

    // Process paragraphs (double line breaks)
    let html = '<p>' + 
      text
        // Replace double line breaks with paragraph markers
        .replace(/\n\n+/g, '</p><p>')
        // Replace single line breaks with <br> tags
        .replace(/\n/g, '<br/>') +
      '</p>';
    
    // Replace spaces at the beginning of lines (indentation) with non-breaking spaces
    html = html.replace(/<br\/>\s+/g, (match) => {
      const spaces = match.match(/\s+/)[0];
      const nbspSpaces = '&nbsp;'.repeat(spaces.length);
      return '<br/>' + nbspSpaces;
    });
    
    // Fix empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '<p><br/></p>');
    
    return html;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredDocuments = documents
    .filter(doc => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.metadata.jurisdiction.toLowerCase().includes(query) ||
          (doc.metadata.recipient && doc.metadata.recipient.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(doc => {
      // Filter by document type
      if (filterType !== 'all') {
        return doc.type === filterType;
      }
      return true;
    })
    .filter(doc => {
      // Filter by tab value (status)
      if (tabValue === 1) {
        return doc.status === 'draft';
      } else if (tabValue === 2) {
        return doc.status === 'reviewed';
      } else if (tabValue === 3) {
        return doc.status === 'final';
      }
      return true; // All documents
    });

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
            <LibraryBooksIcon />
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
              Document Hub
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create, manage, and share your legal documents
            </Typography>
          </Box>
        </Box>
        <GradientButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ 
            py: 1.5, 
            px: 3,
            borderRadius: 2,
            fontSize: '0.95rem'
          }}
        >
          Create New Document
        </GradientButton>
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
            <Tab label="All Documents" />
            <Tab label="Drafts" />
            <Tab label="Reviewed" />
            <Tab label="Final" />
          </Tabs>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <TextField
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                sx: { borderRadius: 2 }
              }}
              sx={{ width: { xs: '100%', sm: 220 } }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                displayEmpty
                renderValue={(value) => value === 'all' ? 'All Types' : value.replace('_', ' ')}
                sx={{ borderRadius: 2 }}
                startAdornment={<FilterListIcon color="action" sx={{ ml: 1, mr: 0.5 }} />}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="complaint">Complaint</MenuItem>
                <MenuItem value="legal_letter">Legal Letter</MenuItem>
                <MenuItem value="affidavit">Affidavit</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {loading && documents.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredDocuments.length === 0 ? (
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
                <DocumentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
                {searchQuery || filterType !== 'all' ? 'No matching documents found' : 'No documents yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Create your first document to get started. You can generate legal documents tailored to your needs.'}
              </Typography>
              {!searchQuery && filterType === 'all' && (
                <GradientButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Create New Document
                </GradientButton>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredDocuments.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc._id}>
                  <DocumentCard>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 40,
                            height: 40,
                            mr: 2
                          }}
                        >
                          {getDocumentTypeIcon(doc.type)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                            {doc.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <DocumentTypeChip
                              label={doc.type.replace('_', ' ')}
                              size="small"
                              doctype={doc.type}
                            />
                            <StatusChip
                              label={doc.status}
                              size="small"
                              status={doc.status}
                              icon={getStatusIcon(doc.status)}
                            />
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {doc.metadata.jurisdiction || 'No jurisdiction specified'}
                          </Typography>
                        </Box>
                        
                        {doc.metadata.recipient && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <MailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {doc.metadata.recipient}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Created: {new Date(doc.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      {doc.review && (
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Document Review
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Completeness</Typography>
                                <Rating value={doc.review.completeness.score / 2} readOnly size="small" precision={0.5} />
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Clarity</Typography>
                                <Rating value={doc.review.clarity.score / 2} readOnly size="small" precision={0.5} />
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Risk</Typography>
                                <Rating value={doc.review.risk.score / 2} readOnly size="small" precision={0.5} />
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 1, justifyContent: 'space-between' }}>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(doc)}
                        disabled={loading}
                        sx={{ 
                          borderRadius: 2,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        Edit
                      </Button>
                      
                      <Box>
                        <Tooltip title="Download PDF">
                          <IconButton
                            onClick={() => handleDownload(doc)}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2)
                              },
                              mr: 1
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share Document">
                          <IconButton
                            onClick={() => handleShare(doc)}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2)
                              }
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </DocumentCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Create Document Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
          py: 2.5
        }}>
          Create New Legal Document
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Fill in the details below to generate a document tailored to your needs. Our AI will create a draft based on your input.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Document Type"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="complaint">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GavelIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                        Complaint
                      </Box>
                    </MenuItem>
                    <MenuItem value="legal_letter">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        Legal Letter
                      </Box>
                    </MenuItem>
                    <MenuItem value="affidavit">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                        Affidavit
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Describe your situation in detail. Include relevant dates, names, and any specific points you want to address in the document."
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Additional Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jurisdiction"
                  value={formData.metadata.jurisdiction}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, jurisdiction: e.target.value }
                  })}
                  placeholder="e.g., Delhi, India"
                  InputProps={{
                    startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient"
                  value={formData.metadata.recipient}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, recipient: e.target.value }
                  })}
                  placeholder="Name of person or organization"
                  InputProps={{
                    startAdornment: <MailIcon color="action" sx={{ mr: 1 }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Case Number"
                  value={formData.metadata.caseNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, caseNumber: e.target.value }
                  })}
                  placeholder="If applicable"
                  InputProps={{
                    startAdornment: <FileCopyIcon color="action" sx={{ mr: 1 }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Related Parties"
                  value={formData.metadata.relatedParties.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      relatedParties: e.target.value.split(',').map(party => party.trim())
                    }
                  })}
                  placeholder="Names separated by commas"
                  helperText="Separate multiple parties with commas"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
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
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !formData.type || !formData.title || !formData.details}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>Generate Document</>
            )}
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Document: {selectedDocument?.title}
          </Box>
          {selectedDocument && (
            <Chip 
              label={selectedDocument.type.replace('_', ' ')} 
              size="small"
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                borderRadius: 4
              }}
            />
          )}
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                Document Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Jurisdiction: {selectedDocument?.metadata.jurisdiction || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
                {selectedDocument?.metadata.recipient && (
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Recipient: {selectedDocument.metadata.recipient}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedDocument?.metadata.caseNumber && (
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileCopyIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Case Number: {selectedDocument.metadata.caseNumber}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Document Content
            </Typography>
            
            <Box sx={{ 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <ReactQuill
                ref={quillRef}
                value={editorContent}
                onChange={(content, delta, source, editor) => {
                  console.log("Editor content changed. Source:", source);
                  setEditorContent(content);
                }}
                modules={modules}
                formats={formats}
                theme="snow"
                style={{ 
                  height: '400px', 
                  marginBottom: '50px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                onBlur={handleTextSelection}
                onChangeSelection={(range, source, editor) => {
                  console.log("Selection changed:", range);
                  if (range && range.length > 0) {
                    const selectedContent = editor.getText(range.index, range.length);
                    console.log("Selected text:", selectedContent);
                    setSelectedText(selectedContent);
                  }
                }}
              />
            </Box>
            
            {selectedText && (
              <Box sx={{ 
                mt: 3, 
                p: 3, 
                bgcolor: alpha(theme.palette.secondary.main, 0.05), 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.secondary.main, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <AutoFixHighIcon sx={{ mr: 1, fontSize: 20 }} />
                  AI Assistance
                </Typography>
                
                <Box sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'white', 
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Selected Text:</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>"{selectedText}"</Typography>
                </Box>
                
                <TextField
                  fullWidth
                  label="How would you like to modify this text?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Make it more formal, simplify the language, add more details about..."
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                
                <GradientButton
                  variant="contained"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleAIModify}
                  disabled={loading || !aiPrompt}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Modify with AI'
                  )}
                </GradientButton>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
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
            variant="contained"
            onClick={handleSaveEdit}
            disabled={loading}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Save Changes'
            )}
          </GradientButton>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ 
        mt: 4, 
        textAlign: 'center',
        p: 3,
        borderRadius: 3,
        background: alpha(theme.palette.primary.light, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Typography variant="subtitle1" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
          Document Hub - Empowering Women Through Legal Documentation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Create, edit, and manage legal documents tailored to women's rights and needs. Our AI-powered platform helps you generate professional legal documents with ease.
          Last updated: April 24, 2025 at 3:40 AM IST.
        </Typography>
      </Box>
    </Container>
  );
};

export default DocumentHub;
