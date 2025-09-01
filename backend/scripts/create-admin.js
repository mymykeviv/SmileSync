const User = require('../models/User');
const database = require('../database/init');

async function createAdminUser() {
    try {
        // Initialize database connection
        await database.init();
        
        // Check if admin user already exists
        const existingAdmin = await User.findByUsername('admin');
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await User.hashPassword('admin123');
        
        const adminUser = new User({
            username: 'admin',
            email: 'admin@smilesync.com',
            password_hash: hashedPassword,
            first_name: 'System',
            last_name: 'Administrator',
            role: 'admin',
            phone: '(555) 123-4567',
            is_active: true
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Role: admin');
        
        // Create a dentist user for testing
        const existingDentist = await User.findByUsername('drsmith');
        if (!existingDentist) {
            const dentistPassword = await User.hashPassword('dentist123');
            
            const dentistUser = new User({
                username: 'drsmith',
                email: 'drsmith@smilesync.com',
                password_hash: dentistPassword,
                first_name: 'John',
                last_name: 'Smith',
                role: 'dentist',
                phone: '(555) 123-4568',
                is_active: true
            });

            await dentistUser.save();
            console.log('Dentist user created successfully!');
            console.log('Username: drsmith');
            console.log('Password: dentist123');
            console.log('Role: dentist');
        }
        
        // Create a staff user for testing
        const existingStaff = await User.findByUsername('staff');
        if (!existingStaff) {
            const staffPassword = await User.hashPassword('staff123');
            
            const staffUser = new User({
                username: 'staff',
                email: 'staff@smilesync.com',
                password_hash: staffPassword,
                first_name: 'Jane',
                last_name: 'Doe',
                role: 'receptionist',
                phone: '(555) 123-4569',
                is_active: true
            });

            await staffUser.save();
            console.log('Staff user created successfully!');
            console.log('Username: staff');
            console.log('Password: staff123');
            console.log('Role: receptionist');
        }
        
    } catch (error) {
        console.error('Error creating users:', error);
    } finally {
        // Close database connection
        if (database.db) {
            database.db.close();
        }
        process.exit(0);
    }
}

// Run the script
createAdminUser();