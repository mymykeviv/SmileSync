const database = require('../database/init');

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
    const totalPatientsResult = await database.get('SELECT COUNT(*) as count FROM patients WHERE is_active = 1');
    const totalPatients = totalPatientsResult.count;
    
    // Get new patients in date range
    const newPatientsResult = await database.get(
      'SELECT COUNT(*) as count FROM patients WHERE created_at BETWEEN ? AND ? AND is_active = 1',
      [start + ' 00:00:00', end + ' 23:59:59']
    );
    const newPatients = newPatientsResult.count;

    // Convert date strings to timestamps for comparison
    const startDateObj = new Date(start);
    startDateObj.setHours(0, 0, 0, 0);
    const startTimestamp = startDateObj.getTime();
    
    const endDateObj = new Date(end);
    endDateObj.setHours(23, 59, 59, 999);
    const endTimestamp = endDateObj.getTime();

    // Get appointments in date range
    const totalAppointmentsResult = await database.get(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ?',
      [startTimestamp, endTimestamp]
    );
    const totalAppointments = totalAppointmentsResult.count;

    // Get completed appointments
    const completedAppointmentsResult = await database.get(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? AND status = ?',
      [startTimestamp, endTimestamp, 'completed']
    );
    const completedAppointments = completedAppointmentsResult.count;

    // Get cancelled appointments
    const cancelledAppointmentsResult = await database.get(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? AND status = ?',
      [startTimestamp, endTimestamp, 'cancelled']
    );
    const cancelledAppointments = cancelledAppointmentsResult.count;

    // Get total revenue from invoices
    const revenueResult = await database.get(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE created_at BETWEEN ? AND ? AND status = ?',
      [start + ' 00:00:00', end + ' 23:59:59', 'paid']
    );
    const totalRevenue = revenueResult.total || 0;

    // Get pending invoices amount
    const pendingRevenueResult = await database.get(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status = ?',
      ['pending']
    );
    const pendingRevenue = pendingRevenueResult.total || 0;

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

    // Convert date strings to timestamps for comparison
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end + ' 23:59:59').getTime();

    // Get appointments by status
    const appointmentsByStatus = await database.all(
      'SELECT status, COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY status',
      [startTimestamp, endTimestamp]
    );

    // Get appointments by day for trend analysis
    const appointmentsByDay = await database.all(
      'SELECT appointment_date, COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY appointment_date ORDER BY appointment_date ASC',
      [startTimestamp, endTimestamp]
    );

    // Get popular services from invoice items
    const popularServices = await database.all(
      `SELECT 
        ii.description as service_name,
        SUM(ii.quantity) as count,
        SUM(ii.total_price) as revenue
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.invoice_date BETWEEN ? AND ?
        AND ii.item_type = 'service'
        AND i.status = 'paid'
      GROUP BY ii.description
      ORDER BY count DESC
      LIMIT 10`,
      [start, end]
    );

    res.json({
      appointmentsByStatus: appointmentsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count)
      })),
      appointmentsByDay: appointmentsByDay.map(item => ({
        date: item.appointment_date,
        count: parseInt(item.count)
      })),
      popularServices: popularServices.map(item => ({
        serviceName: item.service_name,
        count: parseInt(item.count),
        revenue: parseFloat(item.revenue || 0)
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
    const revenueByDay = await database.all(
      'SELECT DATE(created_at) as date, SUM(total_amount) as revenue FROM invoices WHERE created_at BETWEEN ? AND ? AND status = ? GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC',
      [start + ' 00:00:00', end + ' 23:59:59', 'paid']
    );

    // Get revenue by payment method from payments table
    const revenueByPaymentMethod = await database.all(
      'SELECT payment_method, SUM(amount) as revenue, COUNT(*) as count FROM payments WHERE payment_date BETWEEN ? AND ? GROUP BY payment_method',
      [start, end]
    );

    // Get average invoice amount
    const avgInvoiceAmountResult = await database.get(
      'SELECT AVG(total_amount) as average FROM invoices WHERE created_at BETWEEN ? AND ? AND status = ?',
      [start + ' 00:00:00', end + ' 23:59:59', 'paid']
    );

    res.json({
      revenueByDay: revenueByDay.map(item => ({
        date: item.date,
        revenue: parseFloat(parseFloat(item.revenue || 0).toFixed(2))
      })),
      revenueByPaymentMethod: revenueByPaymentMethod.map(item => ({
        paymentMethod: item.payment_method || 'Unknown',
        revenue: parseFloat(parseFloat(item.revenue || 0).toFixed(2)),
        count: parseInt(item.count)
      })),
      averageInvoiceAmount: parseFloat(parseFloat(avgInvoiceAmountResult?.average || 0).toFixed(2)),
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
    const newPatientsByDay = await database.all(
      'SELECT DATE(created_at) as date, COUNT(*) as count FROM patients WHERE created_at BETWEEN ? AND ? GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC',
      [start + ' 00:00:00', end + ' 23:59:59']
    );

    // Get patient age distribution
    const currentYear = new Date().getFullYear();
    const patientAgeDistribution = await database.all(
      `SELECT 
        CASE 
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) < 18 THEN 'Under 18'
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 18 AND 30 THEN '18-30'
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 31 AND 50 THEN '31-50'
          WHEN (${currentYear} - CAST(SUBSTR(date_of_birth, 1, 4) AS INTEGER)) BETWEEN 51 AND 70 THEN '51-70'
          ELSE 'Over 70'
        END as ageGroup,
        COUNT(*) as count
      FROM patients 
      WHERE date_of_birth IS NOT NULL 
      GROUP BY ageGroup`
    );

    // Get patient gender distribution
    const patientGenderDistribution = await database.all(
      'SELECT gender, COUNT(*) as count FROM patients WHERE gender IS NOT NULL GROUP BY gender'
    );

    res.json({
      newPatientsByDay: newPatientsByDay.map(item => ({
        date: item.date,
        count: parseInt(item.count)
      })),
      patientAgeDistribution: patientAgeDistribution.map(item => ({
        ageGroup: item.ageGroup,
        count: parseInt(item.count)
      })),
      patientGenderDistribution: patientGenderDistribution.map(item => ({
        gender: item.gender || 'Not specified',
        count: parseInt(item.count)
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
        const appointments = await database.all(`
          SELECT 
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.notes,
            p.first_name,
            p.last_name,
            s.name as service_name
          FROM appointments a
          LEFT JOIN patients p ON a.patient_id = p.id
          LEFT JOIN services s ON a.service_id = s.id
          WHERE a.appointment_date BETWEEN ? AND ?
          ORDER BY a.appointment_date ASC
        `, [start, end]);
        
        csvData = 'Date,Time,Patient,Service,Status,Notes\n';
        appointments.forEach(apt => {
          const patientName = apt.first_name && apt.last_name ? `${apt.first_name} ${apt.last_name}` : 'Unknown';
          const serviceName = apt.service_name || 'No service';
          csvData += `${apt.appointment_date},${apt.appointment_time},"${patientName}","${serviceName}",${apt.status},"${apt.notes || ''}"\n`;
        });
        filename = `appointments_${start}_to_${end}.csv`;
        break;

      case 'revenue':
        const invoices = await database.all(`
          SELECT 
            i.created_at,
            i.total_amount,
            i.status,
            i.payment_method,
            i.description,
            p.first_name,
            p.last_name
          FROM invoices i
          LEFT JOIN patients p ON i.patient_id = p.id
          WHERE i.created_at BETWEEN ? AND ?
          ORDER BY i.created_at ASC
        `, [start + ' 00:00:00', end + ' 23:59:59']);
        
        csvData = 'Date,Patient,Amount,Status,Payment Method,Description\n';
        invoices.forEach(inv => {
          const patientName = inv.first_name && inv.last_name ? `${inv.first_name} ${inv.last_name}` : 'Unknown';
          const date = new Date(inv.created_at).toISOString().split('T')[0];
          csvData += `${date},"${patientName}",${inv.total_amount},${inv.status},${inv.payment_method || 'Not specified'},"${inv.description || ''}"\n`;
        });
        filename = `revenue_${start}_to_${end}.csv`;
        break;

      case 'patients':
        const patients = await database.all(`
          SELECT 
            created_at,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender
          FROM patients
          WHERE created_at BETWEEN ? AND ?
          ORDER BY created_at ASC
        `, [start + ' 00:00:00', end + ' 23:59:59']);
        
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

/**
 * Get billing analytics
 */
const getBillingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get revenue by payment method
    const revenueByMethod = await database.all(
      'SELECT payment_method as method, SUM(amount) as amount FROM payments WHERE payment_date BETWEEN ? AND ? GROUP BY payment_method',
      [start, end]
    );

    // Get outstanding invoices
    const outstandingResult = await database.get(
      'SELECT COUNT(*) as count, SUM(total_amount) as amount FROM invoices WHERE status IN ("pending", "overdue")'
    );

    // Get overdue invoices
    const overdueResult = await database.get(
      'SELECT SUM(total_amount) as amount FROM invoices WHERE status = "overdue"'
    );

    // Get due soon invoices (due within 7 days)
    const dueSoonDate = new Date();
    dueSoonDate.setDate(dueSoonDate.getDate() + 7);
    const dueSoonResult = await database.get(
      'SELECT SUM(total_amount) as amount FROM invoices WHERE status = "pending" AND due_date <= ?',
      [dueSoonDate.toISOString().split('T')[0]]
    );

    res.json({
      revenueByMethod: revenueByMethod.map(item => ({
        method: item.method || 'Cash',
        amount: parseFloat(parseFloat(item.amount || 0).toFixed(2))
      })),
      outstandingCount: outstandingResult.count || 0,
      outstandingAmount: parseFloat(parseFloat(outstandingResult.amount || 0).toFixed(2)),
      overdueAmount: parseFloat(parseFloat(overdueResult.amount || 0).toFixed(2)),
      dueSoonAmount: parseFloat(parseFloat(dueSoonResult.amount || 0).toFixed(2)),
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error getting billing analytics:', error);
    res.status(500).json({ error: 'Failed to get billing analytics' });
  }
};

/**
 * Get payment analytics
 */
const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get payment status breakdown
    const statusBreakdown = await database.all(
      'SELECT status, COUNT(*) as value FROM invoices WHERE created_at BETWEEN ? AND ? GROUP BY status',
      [start + ' 00:00:00', end + ' 23:59:59']
    );

    // Get collection rate trend (mock data for now)
    const collectionTrend = [];
    const days = 30;
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate collection rate for this date
      const totalInvoicesResult = await database.get(
        'SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = ?',
        [dateStr]
      );
      
      const paidInvoicesResult = await database.get(
        'SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = ? AND status = "paid"',
        [dateStr]
      );
      
      const totalInvoices = totalInvoicesResult.count || 0;
      const paidInvoices = paidInvoicesResult.count || 0;
      const rate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
      
      collectionTrend.push({
        date: dateStr,
        rate: parseFloat(rate.toFixed(1))
      });
    }

    res.json({
      statusBreakdown: statusBreakdown.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.value
      })),
      collectionTrend,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error getting payment analytics:', error);
    res.status(500).json({ error: 'Failed to get payment analytics' });
  }
};

module.exports = {
  getDashboardOverview,
  getAppointmentAnalytics,
  getRevenueAnalytics,
  getPatientAnalytics,
  getBillingAnalytics,
  getPaymentAnalytics,
  exportAnalytics
};