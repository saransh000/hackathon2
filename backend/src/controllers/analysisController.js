const SymptomAnalysis = require('../models/SymptomAnalysis');
const { v4: uuidv4 } = require('uuid');

// @desc    Analyze symptoms with AI
// @route   POST /api/analysis/analyze
// @access  Private
const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, sessionId } = req.body;
    const userId = req.user._id;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Symptom description is required'
      });
    }

    const analysisSessionId = sessionId || uuidv4();
    const startTime = Date.now();

    // Perform AI analysis
    const analysis = await performAIAnalysis(symptoms);
    const processingTime = Date.now() - startTime;

    // Save analysis to database
    const symptomAnalysis = new SymptomAnalysis({
      userId,
      sessionId: analysisSessionId,
      symptoms: {
        description: symptoms,
        keywords: extractKeywords(symptoms),
        severity: analysis.severity
      },
      analysis: {
        severity: analysis.severity,
        confidence: analysis.confidence,
        conditions: analysis.conditions,
        recommendations: analysis.recommendations
      },
      aiModel: {
        version: 'v1.0',
        processingTime
      }
    });

    await symptomAnalysis.save();

    res.json({
      success: true,
      message: 'Symptom analysis completed',
      data: {
        sessionId: analysisSessionId,
        analysis: symptomAnalysis.analysis,
        processingTime,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing symptoms'
    });
  }
};

// @desc    Get analysis history
// @route   GET /api/analysis/history
// @access  Private
const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, severity } = req.query;

    const query = { userId };
    if (severity) {
      query['analysis.severity'] = severity;
    }

    const analyses = await SymptomAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-aiModel.additionalData');

    const total = await SymptomAnalysis.countDocuments(query);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history'
    });
  }
};

// @desc    Get specific analysis
// @route   GET /api/analysis/:id
// @access  Private
const getAnalysis = async (req, res) => {
  try {
    const analysis = await SymptomAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis'
    });
  }
};

// @desc    Submit feedback for analysis
// @route   POST /api/analysis/:id/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { helpful, rating, comment } = req.body;
    
    const analysis = await SymptomAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    analysis.feedback = {
      helpful,
      rating,
      comment,
      submittedAt: new Date()
    };

    await analysis.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: analysis.feedback
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
};

// AI Analysis Engine
async function performAIAnalysis(symptoms) {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Emergency keywords and patterns
  const emergencyKeywords = [
    'chest pain', 'can\'t breathe', 'difficulty breathing', 'severe bleeding',
    'unconscious', 'heart attack', 'stroke', 'seizure', 'overdose',
    'severe head injury', 'choking', 'severe allergic reaction'
  ];
  
  // Doctor visit keywords
  const doctorKeywords = [
    'persistent', 'fever', 'severe pain', 'vomiting', 'diarrhea',
    'infection', 'rash', 'swelling', 'blood', 'numbness'
  ];

  // Home remedy keywords
  const homeKeywords = [
    'headache', 'mild pain', 'cold', 'cough', 'sore throat',
    'tired', 'fatigue', 'stuffy nose', 'minor cut', 'bruise'
  ];

  let severity = 'home';
  let confidence = 50;
  let conditions = [];

  // Check for emergency conditions
  const hasEmergency = emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword));
  if (hasEmergency) {
    severity = 'emergency';
    confidence = 95;
    conditions = [
      { name: 'Medical Emergency', probability: 'High Risk', description: 'Immediate medical attention required' },
      { name: 'Life-threatening Condition', probability: 'High Risk', description: 'Critical situation requiring emergency response' }
    ];
  }
  // Check for doctor visit conditions
  else if (doctorKeywords.some(keyword => lowerSymptoms.includes(keyword))) {
    severity = 'doctor';
    confidence = 75;
    conditions = [
      { name: 'Possible Infection', probability: 'Moderate', description: 'May require medical evaluation and treatment' },
      { name: 'Inflammatory Condition', probability: 'Possible', description: 'Could benefit from professional medical assessment' },
      { name: 'Systemic Illness', probability: 'Possible', description: 'Symptoms suggest need for medical consultation' }
    ];
  }
  // Home remedy conditions
  else {
    severity = 'home';
    confidence = 70;
    conditions = [
      { name: 'Common Cold/Flu', probability: 'Likely', description: 'Typical viral upper respiratory symptoms' },
      { name: 'Minor Discomfort', probability: 'Possible', description: 'Self-limiting condition that may resolve with rest' },
      { name: 'Stress-related Symptoms', probability: 'Possible', description: 'May be related to lifestyle or stress factors' }
    ];
  }

  // Additional analysis based on symptom patterns
  if (lowerSymptoms.includes('fever') && lowerSymptoms.includes('cough')) {
    confidence += 10;
    if (severity === 'home') {
      conditions.unshift({
        name: 'Respiratory Viral Infection',
        probability: 'Likely',
        description: 'Common viral infection affecting respiratory system'
      });
    }
  }

  if (lowerSymptoms.includes('pain') && (lowerSymptoms.includes('severe') || lowerSymptoms.includes('intense'))) {
    if (severity === 'home') {
      severity = 'doctor';
      confidence = 80;
    }
  }

  return {
    severity,
    confidence: Math.min(confidence, 95),
    conditions: conditions.slice(0, 3), // Limit to top 3 conditions
    recommendations: getRecommendations(severity)
  };
}

