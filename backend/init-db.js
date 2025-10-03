const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/curemind');
    console.log('📦 Connected to MongoDB for initialization');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ 
      username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
      role: 'admin' 
    });

    if (!existingAdmin) {
      // Create default admin user
      const adminUser = new User({
        username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        },
        email: 'admin@curemind.com'
      });

      await adminUser.save();
      console.log('✅ Default admin user created successfully');
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create some sample users for testing (optional)
    const sampleUsers = [
      {
        username: 'john_doe',
        password: 'password123',
        email: 'john@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 32,
          gender: 'Male'
        }
      },
      {
        username: 'jane_smith',
        password: 'password123',
        email: 'jane@example.com',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          age: 28,
          gender: 'Female'
        }
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Sample user created: ${userData.username}`);
      }
    }

    console.log('🎉 Database initialization completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();