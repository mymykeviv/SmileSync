const ClinicConfig = require('../models/ClinicConfig');

/**
 * Get clinic configuration
 */
const getClinicConfig = async (req, res) => {
    try {
        const config = await ClinicConfig.getConfig();
        res.json({
            success: true,
            data: config.toJSON()
        });
    } catch (error) {
        console.error('Error fetching clinic config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clinic configuration',
            error: error.message
        });
    }
};

/**
 * Update clinic configuration
 */
const updateClinicConfig = async (req, res) => {
    try {
        const {
            clinicName,
            clinicSubtitle,
            contactPhone,
            clinicAddress,
            practiceName,
            email,
            website,
            logoUrl
        } = req.body;

        // Convert camelCase to snake_case for database
        const configData = {
            clinic_name: clinicName,
            clinic_subtitle: clinicSubtitle,
            contact_phone: contactPhone,
            clinic_address: clinicAddress,
            practice_name: practiceName,
            email: email,
            website: website,
            logo_url: logoUrl
        };

        const updatedConfig = await ClinicConfig.updateConfig(configData);
        
        res.json({
            success: true,
            message: 'Clinic configuration updated successfully',
            data: updatedConfig.toJSON()
        });
    } catch (error) {
        console.error('Error updating clinic config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update clinic configuration',
            error: error.message
        });
    }
};

module.exports = {
    getClinicConfig,
    updateClinicConfig
};