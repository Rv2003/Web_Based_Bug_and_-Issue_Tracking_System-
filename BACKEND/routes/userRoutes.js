const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'task_tracker_jwt_secret_key';

// Standard role permissions map
const ROLE_PERMISSIONS = {
    admin: ['manage_users', 'manage_projects', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_analytics'],
    manager: ['manage_projects', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_analytics'],
    member: ['create_tasks', 'edit_tasks', 'view_analytics'],
    viewer: ['view_analytics']
};

// Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decodedUser;
        next();
    });
};

// Middleware: Optional Authentication (allows identifying user if token provided, but doesn't hard-block)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
            if (!err) {
                req.user = decodedUser;
            }
            next();
        });
    } else {
        next();
    }
};

// Helper: Format user for client response
const formatUser = (user) => {
    const username = user.email ? user.email.split('@')[0].toLowerCase() : user._id.toString();
    const systemRole = user.systemRole || (user.email === 'admin@example.com' || user.email === 'priya@example.com' ? 'admin' : 'member');
    const permissions = (user.permissions && user.permissions.length > 0)
        ? user.permissions
        : (ROLE_PERMISSIONS[systemRole] || ROLE_PERMISSIONS.member);

    return {
        id: username,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        systemRole: systemRole,
        permissions: permissions,
        status: user.status || 'active',
        capacity: user.capacity || 14,
        createdAt: user.createdAt
    };
};

// -------------------------------------------------------------
// Public / Standard Routes
// -------------------------------------------------------------

// Get all users (excluding password)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        const formatted = users.map(formatUser);
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is suspended
        if (user.status === 'suspended') {
            return res.status(403).json({ 
                message: 'This account has been suspended by an administrator. Please contact support.' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const formatted = formatUser(user);

        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                systemRole: formatted.systemRole,
                permissions: formatted.permissions
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: formatted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register new user (public signup)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, capacity, systemRole } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const userRole = (role && role.trim()) ? role.trim() : 'Software engineer';
        const assignedSystemRole = ['admin', 'manager', 'member', 'viewer'].includes(systemRole) ? systemRole : 'member';
        const permissions = ROLE_PERMISSIONS[assignedSystemRole];
        const userCapacity = (capacity !== undefined && capacity !== null && !isNaN(Number(capacity)))
            ? Math.max(1, Math.min(40, Number(capacity)))
            : 14;

        const user = new User({
            name: name.trim(),
            email: cleanEmail,
            password,
            role: userRole,
            systemRole: assignedSystemRole,
            permissions,
            status: 'active',
            capacity: userCapacity
        });

        await user.save();

        const formatted = formatUser(user);

        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                systemRole: formatted.systemRole,
                permissions: formatted.permissions
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: formatted
        });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Registration failed' });
    }
});

// -------------------------------------------------------------
// Admin Management Routes
// -------------------------------------------------------------

// Admin: Create new user directly
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { name, email, password, role, systemRole, permissions, capacity, status } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const assignedSystemRole = ['admin', 'manager', 'member', 'viewer'].includes(systemRole) ? systemRole : 'member';
        const assignedPermissions = Array.isArray(permissions) && permissions.length > 0 
            ? permissions 
            : (ROLE_PERMISSIONS[assignedSystemRole] || ROLE_PERMISSIONS.member);

        const user = new User({
            name: name.trim(),
            email: cleanEmail,
            password: password && password.length >= 6 ? password : 'password123',
            role: (role && role.trim()) ? role.trim() : 'Software engineer',
            systemRole: assignedSystemRole,
            permissions: assignedPermissions,
            status: status === 'suspended' ? 'suspended' : 'active',
            capacity: (capacity && !isNaN(Number(capacity))) ? Number(capacity) : 14
        });

        const savedUser = await user.save();
        res.status(201).json(formatUser(savedUser));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Update user details, role, permissions, status
router.put('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, systemRole, permissions, capacity, status, password } = req.body;

        // Try finding by MongoDB _id or by email prefix
        let user = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ email: new RegExp(`^${id}@`, 'i') });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name && name.trim()) user.name = name.trim();
        if (email && email.trim()) {
            const cleanEmail = email.toLowerCase().trim();
            if (cleanEmail !== user.email) {
                const existing = await User.findOne({ email: cleanEmail });
                if (existing) {
                    return res.status(400).json({ message: 'Email address is already in use' });
                }
                user.email = cleanEmail;
            }
        }
        if (role && role.trim()) user.role = role.trim();
        if (systemRole && ['admin', 'manager', 'member', 'viewer'].includes(systemRole)) {
            user.systemRole = systemRole;
        }
        if (Array.isArray(permissions)) {
            user.permissions = permissions;
        }
        if (capacity !== undefined && !isNaN(Number(capacity))) {
            user.capacity = Math.max(1, Math.min(40, Number(capacity)));
        }
        if (status && ['active', 'suspended'].includes(status)) {
            user.status = status;
        }
        if (password && password.length >= 6) {
            user.password = password; // pre('save') will hash it
        }

        await user.save();
        res.status(200).json(formatUser(user));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Update user status only (active / suspended)
router.patch('/:id/status', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        let user = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ email: new RegExp(`^${id}@`, 'i') });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        await user.save();

        res.status(200).json({ message: `User status changed to ${status}`, user: formatUser(user) });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Update user systemRole and permissions
router.patch('/:id/permissions', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { systemRole, permissions } = req.body;

        let user = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ email: new RegExp(`^${id}@`, 'i') });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (systemRole && ['admin', 'manager', 'member', 'viewer'].includes(systemRole)) {
            user.systemRole = systemRole;
        }

        if (Array.isArray(permissions)) {
            user.permissions = permissions;
        } else if (systemRole && ROLE_PERMISSIONS[systemRole]) {
            user.permissions = ROLE_PERMISSIONS[systemRole];
        }

        await user.save();
        res.status(200).json(formatUser(user));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Delete user
router.delete('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        let user = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ email: new RegExp(`^${id}@`, 'i') });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-deletion if current requester is this user
        if (req.user && req.user.id && req.user.id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account while logged in' });
        }

        await User.findByIdAndDelete(user._id);
        res.status(200).json({ message: 'User deleted successfully', id: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
