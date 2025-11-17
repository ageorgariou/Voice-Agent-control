import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function createPersistentAdminUser() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB_NAME || 'voice_agent_db');
    const usersCollection = db.collection('users');
    
    // Always ensure admin user exists with correct credentials
    const adminUsername = 'alex';
    const adminPassword = '6934544241Aa!';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = {
      username: adminUsername,
      password: hashedPassword,
      name: 'Alex',
      email: 'alex@voiceagentcontrol.com',
      userType: 'Admin',
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      last_login: null,
      settings: {
        two_fa_enabled: false,
        notifications_enabled: true
      },
      apiKeys: {
        vapi_key: '',
        openai_key: '',
        elevenlabs_key: '',
        deepgram_key: ''
      }
    };
    
    // Use upsert to ensure admin always exists with correct data
    const result = await usersCollection.replaceOne(
      { username: adminUsername },
      adminUser,
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user updated successfully');
    }
    
    // Verify admin user
    const verifyAdmin = await usersCollection.findOne({ username: adminUsername });
    console.log('✅ Admin user verified:', {
      username: verifyAdmin.username,
      email: verifyAdmin.email,
      userType: verifyAdmin.userType,
      is_active: verifyAdmin.is_active,
      created_at: verifyAdmin.created_at
    });
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare(adminPassword, verifyAdmin.password);
    console.log('✅ Password verification:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // List all active users
    console.log('\n📋 All active users in database:');
    const allUsers = await usersCollection.find({ is_active: true }).toArray();
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.userType}) - ${user.email} - Active: ${user.is_active}`);
    });
    
    console.log('\n🎉 Admin user setup completed successfully!');
    console.log('📝 Admin credentials:');
    console.log('   Username: alex');
    console.log('   Password: 6934544241Aa!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

createPersistentAdminUser();
