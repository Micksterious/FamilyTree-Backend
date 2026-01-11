const express = require("express");
const router = express.Router();
const { User } = require("../database");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify token and extract user
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ==================== GET ROUTES ====================

// Test route
router.get("/test", (_req, res) => {
  res.json({ message: "Users route is working!" });
});

// GET all users (admin only)
router.get("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET current user info (any authenticated user)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET single user by ID (admin only)
router.get("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});



// ==================== UPDATE ROUTES ====================

// PUT update user role (admin only)
router.put("/:id/role", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent changing your own role
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: "Role updated successfully", 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// PUT update user details (admin only)
router.put("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
    }

    // Prevent changing your own role
    if (role && parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    // Check if username is taken (if changing)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    // Check if email is taken (if changing)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already taken" });
      }
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.json({ 
      message: "User updated successfully", 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// PATCH update user password (admin or own account)
router.patch("/:id/password", authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    // Check if user is updating their own password or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to change this password" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user is changing their own password, verify current password
    if (userId === req.user.id) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password required" });
      }
      if (!user.checkPassword(currentPassword)) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    // Update password
    user.passwordHash = User.hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ==================== DELETE ROUTES ====================

// DELETE user (admin only)
router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    
    res.json({ 
      message: "User deleted successfully",
      deletedUser: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;