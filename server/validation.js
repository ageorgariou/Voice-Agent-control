import Joi from 'joi';

// Common validation schemas
const commonSchemas = {
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required'
    }),

  email: Joi.string()
    .email()
    .max(254)
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email cannot exceed 254 characters'
    }),

  name: Joi.string()
    .min(1)
    .max(100)
    .pattern(new RegExp('^[a-zA-Z\\s\\-\']+$'))
    .messages({
      'string.min': 'Name cannot be empty',
      'string.max': 'Name cannot exceed 100 characters',
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }),

  userType: Joi.string()
    .valid('Admin', 'User')
    .default('User')
    .messages({
      'any.only': 'User type must be either Admin or User'
    }),

  apiKey: Joi.string()
    .min(10)
    .max(500)
    .pattern(new RegExp('^[A-Za-z0-9\\-_\\.]+$'))
    .messages({
      'string.min': 'API key must be at least 10 characters long',
      'string.max': 'API key cannot exceed 500 characters',
      'string.pattern.base': 'API key contains invalid characters'
    }),

  keyType: Joi.string()
    .valid('vapi_key', 'openai_key', 'elevenlabs_key', 'deepgram_key')
    .required()
    .messages({
      'any.only': 'Key type must be one of: vapi_key, openai_key, elevenlabs_key, deepgram_key',
      'any.required': 'Key type is required'
    }),

  boolean: Joi.boolean()
    .messages({
      'boolean.base': 'Value must be true or false'
    })
};

// Validation schemas for different endpoints
export const validationSchemas = {
  // User creation
  createUser: Joi.object({
    username: commonSchemas.username,
    password: commonSchemas.password,
    name: commonSchemas.name.required(),
    email: commonSchemas.email.required(),
    userType: commonSchemas.userType,
    features: Joi.object({
      smsCampaigns: commonSchemas.boolean.optional(),
      chatbotTranscripts: commonSchemas.boolean.optional(),
      aiVideoGeneration: commonSchemas.boolean.optional()
    }).optional(),
    settings: Joi.object({
      two_fa_enabled: commonSchemas.boolean,
      notifications_enabled: commonSchemas.boolean
    }).optional(),
    apiKeys: Joi.object({
      vapi_key: commonSchemas.apiKey.optional().allow(''),
      openai_key: commonSchemas.apiKey.optional().allow(''),
      elevenlabs_key: commonSchemas.apiKey.optional().allow(''),
      deepgram_key: commonSchemas.apiKey.optional().allow('')
    }).optional()
  }).options({ stripUnknown: true }),

  // User update
  updateUser: Joi.object({
    name: commonSchemas.name.optional(),
    email: commonSchemas.email.optional(),
    userType: commonSchemas.userType.optional(),
    features: Joi.object({
      smsCampaigns: commonSchemas.boolean.optional(),
      chatbotTranscripts: commonSchemas.boolean.optional(),
      aiVideoGeneration: commonSchemas.boolean.optional()
    }).optional(),
    settings: Joi.object({
      two_fa_enabled: commonSchemas.boolean,
      notifications_enabled: commonSchemas.boolean
    }).optional(),
    apiKeys: Joi.object({
      vapi_key: commonSchemas.apiKey.optional().allow(''),
      openai_key: commonSchemas.apiKey.optional().allow(''),
      elevenlabs_key: commonSchemas.apiKey.optional().allow(''),
      deepgram_key: commonSchemas.apiKey.optional().allow('')
    }).optional()
  }).options({ stripUnknown: true }).min(1),

  // Login
  login: Joi.object({
    username: commonSchemas.username,
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Change password
  changePassword: Joi.object({
    username: commonSchemas.username,
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: commonSchemas.password
  }),

  // API key update
  updateApiKey: Joi.object({
    keyType: commonSchemas.keyType,
    apiKey: commonSchemas.apiKey.required()
  }),

  // 2FA update
  update2FA: Joi.object({
    enabled: commonSchemas.boolean.required()
  })
};

// Parameter validation schemas
export const paramSchemas = {
  username: Joi.object({
    username: commonSchemas.username
  }),
  
  usernameAndKeyType: Joi.object({
    username: commonSchemas.username,
    keyType: commonSchemas.keyType
  })
};

// Validation middleware factory
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ 
        error: 'Validation error',
        message: errorMessage,
        field: error.details[0].path.join('.')
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Parameter validation middleware factory
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ 
        error: 'Invalid parameter',
        message: errorMessage,
        field: error.details[0].path.join('.')
      });
    }
    
    // Replace req.params with validated data
    req.params = value;
    next();
  };
};

// Rate limiting helper (basic implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

export const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = requestCounts.get(clientIP);
  
  if (now > clientData.resetTime) {
    // Reset the counter
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize strings in request body
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      // Remove potential XSS characters and trim whitespace
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};
