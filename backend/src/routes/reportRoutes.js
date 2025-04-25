import express from 'express';
import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';
import File from '../models/File.js';

const router = express.Router();

// Validation middleware
const validateReport = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('jurisdiction').trim().notEmpty().withMessage('Jurisdiction is required'),
  body('files').optional().isArray().withMessage('Files must be an array')
];

// Create a new report
router.post('/', validateReport, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, jurisdiction, files } = req.body;

    // Create the report
    const report = new Report({
      description,
      jurisdiction,
      files: files || []
    });

    await report.save();

    res.status(201).json({
      message: 'Report created successfully',
      reportId: report._id
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  }
});

// Get a report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get all files associated with the report with full information
    const files = await File.find({ reportId: report._id });
    
    // Add files to the report object with all necessary information
    const reportWithFiles = {
      ...report.toObject(),
      files: files.map(file => ({
        id: file._id,
        filename: file.filename,
        url: file.url,
        publicId: file.publicId,
        createdAt: file.createdAt
      }))
    };

    res.json(reportWithFiles);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

export default router; 