const mongoose = require('mongoose');

const symptomAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  symptoms: {
    description: {
      type: String,
      required: [true, 'Symptom description is required'],
      trim: true
    },
    keywords: [String],
    duration: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical']
    }
  },
  analysis: {
    severity: {
      type: String,
      enum: ['home', 'doctor', 'emergency'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    conditions: [{
      name: {
        type: String,
        required: true
      },
      probability: {
        type: String,
        required: true
      },
      description: String
    }],
    recommendations: {
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['emergency', 'doctor-visit', 'home-remedy'],
        required: true
      },
      actions: [String]
    }
  },
  aiModel: {
    version: {
      type: String,
      default: 'v1.0'
    },
    processingTime: {
      type: Number // in milliseconds
    },
    additionalData: mongoose.Schema.Types.Mixed
  },
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  followUp: {
    actionTaken: {
      type: String,
      enum: ['home-care', 'doctor-visit', 'emergency', 'no-action', 'other']
    },
    outcome: String,
    updatedAt: Date
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

// Index for faster queries
symptomAnalysisSchema.index({ userId: 1, createdAt: -1 });
symptomAnalysisSchema.index({ sessionId: 1 });
symptomAnalysisSchema.index({ 'analysis.severity': 1 });

// Update the updatedAt field before saving
symptomAnalysisSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SymptomAnalysis', symptomAnalysisSchema);