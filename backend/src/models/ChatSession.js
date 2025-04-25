import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  jurisdiction: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
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

// Update the updatedAt timestamp before saving
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession; 