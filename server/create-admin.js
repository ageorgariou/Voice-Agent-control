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

async function createAdminUser() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'voice_agent_db');
    const usersCollection = db.collection('users');
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Admin user details:', {
        username: existingAdmin.username,
        email: existingAdmin.email,
        userType: existingAdmin.userType,
        created_at: existingAdmin.created_at
      });
      
      // Check if password needs to be updated (if it's not hashed)
      const isPasswordHashed = existingAdmin.password.startsWith('$2b$');
      if (!isPasswordHashed) {
        console.log('Updating admin password to hashed version...');
        const hashedPassword = await bcrypt.hash('12345', 12);
        await usersCollection.updateOne(
          { username: 'admin' },
          { 
            $set: { 
              password: hashedPassword,
              updated_at: new Date()
            }
          }
        );
        console.log('Admin password updated successfully');
      } else {
        console.log('Admin password is already properly hashed');
      }
    } else {
      console.log('Creating admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('12345', 12);
      
      const adminUser = {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        email: 'admin@voiceagentcontrol.com',
        userType: 'Admin',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        settings: {
          two_fa_enabled: false,
          notifications_enabled: true
        },
        apiKeys: {}
      };
      
      const result = await usersCollection.insertOne(adminUser);
      console.log('Admin user created successfully with ID:', result.insertedId);
    }
    
    // List all users for verification
    console.log('\nAll users in database:');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.userType}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();
