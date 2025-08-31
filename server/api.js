import express from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME || 'voice_agent_db');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// User API routes
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const usersCollection = db.collection('users');
    
    const newUser = {
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      settings: {
        two_fa_enabled: false,
        notifications_enabled: true,
        ...userData.settings
      },
      apiKeys: userData.apiKeys || {}
    };

    const result = await usersCollection.insertOne(newUser);
    const createdUser = await usersCollection.findOne({ _id: result.insertedId });
    
    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ username, is_active: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;
    const usersCollection = db.collection('users');
    
    const updateData = {
      ...updates,
      updated_at: new Date()
    };

    await usersCollection.updateOne(
      { username, is_active: true },
      { $set: updateData }
    );

    const updatedUser = await usersCollection.findOne({ username, is_active: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const usersCollection = db.collection('users');
    
    await usersCollection.updateOne(
      { username },
      { 
        $set: { 
          is_active: false,
          updated_at: new Date()
        }
      }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/users/:username/api-key', async (req, res) => {
  try {
    const { username } = req.params;
    const { keyType, apiKey } = req.body;
    const usersCollection = db.collection('users');
    
    await usersCollection.updateOne(
      { username, is_active: true },
      { 
        $set: { 
          [`apiKeys.${keyType}`]: apiKey,
          updated_at: new Date()
        }
      }
    );

    res.json({ message: 'API key updated successfully' });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

app.get('/api/users/:username/api-key/:keyType', async (req, res) => {
  try {
    const { username, keyType } = req.params;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(
      { username, is_active: true },
      { projection: { apiKeys: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ apiKey: user.apiKeys?.[keyType] || '' });
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({ error: 'Failed to fetch API key' });
  }
});

app.put('/api/users/:username/2fa', async (req, res) => {
  try {
    const { username } = req.params;
    const { enabled } = req.body;
    const usersCollection = db.collection('users');
    
    await usersCollection.updateOne(
      { username, is_active: true },
      { 
        $set: { 
          'settings.two_fa_enabled': enabled,
          updated_at: new Date()
        }
      }
    );

    res.json({ message: '2FA status updated successfully' });
  } catch (error) {
    console.error('Error updating 2FA status:', error);
    res.status(500).json({ error: 'Failed to update 2FA status' });
  }
});

app.get('/api/users/:username/2fa', async (req, res) => {
  try {
    const { username } = req.params;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(
      { username, is_active: true },
      { projection: { settings: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ enabled: user.settings?.two_fa_enabled || false });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    res.status(500).json({ error: 'Failed to fetch 2FA status' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({ is_active: true }).toArray();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:username/last-login', async (req, res) => {
  try {
    const { username } = req.params;
    const usersCollection = db.collection('users');
    
    await usersCollection.updateOne(
      { username, is_active: true },
      { 
        $set: { 
          last_login: new Date(),
          updated_at: new Date()
        }
      }
    );

    res.json({ message: 'Last login updated successfully' });
  } catch (error) {
    console.error('Error updating last login:', error);
    res.status(500).json({ error: 'Failed to update last login' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 API server running on http://localhost:${port}`);
  });
});

export default app;
