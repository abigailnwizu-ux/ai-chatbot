// routes/auth.js

const {authenticateToken,requireAdmin }= require('../middleware/auth');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { db } = require('../lib/db');

const router = express.Router();

// Validation schemas

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(1),
  role: z.enum(['admin', 'manager', 'contributor', 'viewer']).default('admin')
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['manager', 'contributor', 'viewer'])
});

// Register new user and workspace (always creates admin)

router.post('/register', async (req, res) => {
  req.session.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: 'admin',
      workspaceId: result.workspace.id
    };
  try {
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const { name, email, password, workspaceName, role } = validation.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName }
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword
        }
      });

      // First user becomes admin

      await tx.workspaceMembership.create({
        data: {
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin' // First user is always admin
        }
      });

      return { user, workspace };
    });

    const token = jwt.sign(
      { 
        id: result.user.id, 
        workspaceId: result.workspace.id,
        email: result.user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: 'admin'
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});


// Login

router.post('/login', async (req, res) => {
  req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
      workspaceId: workspace.id
    };
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const { email, password } = validation.data;

    const user = await db.user.findUnique({ 
      where: { email },
      include: {
        memberships: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const workspace = user.memberships[0]?.workspace;
    const userRole = user.memberships[0]?.role;

    if (!workspace) {
      return res.status(400).json({ error: 'No workspace found' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        workspaceId: workspace.id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole
      },
      workspace: {
        id: workspace.id,
        name: workspace.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
 

// Admin only: Invite user to workspace

router.post('/invite', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validation = InviteUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const { email, role } = validation.data;
    const workspaceId = req.user.workspaceId;

    // Check if user exists

    let user = await db.user.findUnique({ where: { email } });
    
    if (!user) {

      // Create user without password (they'll set it later)

      user = await db.user.create({
        data: {
          email,
          name: email.split('@')[0] // Default name
        }
      });
    }

    // Check if user is already in workspace

    const existingMembership = await db.workspaceMembership.findFirst({
      where: {
        workspace_id: workspaceId,
        user_id: user.id
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'User already in workspace' });
    }

    // Add user to workspace
    
    await db.workspaceMembership.create({
      data: {
        workspace_id: workspaceId,
        user_id: user.id,
        role: role
      }
    });

    // TODO: Send invitation email in real implementation

    res.json({
      success: true,
      message: `User invited as ${role}`,
      user: {
        id: user.id,
        email: user.email,
        role: role
      }
    });

  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Invitation failed' });
  }
});

module.exports = router;
