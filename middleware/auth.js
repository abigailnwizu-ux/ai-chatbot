// middleware/auth.js
const jwt = require('jsonwebtoken');
const { db } = require('../lib/db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with role information
    const userWithRole = await db.user.findUnique({
      where: { id: decoded.id },
      include: {
        memberships: {
          where: { workspace_id: decoded.workspaceId },
          include: {
            workspace: true
          }
        }
      }
    });

    if (!userWithRole || !userWithRole.memberships.length) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: userWithRole.id,
      email: userWithRole.email,
      name: userWithRole.name,
      workspaceId: decoded.workspaceId,
      role: userWithRole.memberships[0].role,
      workspace: userWithRole.memberships[0].workspace
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Specific role checkers
const requireAdmin = requireRole(['admin']);
const requireManager = requireRole(['admin', 'manager']);
const requireContributor = requireRole(['admin', 'manager', 'contributor']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  requireContributor
};
