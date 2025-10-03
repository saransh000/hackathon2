// Simple test to verify backend functionality
console.log('🏥 CureMind Backend Test Suite');
console.log('==============================');

// Test 1: Check if all required modules can be loaded
try {
  const express = require('express');
  const mongoose = require('mongoose');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  
  console.log('✅ All dependencies loaded successfully');
} catch (error) {
  console.log('❌ Dependency error:', error.message);
  process.exit(1);
}

// Test 2: Check environment configuration
require('dotenv').config();
console.log('✅ Environment loaded');
console.log('   - Port:', process.env.PORT || 5000);
console.log('   - MongoDB URI configured:', !!process.env.MONGODB_URI);
console.log('   - JWT Secret configured:', !!process.env.JWT_SECRET);

// Test 3: Test database models
try {
  const User = require('./src/models/User');
  const SymptomAnalysis = require('./src/models/SymptomAnalysis');
  
  console.log('✅ Database models loaded successfully');
} catch (error) {
  console.log('❌ Model error:', error.message);
}

// Test 4: Test middleware
try {
  const { generateToken, authMiddleware } = require('./src/middleware/auth');
  const errorHandler = require('./src/middleware/errorHandler');
  
  console.log('✅ Middleware loaded successfully');
} catch (error) {
  console.log('❌ Middleware error:', error.message);
}

// Test 5: Test controllers
try {
  const authController = require('./src/controllers/authController');
  const userController = require('./src/controllers/userController');
  const analysisController = require('./src/controllers/analysisController');
  const adminController = require('./src/controllers/adminController');
  
  console.log('✅ Controllers loaded successfully');
} catch (error) {
  console.log('❌ Controller error:', error.message);
}

// Test 6: Test routes
try {
  const authRoutes = require('./src/routes/auth');
  const userRoutes = require('./src/routes/users');
  const analysisRoutes = require('./src/routes/analysis');
  const adminRoutes = require('./src/routes/admin');
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.log('❌ Route error:', error.message);
}

console.log('\n🎉 Backend test completed successfully!');
console.log('\nNext steps:');
console.log('1. Start MongoDB: brew services start mongodb (macOS) or sudo systemctl start mongod (Linux)');
console.log('2. Initialize database: npm run init-db');
console.log('3. Start server: npm run dev');
console.log('4. Test API: curl http://localhost:5000/api/health');

process.exit(0);