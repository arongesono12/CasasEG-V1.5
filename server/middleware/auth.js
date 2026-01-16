/**
 * Authentication middleware
 * Verifies user role for protected routes
 */

/**
 * Middleware to verify user is authenticated
 * In a real app, this would verify JWT tokens
 * For now, we check if userId is provided in headers
 */
export const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  req.userId = userId;
  next();
};

/**
 * Middleware to verify user has specific role
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles 
      });
    }
    
    req.userRole = userRole;
    next();
  };
};

/**
 * Middleware to verify user owns the resource
 */
export const requireOwnership = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const resourceOwnerId = req.body.ownerId || req.params.ownerId;
  
  if (userId !== resourceOwnerId) {
    return res.status(403).json({ 
      error: 'You can only modify your own resources' 
    });
  }
  
  next();
};
