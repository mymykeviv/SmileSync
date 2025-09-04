const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const { PERMISSIONS } = require('../config/permissions');
const { 
    authenticateToken, 
    requirePermission, 
    requireAnyPermission,
    requireOwnership 
} = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const userValidation = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('first_name')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters')
        .trim(),
    body('last_name')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters')
        .trim(),
    body('role')
        .isIn(['admin', 'dentist', 'assistant', 'receptionist', 'staff'])
        .withMessage('Role must be one of: admin, dentist, assistant, receptionist, staff'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('license_number')
        .optional()
        .isLength({ max: 50 })
        .withMessage('License number must be less than 50 characters')
        .trim(),
    body('specialization')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Specialization must be less than 100 characters')
        .trim()
];

const passwordValidation = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const updateUserValidation = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('first_name')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be less than 50 characters')
        .trim(),
    body('last_name')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be less than 50 characters')
        .trim(),
    body('role')
        .optional()
        .isIn(['admin', 'dentist', 'assistant', 'receptionist', 'staff'])
        .withMessage('Role must be one of: admin, dentist, assistant, receptionist, staff'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('license_number')
        .optional()
        .isLength({ max: 50 })
        .withMessage('License number must be less than 50 characters')
        .trim(),
    body('specialization')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Specialization must be less than 100 characters')
        .trim()
];

// Routes

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filters
 * @access  Private (Admin/Manager)
 * @query   page, limit, role, search, active_only
 */
router.get('/', 
    authenticateToken, 
    requireAnyPermission(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE), 
    UserController.getUsers
);

/**
 * @route   GET /api/users/dentists
 * @desc    Get all dentists
 * @access  Private
 * @query   page, limit
 */
router.get('/dentists', 
    authenticateToken, 
    UserController.getDentists
);

/**
 * @route   GET /api/users/stats/roles
 * @desc    Get user count by role
 * @access  Private (Admin)
 */
router.get('/stats/roles', 
    authenticateToken, 
    requirePermission(PERMISSIONS.ANALYTICS_VIEW), 
    UserController.getRoleStats
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', 
    authenticateToken, 
    requireAnyPermission(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE), 
    UserController.getUserById
);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Private
 * @query   start_date, end_date
 */
router.get('/:id/stats', 
    authenticateToken, 
    requireAnyPermission(PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.USERS_VIEW), 
    UserController.getUserStats
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin)
 * @body    username, email, password, first_name, last_name, role, phone?, license_number?, specialization?
 */
router.post('/', 
    authenticateToken, 
    requirePermission(PERMISSIONS.USERS_CREATE), 
    [...userValidation, ...passwordValidation], 
    UserController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or Self)
 * @body    username?, email?, first_name?, last_name?, role?, phone?, license_number?, specialization?
 */
router.put('/:id', 
    authenticateToken, 
    requireAnyPermission(PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_MANAGE), 
    updateUserValidation, 
    UserController.updateUser
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Private (Admin or Self)
 * @body    newPassword
 */
router.put('/:id/password', 
    authenticateToken, 
    requireOwnership('id'), 
    [
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    ], 
    UserController.updatePassword
);

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Private (Admin)
 */
router.put('/:id/deactivate', 
    authenticateToken, 
    requirePermission(PERMISSIONS.USERS_MANAGE), 
    UserController.deactivateUser
);

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate user
 * @access  Private (Admin)
 */
router.put('/:id/activate', 
    authenticateToken, 
    requirePermission(PERMISSIONS.USERS_MANAGE), 
    UserController.activateUser
);

module.exports = router;