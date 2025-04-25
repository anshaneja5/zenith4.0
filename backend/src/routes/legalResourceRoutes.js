import express from 'express';
import { OpenAI } from 'openai';
import LegalResource from '../models/LegalResource.js';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get matching legal resources based on user's needs and location
router.get('/match', async (req, res) => {
  try {
    const { situation, jurisdiction, language, needs } = req.query;

    if (!situation || !jurisdiction) {
      return res.status(400).json({
        message: 'Situation and jurisdiction are required'
      });
    }

    // First, try to find matching resources from our database
    const query = {
      jurisdiction: { $regex: jurisdiction, $options: 'i' },
      verificationStatus: 'verified'
    };

    if (language) {
      query.languages = { $in: [language] };
    }

    if (needs) {
      query.services = { $in: needs.split(',') };
    }

    const databaseResources = await LegalResource.find(query)
      .sort({ rating: -1, isProBono: -1 })
      .limit(5);

    // If we have enough verified resources, return them
    if (databaseResources.length >= 3) {
      return res.json({
        source: 'database',
        resources: databaseResources
      });
    }

    // If not enough resources, use AI to find additional ones
    const prompt = `Find legal resources (NGOs, legal aid, counseling, support services) for the following situation in ${jurisdiction}:

Situation: ${situation}
${language ? `Preferred Language: ${language}` : ''}
${needs ? `Specific Needs: ${needs}` : ''}

Provide a JSON array of resources with the following fields for each:
- name: Organization/service name
- type: One of [NGO, Legal Aid, Counseling, Support Service, Lawyer, Legal Clinic]
- description: Brief description of services
- contact: Object with phone, email, website, and address
- services: Array of specific services offered
- languages: Array of languages supported
- isProBono: Boolean indicating if services are free
- jurisdiction: Location where services are available`;

    try {
      const completion = await openai.responses.create({
        model: 'gpt-4.1',
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      });

      const text = completion.output_text;
      console.log('OpenAI Response:', text);

      const jsonMatch = text.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const aiResources = JSON.parse(jsonMatch[0]);

      // Combine database and AI resources
      const allResources = [...databaseResources, ...aiResources];

      return res.json({
        source: 'combined',
        resources: allResources
      });
    } catch (aiError) {
      console.error('AI Error:', aiError);
      // If AI fails, return database results if any
      if (databaseResources.length > 0) {
        return res.json({
          source: 'database',
          resources: databaseResources
        });
      }
      throw aiError;
    }
  } catch (error) {
    console.error('Error in resource matching:', error);
    res.status(500).json({
      message: 'Error finding matching resources',
      error: error.message
    });
  }
});

// Get referral letter template
router.post('/referral', async (req, res) => {
  try {
    const { userId, resourceId, situation } = req.body;

    const resource = await LegalResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found'
      });
    }

    const prompt = `Generate a referral letter for the following situation to ${resource.name}:

Situation: ${situation}
Resource Type: ${resource.type}
Resource Contact: ${JSON.stringify(resource.contact)}

The letter should:
1. Be professional and concise
2. Include relevant details about the situation
3. Request appropriate assistance
4. Include contact information for follow-up`;

    const completion = await openai.responses.create({
      model: 'gpt-4.1',
      input: prompt
    });

    const letter = completion.output_text;

    res.json({
      letter,
      resource: {
        name: resource.name,
        contact: resource.contact
      }
    });
  } catch (error) {
    console.error('Error generating referral letter:', error);
    res.status(500).json({
      message: 'Error generating referral letter',
      error: error.message
    });
  }
});

export default router; 