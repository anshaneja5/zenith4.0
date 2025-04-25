import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Document from '../models/Document.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate a new document
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { type, title, details, metadata } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct the prompt based on document type
    let prompt = `Generate a ${type} with the following details:\n\n`;
    prompt += `Title: ${title}\n`;
    prompt += `Details: ${details}\n`;
    prompt += `Jurisdiction: ${metadata.jurisdiction}\n`;
    if (metadata.recipient) prompt += `Recipient: ${metadata.recipient}\n`;
    if (metadata.caseNumber) prompt += `Case Number: ${metadata.caseNumber}\n`;
    if (metadata.relatedParties?.length) {
      prompt += `Related Parties: ${metadata.relatedParties.join(', ')}\n`;
    }

    // Add specific instructions based on document type
    switch (type) {
      case 'complaint':
        prompt += "\nPlease include:\n- Clear statement of facts\n- Relevant laws and regulations\n- Specific relief sought\n- Supporting evidence references\n\nIMPORTANT FORMATTING INSTRUCTIONS:\n- Do not use asterisks (*) for emphasis\n- Do not use bold text\n- Use proper indentation for lists and sections\n- Use clear section headings\n- Maintain consistent spacing between sections";
        break;
      case 'legal_letter':
        prompt += "\nPlease include:\n- Professional salutation\n- Clear purpose statement\n- Relevant legal references\n- Specific requests or demands\n- Professional closing\n\nIMPORTANT FORMATTING INSTRUCTIONS:\n- Do not use asterisks (*) for emphasis\n- Do not use bold text\n- Use proper indentation for lists and sections\n- Use clear section headings\n- Maintain consistent spacing between sections";
        break;
      case 'affidavit':
        prompt += "\nPlease include:\n- Sworn statement format\n- Personal details\n- Clear statement of facts\n- Signature and date placeholders\n\nIMPORTANT FORMATTING INSTRUCTIONS:\n- Do not use asterisks (*) for emphasis\n- Do not use bold text\n- Use proper indentation for lists and sections\n- Use clear section headings\n- Maintain consistent spacing between sections";
        break;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Create new document
    const document = new Document({
      userId: req.user._id,
      type,
      title,
      content,
      metadata,
      status: 'draft'
    });

    await document.save();

    res.json({ document });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// Review a document
router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Construct review prompt
    const reviewPrompt = `Review this ${document.type} for completeness, clarity, and potential risks:\n\n${document.content}\n\n
    Please provide:
    1. Completeness score (1-10) and feedback
    2. Clarity score (1-10) and feedback
    3. Risk assessment score (1-10) and feedback
    4. Specific suggestions for improvement`;

    const result = await model.generateContent(reviewPrompt);
    const response = await result.response;
    const reviewText = response.text();

    // Parse the review text to extract scores and feedback
    const review = {
      completeness: {
        score: parseInt(reviewText.match(/Completeness score: (\d+)/)?.[1] || '5'),
        feedback: reviewText.match(/Completeness feedback: (.*?)(?=\n|$)/)?.[1] || ''
      },
      clarity: {
        score: parseInt(reviewText.match(/Clarity score: (\d+)/)?.[1] || '5'),
        feedback: reviewText.match(/Clarity feedback: (.*?)(?=\n|$)/)?.[1] || ''
      },
      risk: {
        score: parseInt(reviewText.match(/Risk score: (\d+)/)?.[1] || '5'),
        feedback: reviewText.match(/Risk feedback: (.*?)(?=\n|$)/)?.[1] || ''
      }
    };

    document.review = review;
    document.status = 'reviewed';
    await document.save();

    res.json({ document });
  } catch (error) {
    console.error('Document review error:', error);
    res.status(500).json({ error: 'Failed to review document' });
  }
});

// Get user's documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a specific document
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update a document
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { content, metadata, status } = req.body;
    
    if (content) document.content = content;
    if (metadata) document.metadata = { ...document.metadata, ...metadata };
    if (status) document.status = status;
    
    document.version += 1;
    await document.save();

    res.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// AI Text Modification
router.post('/ai-modify', async (req, res) => {
  try {
    const { text, prompt } = req.body;

    if (!text || !prompt) {
      return res.status(400).json({ error: 'Text and prompt are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const aiPrompt = `
You are a legal document editor. Please modify the following text based on the user's prompt.
Keep the legal context and meaning intact while making the requested changes.

Original Text:
${text}

User's Request:
${prompt}

Please provide only the modified text, without any additional explanations or formatting.
`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const modifiedText = response.text();

    res.json({ modifiedText });
  } catch (error) {
    console.error('Error in AI text modification:', error);
    res.status(500).json({ error: 'Failed to modify text with AI' });
  }
});

export default router; 