// Get recommendations based on severity
function getRecommendations(severity) {
  switch(severity) {
    case 'emergency':
      return {
        title: '🚨 SEEK IMMEDIATE MEDICAL ATTENTION',
        type: 'emergency',
        actions: [
          'Call 911 or go to the nearest emergency room immediately',
          'Do not drive yourself - call an ambulance or have someone drive you',
          'If possible, have someone stay with you while seeking help',
          'Bring a list of current medications and medical history',
          'If you lose consciousness, ensure someone can provide information to medical staff'
        ]
      };
    case 'doctor':
      return {
        title: '👨‍⚕️ Schedule a Doctor Visit',
        type: 'doctor-visit',
        actions: [
          'Schedule an appointment with your primary care physician within 24-48 hours',
          'Monitor your symptoms closely and note any changes or worsening',
          'Keep track of your temperature if you have a fever',
          'Prepare a list of all symptoms, their duration, and any triggers',
          'Avoid strenuous activities until you can consult with a healthcare provider',
          'Stay hydrated and get adequate rest'
        ]
      };
    case 'home':
    default:
      return {
        title: '🏠 Home Care Recommendations',
        type: 'home-remedy',
        actions: [
          'Get plenty of rest and sleep to help your body recover',
          'Stay well hydrated by drinking water, herbal teas, or clear broths',
          'Use over-the-counter pain relievers as directed for discomfort',
          'Apply warm or cold compresses as appropriate for your symptoms',
          'Monitor your symptoms - seek medical care if they worsen or persist',
          'Maintain good hygiene to prevent spreading illness to others'
        ]
      };
  }
}

// Extract keywords from symptom description
function extractKeywords(symptoms) {
  const medicalKeywords = [
    'pain', 'fever', 'headache', 'nausea', 'vomiting', 'diarrhea', 'cough',
    'sore throat', 'runny nose', 'congestion', 'fatigue', 'dizziness',
    'shortness of breath', 'chest pain', 'abdominal pain', 'rash', 'swelling',
    'bleeding', 'numbness', 'tingling', 'weakness', 'confusion'
  ];
  
  const lowerSymptoms = symptoms.toLowerCase();
  return medicalKeywords.filter(keyword => lowerSymptoms.includes(keyword));
}

module.exports = {
  analyzeSymptoms,
  getAnalysisHistory,
  getAnalysis,
  submitFeedback
};