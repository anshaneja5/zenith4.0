import mongoose from 'mongoose';

const legalResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['NGO', 'Legal Aid', 'Counseling', 'Support Service', 'Lawyer', 'Legal Clinic'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  jurisdiction: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    address: String
  },
  services: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  isProBono: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
legalResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LegalResource = mongoose.model('LegalResource', legalResourceSchema);

export default LegalResource; 