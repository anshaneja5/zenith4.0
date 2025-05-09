import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import ChatSession from '../models/ChatSession.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import multer from 'multer';
import { Readable } from 'stream';
import speech from '@google-cloud/speech';
// Import Twitter scraper
import { Scraper, SearchMode } from '@the-convocation/twitter-scraper';

const router = express.Router();
dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Twitter scraper
const twitterScraper = new Scraper();

// Set up Google Cloud Speech-to-Text client
const speechClient = new speech.SpeechClient({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/ansh-aneja%40certain-region-457116-k2.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  }
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Validation middleware
const validateLegalQuery = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('jurisdiction').trim().notEmpty().withMessage('Jurisdiction is required'),
  body('language').trim().notEmpty().withMessage('Language is required')
];

// Get all chat sessions for a user
router.get('/sessions', async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title jurisdiction createdAt updatedAt language');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ message: 'Error fetching chat sessions' });
  }
});

// Get a specific chat session
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({ message: 'Error fetching chat session' });
  }
});

// Create a new chat session
router.post('/sessions', async (req, res) => {
  try {
    const { userId, title, jurisdiction, language } = req.body;
    const session = new ChatSession({
      userId,
      title,
      jurisdiction,
      language: language || 'en',
      messages: []
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ message: 'Error creating chat session' });
  }
});

// Function to fetch relevant Twitter posts based on query
async function fetchTwitterPosts(query, count = 5) {
  try {
    // Try to log in first if credentials are available
    if (process.env.TWITTER_USERNAME && process.env.TWITTER_PASSWORD) {
      await twitterScraper.login(process.env.TWITTER_USERNAME, process.env.TWITTER_PASSWORD);
    }
    
    // Search for tweets and collect them into an array
    const tweets = [];
    for await (const tweet of twitterScraper.searchTweets(query, count)) {
      tweets.push(tweet);
    }
    
    // Format the tweets for easier consumption
    const formattedTweets = tweets.map(tweet => ({
      username: tweet.username || tweet.user?.username || 'unknown',
      name: tweet.name || tweet.user?.name || 'Unknown',
      text: tweet.text || tweet.content || '',
      date: tweet.date || tweet.createdAt || new Date().toISOString(),
      url: tweet.url || `https://twitter.com/${tweet.username || 'user'}/status/${tweet.id || ''}`
    }));
    
    return formattedTweets;
  } catch (error) {
    console.error('Error fetching Twitter posts:', error);
    return [];
  }
}

// Speech to text conversion endpoint
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    // Get language from request
    const language = req.body.language || 'en';
    
    // Map language code to proper Speech-to-Text language code
    const languageCodeMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN'
    };
    
    const languageCode = languageCodeMap[language] || 'en-US';

    // Configure request for Google Cloud Speech-to-Text
    const audio = {
      content: req.file.buffer.toString('base64'),
    };
    
    const config = {
      encoding: 'WEBM_OPUS', // Adjust based on your frontend audio format
      sampleRateHertz: 48000, // Adjust based on your audio sample rate
      languageCode: languageCode, // Use the appropriate language code
      model: 'default',
      audioChannelCount: 1,
      enableAutomaticPunctuation: true,
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    // Perform speech recognition
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ text: transcription });
  } catch (error) {
    console.error('Error in speech-to-text conversion:', error);
    res.status(500).json({ message: 'Error processing speech to text' });
  }
});

// Update a chat session with new messages
router.post('/chat', async (req, res) => {
  try {
    const { message, jurisdiction, sessionId, userId, language } = req.body;

    if (!message || !jurisdiction) {
      return res.status(400).json({ message: 'Message and jurisdiction are required' });
    }

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
    } else {
      // Create new session with first message as title
      session = new ChatSession({
        userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        jurisdiction,
        language: language || 'en',
        messages: []
      });
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message
    });

    // Fetch relevant Twitter posts
    const twitterPosts = await fetchTwitterPosts(message, 3);
    
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format chat history according to Gemini's requirements
    const formattedHistory = session.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory
    });

    // Format Twitter posts for inclusion in the prompt
    let twitterContext = '';
    if (twitterPosts.length > 0) {
      twitterContext = `\n\nHere are some relevant Twitter posts that might provide additional context:\n\n`;
      twitterPosts.forEach((post, index) => {
        twitterContext += `Tweet ${index + 1} by @${post.username}: "${post.text}"\n`;
      });
    }

    // Create a prompt that includes jurisdiction, language context, and Twitter posts
    const prompt = `You are a legal guidance assistant. The user is from ${jurisdiction}. 
    Please provide legal guidance about: "${message}"
    
    Guidelines for your response:
    1. Provide the response in ${language} language only
    2. Use plain, easy-to-understand language
    3. Focus on practical steps and options
    4. Consider local laws and procedures for ${jurisdiction}
    5. If explaining a process, break it down into clear steps
    6. Include relevant rights and protections
    7. If unsure about jurisdiction-specific details, mention this
    8. Do not provide legal advice, only general guidance
    9. Keep responses concise but informative
    10. Maintain context from previous messages in the conversation${twitterContext}
    
    If relevant Twitter posts were provided, you may reference insights from them in your response, but focus primarily on providing accurate legal information.`;

    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // Add assistant message to session
    session.messages.push({
      role: 'assistant',
      content: text
    });

    // Save the updated session
    await session.save();

    res.json({ 
      response: text,
      sessionId: session._id,
      twitterPosts: twitterPosts // Include Twitter posts in the response
    });
  } catch (error) {
    console.error('Error in legal guidance chat:', error);
    res.status(500).json({ message: 'Error getting legal guidance' });
  }
});

// Delete a chat session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ message: 'Error deleting chat session' });
  }
});

export default router;
