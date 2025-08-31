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
                message: 'Service not found'
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
            message: 'Failed to retrieve service',
            error: error.message
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
                message: 'Service not found'
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
            message: 'Failed to retrieve service',
            error: error.message
        });
    }
};

// Create new service
exports.createService = async (req, res) => {
    try {
        const serviceData = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'category', 'price', 'duration'];
        for (const field of requiredFields) {
            if (!serviceData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
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
            message: 'Failed to create service',
            error: error.message
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
                message: 'Service not found'
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
            message: 'Failed to update service',
            error: error.message
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
                message: 'Service not found'
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
            message: 'Failed to update service status',
            error: error.message
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
                message: 'Service not found'
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
            message: 'Failed to delete service',
            error: error.message
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
            message: 'Failed to retrieve service categories',
            error: error.message
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
            message: 'Failed to retrieve service statistics',
            error: error.message
        });
    }
};