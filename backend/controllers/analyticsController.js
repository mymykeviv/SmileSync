const { Appointment } = require('../models/Appointment');
const { Patient } = require('../models/Patient');
const { Invoice } = require('../models/Invoice');
const { Service } = require('../models/Service');
const { Product } = require('../models/Product');
const { Op } = require('sequelize');

/**
 * Get dashboard overview metrics
 */
const getDashboardOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get total patients
    const totalPatients = await Patient.count();
    
    // Get new patients in date range
    const newPatients = await Patient.count({
      where: {
        created_at: {
          [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
        }
      }
    });

    // Get appointments in date range
    const totalAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.between]: [start, end]
        }
      }
    });

    // Get completed appointments
    const completedAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.between]: [start, end]
        },
        status: 'completed'
      }
    });

    // Get cancelled appointments
    const cancelledAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.between]: [start, end]
        },
        status: 'cancelled'
      }
    });

    // Get total revenue from invoices
    const revenueResult = await Invoice.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
        },
        status: 'paid'
      }
    });
    const totalRevenue = revenueResult || 0;

    // Get pending invoices amount
    const pendingRevenueResult = await Invoice.sum('total_amount', {
      where: {
        status: 'pending'
      }
    });
    const pendingRevenue = pendingRevenueResult || 0;

    res.json({
      overview: {
        totalPatients,
        newPatients,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingRevenue: parseFloat(pendingRevenue.toFixed(2)),
        appointmentCompletionRate: totalAppointments > 0 ? 
          parseFloat(((completedAppointments / totalAppointments) * 100).toFixed(1)) : 0
      },
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
};

/**
 * Get appointment analytics
 */
const getAppointmentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get appointments by status
    const appointmentsByStatus = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.between]: [start, end]
        }
      },
      attributes: [
        'status',
        [Appointment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    // Get appointments by day for trend analysis
    const appointmentsByDay = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.between]: [start, end]
        }
      },
      attributes: [
        'appointment_date',
        [Appointment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['appointment_date'],
      order: [['appointment_date', 'ASC']]
    });

    // Get most popular services
    const popularServices = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.between]: [start, end]
        },
        service_id: {
          [Op.ne]: null
        }
      },
      attributes: [
        'service_id',
        [Appointment.sequelize.fn('COUNT', '*'), 'count']
      ],
      include: [{
        model: Service,
        attributes: ['name', 'price']
      }],
      group: ['service_id', 'Service.id'],
      order: [[Appointment.sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10
    });

    res.json({
      appointmentsByStatus: appointmentsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      })),
      appointmentsByDay: appointmentsByDay.map(item => ({
        date: item.appointment_date,
        count: parseInt(item.dataValues.count)
      })),
      popularServices: popularServices.map(item => ({
        serviceId: item.service_id,
        serviceName: item.Service?.name || 'Unknown Service',
        count: parseInt(item.dataValues.count),
        revenue: item.Service ? parseFloat((item.Service.price * parseInt(item.dataValues.count)).toFixed(2)) : 0
      })),
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error getting appointment analytics:', error);
    res.status(500).json({ error: 'Failed to get appointment analytics' });
  }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get revenue by day
    const revenueByDay = await Invoice.findAll({
      where: {
        created_at: {
          [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
        },
        status: 'paid'
      },
      attributes: [
        [Invoice.sequelize.fn('DATE', Invoice.sequelize.col('created_at')), 'date'],
        [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('total_amount')), 'revenue']
      ],
      group: [Invoice.sequelize.fn('DATE', Invoice.sequelize.col('created_at'))],
      order: [[Invoice.sequelize.fn('DATE', Invoice.sequelize.col('created_at')), 'ASC']]
    });

    // Get revenue by payment method
    const revenueByPaymentMethod = await Invoice.findAll({
      where: {
        created_at: {
          [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
        },
        status: 'paid'
      },
      attributes: [
        'payment_method',
        [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('total_amount')), 'revenue'],
        [Invoice.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['payment_method']
    });

    // Get average invoice amount
    const avgInvoiceAmount = await Invoice.findOne({
      where: {
        created_at: {
          [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
        },
        status: 'paid'
      },
      attributes: [
        [Invoice.sequelize.fn('AVG', Invoice.sequelize.col('total_amount')), 'average']
      ]
    });

    res.json({
      revenueByDay: revenueByDay.map(item => ({
        date: item.dataValues.date,
        revenue: parseFloat(parseFloat(item.dataValues.revenue).toFixed(2))
      })),
      revenueByPaymentMethod: revenueByPaymentMethod.map(item => ({
        paymentMethod: item.payment_method || 'Unknown',
        revenue: parseFloat(parseFloat(item.dataValues.revenue).toFixed(2)),
        count: parseInt(item.dataValues.count)
      })),
      averageInvoiceAmount: parseFloat(parseFloat(avgInvoiceAmount?.dataValues?.average || 0).toFixed(2)),
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({ error: 'Failed to get revenue analytics' });
  }
};

/**
 * Get patient analytics
 */
const getPatientAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get new patients by day
    const newPatientsByDay = await Patient.findAll({
      where: {
        created_at: {
          [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
        }
      },
      attributes: [
        [Patient.sequelize.fn('DATE', Patient.sequelize.col('created_at')), 'date'],
        [Patient.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [Patient.sequelize.fn('DATE', Patient.sequelize.col('created_at'))],
      order: [[Patient.sequelize.fn('DATE', Patient.sequelize.col('created_at')), 'ASC']]
    });

    // Get patient age distribution
    const currentYear = new Date().getFullYear();
    const patientAgeDistribution = await Patient.findAll({
      attributes: [
        [Patient.sequelize.literal(`
          CASE 
            WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) < 18 THEN 'Under 18'
            WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 18 AND 30 THEN '18-30'
            WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 31 AND 50 THEN '31-50'
            WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 51 AND 70 THEN '51-70'
            ELSE 'Over 70'
          END
        `), 'ageGroup'],
        [Patient.sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        date_of_birth: {
          [Op.ne]: null
        }
      },
      group: [Patient.sequelize.literal(`
        CASE 
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) < 18 THEN 'Under 18'
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 18 AND 30 THEN '18-30'
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 31 AND 50 THEN '31-50'
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 51 AND 70 THEN '51-70'
          ELSE 'Over 70'
        END
      `)]
    });

    // Get patient gender distribution
    const patientGenderDistribution = await Patient.findAll({
      attributes: [
        'gender',
        [Patient.sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        gender: {
          [Op.ne]: null
        }
      },
      group: ['gender']
    });

    res.json({
      newPatientsByDay: newPatientsByDay.map(item => ({
        date: item.dataValues.date,
        count: parseInt(item.dataValues.count)
      })),
      patientAgeDistribution: patientAgeDistribution.map(item => ({
        ageGroup: item.dataValues.ageGroup,
        count: parseInt(item.dataValues.count)
      })),
      patientGenderDistribution: patientGenderDistribution.map(item => ({
        gender: item.gender || 'Not specified',
        count: parseInt(item.dataValues.count)
      })),
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error getting patient analytics:', error);
    res.status(500).json({ error: 'Failed to get patient analytics' });
  }
};

/**
 * Export analytics data as CSV
 */
const exportAnalytics = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    let csvData = '';
    let filename = 'analytics_export.csv';

    switch (type) {
      case 'appointments':
        const appointments = await Appointment.findAll({
          where: {
            appointment_date: {
              [Op.between]: [start, end]
            }
          },
          include: [
            { model: Patient, attributes: ['first_name', 'last_name'] },
            { model: Service, attributes: ['name', 'price'] }
          ],
          order: [['appointment_date', 'ASC']]
        });
        
        csvData = 'Date,Time,Patient,Service,Status,Notes\n';
        appointments.forEach(apt => {
          const patientName = apt.Patient ? `${apt.Patient.first_name} ${apt.Patient.last_name}` : 'Unknown';
          const serviceName = apt.Service ? apt.Service.name : 'No service';
          csvData += `${apt.appointment_date},${apt.appointment_time},"${patientName}","${serviceName}",${apt.status},"${apt.notes || ''}"\n`;
        });
        filename = `appointments_${start}_to_${end}.csv`;
        break;

      case 'revenue':
        const invoices = await Invoice.findAll({
          where: {
            created_at: {
              [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
            }
          },
          include: [{ model: Patient, attributes: ['first_name', 'last_name'] }],
          order: [['created_at', 'ASC']]
        });
        
        csvData = 'Date,Patient,Amount,Status,Payment Method,Description\n';
        invoices.forEach(inv => {
          const patientName = inv.Patient ? `${inv.Patient.first_name} ${inv.Patient.last_name}` : 'Unknown';
          const date = new Date(inv.created_at).toISOString().split('T')[0];
          csvData += `${date},"${patientName}",${inv.total_amount},${inv.status},${inv.payment_method || 'Not specified'},"${inv.description || ''}"\n`;
        });
        filename = `revenue_${start}_to_${end}.csv`;
        break;

      case 'patients':
        const patients = await Patient.findAll({
          where: {
            created_at: {
              [Op.between]: [start + ' 00:00:00', end + ' 23:59:59']
            }
          },
          order: [['created_at', 'ASC']]
        });
        
        csvData = 'Registration Date,Name,Email,Phone,Date of Birth,Gender\n';
        patients.forEach(patient => {
          const date = new Date(patient.created_at).toISOString().split('T')[0];
          csvData += `${date},"${patient.first_name} ${patient.last_name}",${patient.email || ''},${patient.phone || ''},${patient.date_of_birth || ''},${patient.gender || ''}\n`;
        });
        filename = `patients_${start}_to_${end}.csv`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
};

module.exports = {
  getDashboardOverview,
  getAppointmentAnalytics,
  getRevenueAnalytics,
  getPatientAnalytics,
  exportAnalytics
};