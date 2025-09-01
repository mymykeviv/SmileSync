const Service = require('../models/Service');

// Get all services with search, filter, and pagination
exports.getAllServices = async (req, res) => {
    try {
        const {
            search,
            category,
            status,
            sortBy = 'name',
            sortOrder = 'asc',
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;
        const options = {
            search,
            category,
            status,
            sortBy,
            sortOrder,
            limit: parseInt(limit),
            offset
        };

        const services = await Service.findAll(options);
        const totalCount = await Service.getCount(options);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: services.map(service => service.toJSON()),
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve services',
            error: error.message
        });
    }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
                code: 'SERVICE_NOT_FOUND',
                details: { serviceId: id }
            });
        }

        res.json({
            success: true,
            data: service.toJSON()
        });
    } catch (error) {
        console.error('Error getting service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve service due to database error',
            code: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
        });
    }
};

// Get service by service code
exports.getServiceByCode = async (req, res) => {
    try {
        const { serviceCode } = req.params;
        const service = await Service.findByServiceCode(serviceCode);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
                code: 'SERVICE_NOT_FOUND',
                details: { serviceCode }
            });
        }

        res.json({
            success: true,
            data: service.toJSON()
        });
    } catch (error) {
        console.error('Error getting service by code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve service due to database error',
            code: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
        });
    }
};

// Create new service
exports.createService = async (req, res) => {
    try {
        const serviceData = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'category', 'base_price', 'duration_minutes'];
        const missingFields = requiredFields.filter(field => !serviceData[field]);
        
        if (missingFields.length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed: Missing required fields',
                error: {
                    code: 'VALIDATION_ERROR',
                    details: {
                        missingFields,
                        message: `Required fields are missing: ${missingFields.join(', ')}`
                    }
                },
                timestamp: new Date().toISOString()
            });
        }

        // Generate service code if not provided
        if (!serviceData.service_code) {
            serviceData.service_code = await Service.generateServiceCode();
        }

        const service = new Service(serviceData);
        await service.save();

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service.toJSON()
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create service due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};

// Update service
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    details: {
                        serviceId: id,
                        message: 'The requested service does not exist'
                    }
                },
                timestamp: new Date().toISOString()
            });
        }

        // Update service properties
        Object.assign(service, updateData);
        await service.update();

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service.toJSON()
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};

// Toggle service status
exports.toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    details: {
                        serviceId: id,
                        message: 'The requested service does not exist'
                    }
                },
                timestamp: new Date().toISOString()
            });
        }

        service.is_active = !service.is_active;
        await service.update();

        res.json({
            success: true,
            message: `Service ${service.is_active ? 'activated' : 'deactivated'} successfully`,
            data: service.toJSON()
        });
    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service status due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};

// Delete service
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    details: {
                        serviceId: id,
                        message: 'The requested service does not exist'
                    }
                },
                timestamp: new Date().toISOString()
            });
        }

        await service.delete();

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete service due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};

// Get service categories
exports.getServiceCategories = async (req, res) => {
    try {
        const categories = await Service.getCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error getting service categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve service categories due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};

// Get service statistics
exports.getServiceStats = async (req, res) => {
    try {
        const stats = await Service.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting service statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve service statistics due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};