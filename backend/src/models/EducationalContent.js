import mongoose from 'mongoose';

const educationalContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'guide', 'faq'],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr'],
    required: true
  },
  jurisdiction: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['harassment', 'rights', 'self-protection', 'legal-process', 'support-resources'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const EducationalContent = mongoose.model('EducationalContent', educationalContentSchema);

export default EducationalContent;
