import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// In-memory storage for refresh tokens (in production, use Redis or database)
const refreshTokens = new Set();

/**
 * Generate JWT access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    userType: user.userType,
    email: user.email
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'voice-agent-control',
    audience: 'voice-agent-users'
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    type: 'refresh'
  };
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'voice-agent-control',
    audience: 'voice-agent-users'
  });
  
  // Store refresh token
  refreshTokens.add(refreshToken);
  
  return refreshToken;
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'voice-agent-control',
      audience: 'voice-agent-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Middleware to authenticate requests
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'Admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

/**
 * Middleware to check if user can access resource (own data or admin)
 */
export const requireOwnershipOrAdmin = (req, res, next) => {
  const { username } = req.params;
  
  if (req.user.userType === 'Admin' || req.user.username === username) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Access denied. You can only access your own data.',
      code: 'ACCESS_DENIED'
    });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken, usersCollection) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if refresh token exists in our store
    if (!refreshTokens.has(refreshToken)) {
      throw new Error('Refresh token not found or revoked');
    }
    
    // Check if it's actually a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    // Get user from database
    const user = await usersCollection.findOne({ 
      _id: decoded.userId, 
      is_active: true 
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    return {
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        userType: user.userType,
        settings: user.settings,
        created_at: user.created_at,
        last_login: user.last_login
      }
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Revoke refresh token (logout)
 */
export const revokeRefreshToken = (refreshToken) => {
  refreshTokens.delete(refreshToken);
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export const revokeAllUserTokens = (userId) => {
  const tokensToRevoke = [];
  
  for (const token of refreshTokens) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.userId === userId) {
        tokensToRevoke.push(token);
      }
    } catch (error) {
      // Invalid token, remove it
      tokensToRevoke.push(token);
    }
  }
  
  tokensToRevoke.forEach(token => refreshTokens.delete(token));
  return tokensToRevoke.length;
};

/**
 * Clean up expired refresh tokens
 */
export const cleanupExpiredTokens = () => {
  const tokensToRemove = [];
  
  for (const token of refreshTokens) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Token is expired or invalid, mark for removal
      tokensToRemove.push(token);
    }
  }
  
  tokensToRemove.forEach(token => refreshTokens.delete(token));
  return tokensToRemove.length;
};

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
