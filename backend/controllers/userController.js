const { User } = require('../models');
const { validationResult } = require('express-validator');
const { convertUserToBackend, convertUserToFrontend } = require('../utils/fieldMapping');

class UserController {
    /**
     * Get all users with optional filters
     */
    static async getUsers(req, res) {
        try {
            const {
                page = 1,
                limit = 50,
                role,
                search,
                active_only = 'true'
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            let users;

            if (search) {
                users = await User.search(search, parseInt(limit), offset);
            } else if (role) {
                users = await User.findByRole(role, parseInt(limit), offset);
            } else if (active_only === 'true') {
                users = await User.findAllActive(parseInt(limit), offset);
            } else {
                users = await User.findAll(parseInt(limit), offset);
            }

            // Convert to frontend format
            const formattedUsers = users.map(user => convertUserToFrontend(user));

            res.json({
                success: true,
                data: formattedUsers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(users.length / parseInt(limit)),
                    totalCount: users.length
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
                error: error.message
            });
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: convertUserToFrontend(user)
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user',
                error: error.message
            });
        }
    }

    /**
     * Get all dentists
     */
    static async getDentists(req, res) {
        try {
            const {
                page = 1,
                limit = 50
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const dentists = await User.getDentists(parseInt(limit), offset);

            // Convert to frontend format
            const formattedDentists = dentists.map(dentist => convertUserToFrontend(dentist));

            res.json({
                success: true,
                data: formattedDentists,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(dentists.length / parseInt(limit)),
                    totalCount: dentists.length
                }
            });
        } catch (error) {
            console.error('Error fetching dentists:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dentists',
                error: error.message
            });
        }
    }

    /**
     * Create a new user
     */
    static async createUser(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            // Convert frontend data to backend format
            const userData = convertUserToBackend(req.body);

            // Check if username already exists
            const usernameExists = await User.usernameExists(userData.username);
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            // Check if email already exists
            const emailExists = await User.emailExists(userData.email);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Hash password
            if (userData.password) {
                userData.password_hash = await User.hashPassword(userData.password);
                delete userData.password; // Remove plain password
            }

            // Create user
            const user = new User(userData);
            await user.save();

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: convertUserToFrontend(user)
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: error.message
            });
        }
    }

    /**
     * Update user
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            // Find user
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Convert frontend data to backend format
            const updateData = convertUserToBackend(req.body);

            // Check username uniqueness if changed
            if (updateData.username && updateData.username !== user.username) {
                const usernameExists = await User.usernameExists(updateData.username, id);
                if (usernameExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username already exists'
                    });
                }
            }

            // Check email uniqueness if changed
            if (updateData.email && updateData.email !== user.email) {
                const emailExists = await User.emailExists(updateData.email, id);
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }

            // Update user properties
            Object.assign(user, updateData);
            await user.update();

            res.json({
                success: true,
                message: 'User updated successfully',
                data: convertUserToFrontend(user)
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error.message
            });
        }
    }

    /**
     * Update user password
     */
    static async updatePassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password is required'
                });
            }

            // Find user
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update password
            await user.updatePassword(newPassword);

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update password',
                error: error.message
            });
        }
    }

    /**
     * Deactivate user
     */
    static async deactivateUser(req, res) {
        try {
            const { id } = req.params;

            // Find user
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Deactivate user
            await user.deactivate();

            res.json({
                success: true,
                message: 'User deactivated successfully',
                data: convertUserToFrontend(user)
            });
        } catch (error) {
            console.error('Error deactivating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to deactivate user',
                error: error.message
            });
        }
    }

    /**
     * Activate user
     */
    static async activateUser(req, res) {
        try {
            const { id } = req.params;

            // Find user
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Activate user
            await user.activate();

            res.json({
                success: true,
                message: 'User activated successfully',
                data: convertUserToFrontend(user)
            });
        } catch (error) {
            console.error('Error activating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to activate user',
                error: error.message
            });
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(req, res) {
        try {
            const { id } = req.params;
            const { start_date, end_date } = req.query;

            // Find user
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get user statistics
            const stats = await user.getStats(start_date, end_date);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user statistics',
                error: error.message
            });
        }
    }

    /**
     * Get role statistics
     */
    static async getRoleStats(req, res) {
        try {
            const roleStats = await User.getCountByRole();

            res.json({
                success: true,
                data: roleStats
            });
        } catch (error) {
            console.error('Error fetching role stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch role statistics',
                error: error.message
            });
        }
    }
}

module.exports = UserController;