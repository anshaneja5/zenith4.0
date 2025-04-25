import express from 'express';
import { OpenAI } from 'openai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Search for relevant authorities based on problem
router.post('/search', async (req, res) => {
  try {
    const { problem, jurisdiction } = req.body;

    if (!problem || !jurisdiction) {
      return res.status(400).json({
        message: 'Problem and jurisdiction are required'
      });
    }

    const prompt = `Find relevant authorities (government agencies, departments, officials) in ${jurisdiction} that can help with the following problem:

Problem: ${problem}

Provide a JSON array of authorities with the following fields for each:
- name: Authority name
- department: Department/agency name
- email: Official email address
- description: Brief description of their role
- jurisdiction: Location where they operate
- category: One of [Government, Police, Legal, Social Services, Other]`;

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

      const authorities = JSON.parse(jsonMatch[0]);

      return res.json(authorities);
    } catch (aiError) {
      console.error('AI Error:', aiError);
      return res.status(500).json({
        message: 'Error finding authorities',
        error: aiError.message
      });
    }
  } catch (error) {
    console.error('Error in authority search:', error);
    res.status(500).json({
      message: 'Error finding authorities',
      error: error.message
    });
  }
});

// Send email to authority
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, body, userEmail } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        message: 'Recipient, subject, and body are required'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      replyTo: userEmail || process.env.EMAIL_USER,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>${body.replace(/\n/g, '<br>')}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This email was sent through Nyaay.AI platform. 
          ${userEmail ? `Reply to: ${userEmail}` : ''}
        </p>
      </div>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      message: 'Error sending email',
      error: error.message
    });
  }
});

export default router; 