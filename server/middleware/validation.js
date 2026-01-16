import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for user updates
 */
export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('avatar')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Validate base64 image
      const base64Regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/;
      if (!base64Regex.test(value)) {
        throw new Error('Avatar must be a valid base64 image');
      }
      
      // Check size (max 500KB base64)
      const sizeInBytes = (value.length * 3) / 4;
      if (sizeInBytes > 500 * 1024) {
        throw new Error('Avatar size must be less than 500KB');
      }
      
      return true;
    }),
  
  body('role')
    .optional()
    .isIn(['client', 'owner', 'admin'])
    .withMessage('Invalid role'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

/**
 * Validation middleware for property creation
 */
export const validatePropertyCreate = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .escape(),
  
  body('location')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters')
    .escape(),
  
  body('price')
    .isNumeric()
    .toInt()
    .isInt({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('bedrooms')
    .isNumeric()
    .toInt()
    .isInt({ min: 0, max: 50 })
    .withMessage('Bedrooms must be between 0 and 50'),
  
  body('bathrooms')
    .isNumeric()
    .toInt()
    .isInt({ min: 0, max: 50 })
    .withMessage('Bathrooms must be between 0 and 50'),
  
  body('area')
    .isNumeric()
    .toInt()
    .isInt({ min: 1 })
    .withMessage('Area must be a positive number'),
  
  body('imageUrls')
    .isArray({ min: 1, max: 10 })
    .withMessage('Must provide between 1 and 10 images')
    .custom((images) => {
      // Validate each image is base64
      const base64Regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/;
      for (const img of images) {
        if (!base64Regex.test(img)) {
          throw new Error('All images must be valid base64 format');
        }
        
        // Check size (max 300KB per image)
        const sizeInBytes = (img.length * 3) / 4;
        if (sizeInBytes > 300 * 1024) {
          throw new Error('Each image must be less than 300KB');
        }
      }
      return true;
    }),
  
  body('features')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 features allowed'),
  
  body('features.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .escape(),
  
  body('status')
    .optional()
    .isIn(['active', 'suspended'])
    .withMessage('Invalid status')
];

/**
 * Middleware to check validation results
 */
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

/**
 * Sanitize string to prevent XSS
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};
