import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  // Add blockchain-related fields
  fileHash: {
    type: String,
    required: true
  },
  blockchainVerification: {
    transactionHash: String,
    blockNumber: BigInt,
    timestamp: Date,
    verified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending'
    }
  }  
}, {
  timestamps: true
});

const File = mongoose.model('File', fileSchema);

export default File;
