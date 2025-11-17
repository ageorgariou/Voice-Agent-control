import express from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { 
  validateBody, 
  validateParams, 
  validationSchemas, 
  paramSchemas,
  rateLimit,
  sanitizeInput,
  securityHeaders
} from './validation.js';
import {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens
} from './auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(rateLimit);

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
app.post('/api/users', validateBody(validationSchemas.createUser), async (req, res) => {
  try {
    const userData = req.body;
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username: userData.username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email: userData.email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Hash the password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const newUser = {
      ...userData,
      password: hashedPassword, // Store hashed password
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
    
    // Remove password from response
    const { password, ...userResponse } = createdUser;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:username', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.username), async (req, res) => {
  try {
    const { username } = req.params;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ username, is_active: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userResponse } = user;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:username', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.username), validateBody(validationSchemas.updateUser), async (req, res) => {
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

app.delete('/api/users/:username', authenticateToken, requireAdmin, validateParams(paramSchemas.username), async (req, res) => {
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

app.put('/api/users/:username/api-key', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.username), validateBody(validationSchemas.updateApiKey), async (req, res) => {
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

app.get('/api/users/:username/api-key/:keyType', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.usernameAndKeyType), async (req, res) => {
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

app.put('/api/users/:username/2fa', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.username), validateBody(validationSchemas.update2FA), async (req, res) => {
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

app.get('/api/users/:username/2fa', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.username), async (req, res) => {
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

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({ is_active: true }).toArray();
    
    // Remove passwords from all user responses
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userResponse } = user;
      return userResponse;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin-only endpoint to create users (for management panel)
app.post('/api/admin/users', authenticateToken, requireAdmin, validateBody(validationSchemas.createUser), async (req, res) => {
  try {
    const userData = req.body;
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username: userData.username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email: userData.email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Hash the password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const newUser = {
      ...userData,
      password: hashedPassword,
      userType: userData.userType || 'User', // Default to User if not specified
      features: userData.features || {
        smsCampaigns: false,
        chatbotTranscripts: false,
        aiVideoGeneration: false,
      },
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      last_login: null,
      settings: {
        two_fa_enabled: false,
        notifications_enabled: true,
        ...userData.settings
      },
      apiKeys: {
        vapi_key: '',
        openai_key: '',
        elevenlabs_key: '',
        deepgram_key: '',
        ...userData.apiKeys
      }
    };

    const result = await usersCollection.insertOne(newUser);
    const createdUser = await usersCollection.findOne({ _id: result.insertedId });
    
    // Remove password from response
    const { password, ...userResponse } = createdUser;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:username/last-login', authenticateToken, requireOwnershipOrAdmin, validateParams(paramSchemas.username), async (req, res) => {
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

// Authentication endpoints
app.post('/api/auth/login', validateBody(validationSchemas.login), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`[LOGIN] Attempting login for username: ${username}`);
    
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username, is_active: true });
    
    if (!user) {
      console.log(`[LOGIN] User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`[LOGIN] User found: ${user.username}, userType: ${user.userType}`);
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log(`[LOGIN] Password verification failed for: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`[LOGIN] Password verified successfully for: ${username}`);
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    console.log(`[LOGIN] Tokens generated for: ${username}`);
    
    // Update last login
    await usersCollection.updateOne(
      { username, is_active: true },
      { 
        $set: { 
          last_login: new Date(),
          updated_at: new Date()
        }
      }
    );
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    console.log(`[LOGIN] Login successful for: ${username}`);
    
    res.json({ 
      message: 'Login successful',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('[LOGIN] Error during login:', error);
    console.error('[LOGIN] Error stack:', error.stack);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }
    
    const usersCollection = db.collection('users');
    const result = await refreshAccessToken(refreshToken, usersCollection);
    
    res.json({
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ 
      error: 'Invalid or expired refresh token',
      code: 'REFRESH_TOKEN_INVALID'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Logout from all devices endpoint
app.post('/api/auth/logout-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const revokedCount = revokeAllUserTokens(userId);
    
    res.json({ 
      message: 'Logged out from all devices successfully',
      revokedTokens: revokedCount
    });
  } catch (error) {
    console.error('Error during logout from all devices:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user profile (protected endpoint)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(req.user.userId), 
      is_active: true 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userResponse } = user;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Change password endpoint
app.put('/api/auth/change-password', authenticateToken, validateBody(validationSchemas.changePassword), async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username, is_active: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await usersCollection.updateOne(
      { username, is_active: true },
      { 
        $set: { 
          password: hashedNewPassword,
          updated_at: new Date()
        }
      }
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
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
