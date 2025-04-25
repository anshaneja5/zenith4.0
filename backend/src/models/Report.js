import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  jurisdiction: {
    type: String,
    required: true
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  }
});

const Report = mongoose.model('Report', reportSchema);

export default Report; 