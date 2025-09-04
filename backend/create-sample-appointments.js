const database = require('./database/init');
const { Appointment, Patient, User } = require('./models');

async function createSampleAppointments() {
    try {
        console.log('Creating sample appointments...');
        
        // Create a sample patient first
        const patientData = {
            patient_number: 'P001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-0123',
            date_of_birth: '1990-01-15',
            gender: 'male',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip_code: '12345'
        };
        
        const patient = new Patient(patientData);
        await patient.save();
        console.log('Created patient:', patient.id);
        
        // Create a sample dentist user
        const dentistData = {
            username: 'dr.smith',
            email: 'dr.smith@clinic.com',
            password: 'password123',
            first_name: 'Sarah',
            last_name: 'Smith',
            role: 'dentist',
            phone: '555-0456'
        };
        
        const dentist = new User(dentistData);
        await dentist.save();
        console.log('Created dentist:', dentist.id);
        
        // Create sample appointments
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointments = [
            {
                patient_id: patient.id,
                dentist_id: dentist.id,
                appointment_date: today.toISOString().split('T')[0],
                appointment_time: '09:00:00',
                duration_minutes: 60,
                status: 'scheduled',
                appointment_type: 'consultation',
                chief_complaint: 'Regular checkup'
            },
            {
                patient_id: patient.id,
                dentist_id: dentist.id,
                appointment_date: today.toISOString().split('T')[0],
                appointment_time: '14:00:00',
                duration_minutes: 30,
                status: 'confirmed',
                appointment_type: 'cleaning',
                chief_complaint: 'Dental cleaning'
            },
            {
                patient_id: patient.id,
                dentist_id: dentist.id,
                appointment_date: tomorrow.toISOString().split('T')[0],
                appointment_time: '10:30:00',
                duration_minutes: 90,
                status: 'scheduled',
                appointment_type: 'treatment',
                chief_complaint: 'Tooth pain'
            }
        ];
        
        for (const appointmentData of appointments) {
            const appointment = new Appointment(appointmentData);
            await appointment.save();
            console.log('Created appointment:', appointment.appointment_number);
        }
        
        console.log('Sample appointments created successfully!');
        
        // Query and display the created appointments
        const allAppointments = await Appointment.findAll(10, 0);
        console.log('\nCreated appointments:');
        allAppointments.forEach(apt => {
            console.log(`- ${apt.appointment_number}: ${apt.patient_first_name} ${apt.patient_last_name} with Dr. ${apt.dentist_first_name} ${apt.dentist_last_name}`);
        });
        
    } catch (error) {
        console.error('Error creating sample appointments:', error);
    } finally {
        process.exit(0);
    }
}

createSampleAppointments();