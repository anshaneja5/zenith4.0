import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint', 'legal_letter', 'affidavit'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    jurisdiction: String,
    recipient: String,
    date: Date,
    caseNumber: String,
    relatedParties: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'reviewed', 'final'],
    default: 'draft'
  },
  review: {
    completeness: {
      score: Number,
      feedback: String
    },
    clarity: {
      score: Number,
      feedback: String
    },
    risk: {
      score: Number,
      feedback: String
    }
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Document', documentSchema); 