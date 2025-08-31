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

async function migratePasswords() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'voice_agent_db');
    const usersCollection = db.collection('users');
    
    console.log('🔄 Starting password migration...');
    
    // Find users with plain text passwords (passwords that don't start with $2b$ which is bcrypt hash format)
    const usersWithPlainPasswords = await usersCollection.find({
      password: { $exists: true, $not: /^\$2b\$/ }
    }).toArray();
    
    console.log(`Found ${usersWithPlainPasswords.length} users with plain text passwords`);
    
    if (usersWithPlainPasswords.length === 0) {
      console.log('✅ No users need password migration');
      return;
    }
    
    const saltRounds = 12;
    let migratedCount = 0;
    
    for (const user of usersWithPlainPasswords) {
      try {
        // Hash the existing plain text password
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        // Update the user with hashed password
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: hashedPassword,
              updated_at: new Date()
            }
          }
        );
        
        migratedCount++;
        console.log(`✅ Migrated password for user: ${user.username}`);
      } catch (error) {
        console.error(`❌ Failed to migrate password for user ${user.username}:`, error);
      }
    }
    
    console.log(`🎉 Migration completed! ${migratedCount}/${usersWithPlainPasswords.length} passwords migrated successfully`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

// Run migration
migratePasswords();
