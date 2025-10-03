const User = require('../models/User');
const SymptomAnalysis = require('../models/SymptomAnalysis');

// @desc    Get dashboard overview statistics
// @route   GET /api/admin/overview
// @access  Private (Admin)
const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ 
      role: 'user', 
      lastActive: { $gte: sevenDaysAgo } 
    });
    const newUsersThisMonth = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Analysis statistics
    const totalAnalyses = await SymptomAnalysis.countDocuments();
    const analysesThisMonth = await SymptomAnalysis.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const analysesToday = await SymptomAnalysis.countDocuments({
      createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
    });

    // Severity breakdown
    const severityStats = await SymptomAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$analysis.severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Most common conditions
    const commonConditions = await SymptomAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $unwind: '$analysis.conditions'
      },
      {
        $group: {
          _id: '$analysis.conditions.name',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // User growth over time (last 30 days)
    const userGrowth = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // System health metrics
    const systemHealth = {
      averageProcessingTime: await getAverageProcessingTime(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      lastBackup: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000) // Simulated
    };

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growth: userGrowth
        },
        analyses: {
          total: totalAnalyses,
          thisMonth: analysesThisMonth,
          today: analysesToday,
          severityBreakdown: severityStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        insights: {
          commonConditions: commonConditions.map(item => ({
            condition: item._id,
            count: item.count
          })),
          emergencyRate: (severityStats.find(s => s._id === 'emergency')?.count || 0) / (analysesThisMonth || 1) * 100
        },
        system: systemHealth,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUserAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;

    // Build query
    let query = { role: 'user' };
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.lastActive = { $gte: sevenDaysAgo };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Get users with analysis counts
    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'symptomanalyses',
          localField: '_id',
          foreignField: 'userId',
          as: 'analyses'
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          profile: 1,
          lastActive: 1,
          createdAt: 1,
          isActive: 1,
          analysisCount: { $size: '$analyses' },
          lastAnalysis: { $max: '$analyses.createdAt' }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics'
    });
  }
};

// @desc    Get analysis analytics
// @route   GET /api/admin/analyses
// @access  Private (Admin)
const getAnalysisAnalytics = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      severity, 
      dateFrom, 
      dateTo,
      userId 
    } = req.query;

    // Build query
    let query = {};
    
    if (severity) {
      query['analysis.severity'] = severity;
    }

    if (userId) {
      query.userId = userId;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Get analyses with user info
    const analyses = await SymptomAnalysis.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.password': 0,
          'user.medicalHistory': 0,
          'aiModel.additionalData': 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const total = await SymptomAnalysis.countDocuments(query);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get analysis analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis analytics'
    });
  }
};

// @desc    Get system metrics
// @route   GET /api/admin/system
// @access  Private (Admin)
const getSystemMetrics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Performance metrics
    const avgProcessingTime = await getAverageProcessingTime();
    
    // Error rate (simulated)
    const errorRate = Math.random() * 2; // 0-2% error rate

    // Database metrics
    const dbStats = {
      collections: {
        users: await User.countDocuments(),
        analyses: await SymptomAnalysis.countDocuments()
      },
      diskUsage: Math.random() * 100, // Simulated
      connections: Math.floor(Math.random() * 50) + 10 // Simulated
    };

    // API usage patterns
    const apiUsage = await SymptomAnalysis.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          requests: { $sum: 1 },
          avgProcessingTime: { $avg: '$aiModel.processingTime' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        performance: {
          averageProcessingTime: avgProcessingTime,
          errorRate: errorRate.toFixed(2),
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        },
        database: dbStats,
        apiUsage: apiUsage,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Get system metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system metrics'
    });
  }
};

// @desc    Generate reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const generateReports = async (req, res) => {
  try {
    const { type = 'summary', dateFrom, dateTo } = req.query;
    
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();

    let report = {};

    switch (type) {
      case 'summary':
        report = await generateSummaryReport(startDate, endDate);
        break;
      case 'users':
        report = await generateUserReport(startDate, endDate);
        break;
      case 'health':
        report = await generateHealthReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: {
        report,
        period: {
          from: startDate,
          to: endDate
        },
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Generate reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};

// Helper functions
async function getAverageProcessingTime() {
  const result = await SymptomAnalysis.aggregate([
    {
      $match: {
        'aiModel.processingTime': { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$aiModel.processingTime' }
      }
    }
  ]);
  
  return result[0]?.avgTime || 2500; // Default 2.5 seconds
}

async function generateSummaryReport(startDate, endDate) {
  const totalUsers = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const totalAnalyses = await SymptomAnalysis.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const severityBreakdown = await SymptomAnalysis.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$analysis.severity',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    title: 'Summary Report',
    metrics: {
      totalUsers,
      totalAnalyses,
      severityBreakdown: severityBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    }
  };
}

async function generateUserReport(startDate, endDate) {
  const userStats = await User.aggregate([
    {
      $match: {
        role: 'user',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        registrations: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return {
    title: 'User Registration Report',
    data: userStats
  };
}

async function generateHealthReport(startDate, endDate) {
  const conditions = await SymptomAnalysis.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $unwind: '$analysis.conditions'
    },
    {
      $group: {
        _id: '$analysis.conditions.name',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$analysis.confidence' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 20
    }
  ]);

  return {
    title: 'Health Trends Report',
    topConditions: conditions
  };
}

module.exports = {
  getDashboardOverview,
  getUserAnalytics,
  getAnalysisAnalytics,
  getSystemMetrics,
  generateReports
};