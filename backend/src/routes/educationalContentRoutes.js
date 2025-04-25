import express from 'express';
import { OpenAI } from 'openai';
import EducationalContent from '../models/EducationalContent.js';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get content links based on query parameters or user situation
router.get('/content-links', async (req, res) => {
  try {
    const { category, language, type, search, situation, jurisdiction } = req.query;

    // If situation is provided, use OpenAI web search to recommend content
    if (situation) {
      const userLanguage = language || 'English';

      const prompt = `Based on the following situation, recommend 5-10 specific educational content pieces (articles, videos, guides, etc.) in ${userLanguage} that would help the user in ${jurisdiction || 'India'}.

Situation: ${situation}

Guidelines:
1. Provide direct links to real or likely helpful resources (prefer ${userLanguage} sources)
2. Include a brief title and 1-2 line description for each resource
3. Format your response as a JSON array of objects with fields: title, description, url, type, category, language, jurisdiction
4. Focus on practical, trustworthy, and easy-to-understand material
5. If jurisdiction is specified, prioritize content relevant to that jurisdiction's laws and regulations
6. Only return the JSON array.`;

      try {
        // Use the Responses API for web search
        const completion = await openai.responses.create({
          model: 'gpt-4.1', // or 'gpt-4o-search-preview' if available in your account
          tools: [{ type: 'web_search_preview' }],
          input: prompt
        });

        const text = completion.output_text;
        console.log('OpenAI Response:', text); // Debug log

        // Try to extract JSON array from the response
        const jsonMatch = text.match(/\[.*\]/s);
        if (!jsonMatch) {
          throw new Error('No JSON array found in response');
        }

        const resources = JSON.parse(jsonMatch[0]);
        return res.json(resources);
      } catch (openaiError) {
        console.error('OpenAI Error:', openaiError);
        return res.status(500).json({
          message: 'Error generating recommendations',
          error: openaiError.message
        });
      }
    }

    // Otherwise, filter content from database
    const query = {};

    if (category) query.category = category;
    if (language) query.language = language;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Get content from database with applied filters
    const content = await EducationalContent.find(query)
      .sort({ views: -1, createdAt: -1 })
      .select('title description url category type language tags views');

    // Format the response to include only links and metadata
    const contentLinks = content.map(item => ({
      title: item.title,
      description: item.description,
      url: item.url,
      category: item.category,
      type: item.type,
      language: item.language,
      tags: item.tags,
      views: item.views
    }));

    res.json(contentLinks);
  } catch (error) {
    console.error('Error in content-links route:', error);
    res.status(500).json({
      message: 'Error fetching content links',
      error: error.message
    });
  }
});

export default router;
