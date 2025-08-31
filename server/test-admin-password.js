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

async function testAdminPassword() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'voice_agent_db');
    const usersCollection = db.collection('users');
    
    // Get admin user
    const admin = await usersCollection.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password hash:', admin.password);
    console.log('Is active:', admin.is_active);
    
    // Test password comparison
    const testPassword = '12345';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log(`Password "${testPassword}" is valid:`, isValid);
    
    // Test with different possible passwords
    const testPasswords = ['12345', 'admin', 'password', 'Admin123'];
    
    console.log('\nTesting different passwords:');
    for (const pwd of testPasswords) {
      const valid = await bcrypt.compare(pwd, admin.password);
      console.log(`"${pwd}": ${valid}`);
    }
    
    // Create a fresh hash of '12345' and update if needed
    console.log('\nCreating fresh hash for "12345":');
    const freshHash = await bcrypt.hash('12345', 12);
    console.log('Fresh hash:', freshHash);
    
    const freshIsValid = await bcrypt.compare('12345', freshHash);
    console.log('Fresh hash validates correctly:', freshIsValid);
    
    // Update admin password with fresh hash
    console.log('\nUpdating admin password with fresh hash...');
    await usersCollection.updateOne(
      { username: 'admin' },
      { 
        $set: { 
          password: freshHash,
          updated_at: new Date()
        }
      }
    );
    console.log('Admin password updated successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testAdminPassword();
