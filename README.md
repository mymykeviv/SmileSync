# SmileSync - Dental Clinic Management System

A comprehensive, production-ready dental clinic management system built with modern technologies. SmileSync provides a complete solution for managing patients, appointments, services, billing, and analytics in a desktop application.

## 🆕 Recent Updates (September 2025)

- **🔐 Role-Based Access Control**: Complete RBAC system with Administrator, Dentist, Assistant, Receptionist, and Staff roles
- **🎨 Medical Design System**: Professional medical-themed UI with Material-UI components
- **📱 Mobile-First Design**: Responsive interface optimized for tablets and mobile devices
- **🔒 Enhanced Security**: JWT authentication, secure login system, and session management
- **👨‍⚕️ Staff Management**: Comprehensive doctor and staff management with role assignments
- **📄 PDF Preview**: Interactive invoice preview system with embedded viewer
- **💰 INR Currency**: Complete conversion from USD to Indian Rupee (₹) across all components
- **🪟 Windows Deployment**: Offline installation package for Windows environments
- **🔧 Form Improvements**: Enhanced validation, error handling, and user guidance
- **📊 Dashboard Sync**: Timeline view synchronized with calendar date selection
- **⚠️ Advanced Error Handling**: Comprehensive error management system with user-friendly messages, network status monitoring, and graceful error recovery
- **🌐 Network Resilience**: Real-time connectivity detection, automatic retry mechanisms, and offline state management
- **✅ Form Validation**: Field-specific error messages across all forms with clear, actionable guidance

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete patient profiles with medical history, contact information, and treatment records
- **Appointment Scheduling**: Advanced booking system with conflict detection, rescheduling, and cancellation capabilities
- **Service & Product Catalog**: Comprehensive management of dental services and products with pricing
- **Invoice & Billing**: Automated invoice generation with PDF preview and download, payment tracking in INR (₹)
- **Analytics Dashboard**: Real-time clinic performance metrics with interactive charts and data export
- **PDF Preview System**: Interactive invoice preview before download with embedded viewer
- **Localized Currency**: Complete INR (Indian Rupee) support across all financial components
- **Doctor/Dentist Management**: Comprehensive staff management system with role-based permissions
- **Role-Based Access Control (RBAC)**: Multi-level permission system for different user roles
- **Clinic Configuration**: Configurable clinic details and settings management

### Security & Authentication
- **Secure Login System**: JWT-based authentication with session management
- **Role-Based Permissions**: Administrator, Dentist, Dental Assistant, Receptionist, and Staff roles
- **Authentication Guards**: Protected routes and API endpoints
- **Session Tracking**: Last login tracking and user activity monitoring

### Technical Features
- **Desktop Application**: Cross-platform Electron app for Windows, macOS, and Linux
- **Modern UI**: Responsive React-based interface with medical design system theme
- **Mobile-First Design**: Responsive design optimized for tablets and mobile devices
- **Robust Backend**: RESTful API with Node.js and Express
- **SQLite Database**: Lightweight, embedded database with Sequelize ORM
- **Comprehensive Testing**: Unit, integration, and end-to-end test coverage
- **Windows Offline Deployment**: Complete offline installation package for Windows environments
- **Advanced Error Handling**: Centralized error management with user-friendly messages and retry mechanisms
- **Network Resilience**: Real-time connectivity monitoring and graceful offline state management
- **Form Validation**: Field-specific error messages with clear guidance for user corrections

## 🏗️ Architecture

```
SmileSync/
├── app/                    # React frontend application
├── backend/               # Node.js API server
├── electron/              # Electron main process
├── tests/                 # Comprehensive test suite
├── scripts/               # Development and build scripts
└── docs/                  # Project documentation
```

## 🛠️ Technology Stack

- **Frontend**: React 18, Material-UI (MUI), CSS3, Recharts for analytics
- **UI Framework**: Material-UI with custom medical design system theme
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: SQLite3 with comprehensive schema
- **Desktop**: Electron with security preload scripts
- **Testing**: Jest, React Testing Library, Playwright
- **Build Tools**: npm scripts, cross-platform shell scripts
- **Deployment**: Windows offline installer, cross-platform scripts

## 📋 Prerequisites

- Node.js 16+ and npm
- Git
- Operating System: Windows 10+, macOS 10.14+, or Linux

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd SmileSync
npm install
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd app && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install testing dependencies (optional)
cd tests && npm install && cd ..
```

### 3. Development Mode
```bash
# Start the complete application in development mode
npm run electron:dev
```

This will:
- Start the React development server (http://localhost:3000)
- Launch the Node.js backend server (http://localhost:5001)
- Open the Electron desktop application
- Enable hot reloading for development

### 4. Production Build
```bash
# Build for production
npm run build

# Start production application
npm run electron:prod
```

## 📖 Usage

### Authentication & Access Control
1. **Login**: Use your credentials to access the system with role-based permissions
2. **User Roles**: Different access levels for Administrator, Dentist, Dental Assistant, Receptionist, and Staff
3. **Secure Sessions**: Automatic session management with JWT tokens
4. **Clinic Configuration**: Administrators can configure clinic details and settings

### Patient Management
1. Navigate to "Patients" to add new patients or edit existing profiles
2. View complete patient history and treatment records
3. Search and filter patients by various criteria
4. Access patient information based on your role permissions

### Doctor/Staff Management
1. **Staff Directory**: Manage dentists, assistants, and other clinic staff
2. **Role Assignment**: Assign appropriate roles and permissions to staff members
3. **Schedule Management**: View and manage staff schedules and availability

### Appointment Scheduling
1. Use "Appointments" to book new appointments with enhanced form validation
2. View calendar interface with conflict detection
3. Reschedule or cancel appointments as needed

### Service & Product Management
1. Access "Services" to manage dental procedures and pricing
2. Manage product inventory and pricing
3. Create service packages and bundles

### Billing & Invoicing
1. Generate invoices from appointments and services
2. Export invoices as PDF documents
3. Track payment status and history

### Analytics Dashboard
1. View real-time clinic performance metrics
2. Analyze revenue trends and patient statistics
3. Export reports for business analysis

## 🧪 Testing

### Run All Tests
```bash
cd tests
npm test              # Unit and integration tests
npm run test:coverage # Test coverage report
npm run test:e2e      # End-to-end tests
```

### Test Categories
- **Frontend Tests**: React component testing with Jest
- **Backend Tests**: API endpoint testing
- **E2E Tests**: Complete user journey testing with Playwright

## 📁 Project Structure

### Frontend (`/app`)
- React components organized by feature
- Responsive CSS with modern design patterns
- Service layer for API communication
- Utility functions and helpers

### Backend (`/backend`)
- RESTful API controllers
- Sequelize models and database schema
- Route definitions and middleware
- Database initialization and migrations

### Desktop (`/electron`)
- Electron main process configuration
- Window management and system integration
- Security and preload scripts

### Testing (`/tests`)
- Comprehensive test suite covering all features
- Jest configuration for unit/integration tests
- Playwright configuration for E2E tests
- Test utilities and mocks

## 🔧 Development Scripts

```bash
# Development
npm run electron:dev     # Start development environment
npm run start:frontend   # Frontend only
npm run start:backend    # Backend only

# Production
npm run build           # Build all components
npm run electron:prod   # Start production app

# Testing
npm run test           # Run all tests
npm run test:watch     # Watch mode testing

# Utilities
npm run clean          # Clean build artifacts
npm run lint           # Code linting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Review existing [issues](../../issues)
- Create a new issue for bugs or feature requests

## 🎯 Roadmap

### Recently Completed ✅
- [x] Role-Based Access Control (RBAC) system
- [x] Comprehensive authentication and security
- [x] PDF preview functionality with embedded viewer
- [x] Complete INR currency conversion
- [x] Doctor/Dentist management system
- [x] Medical design system theme
- [x] Mobile-first responsive design
- [x] Windows offline deployment package
- [x] Enhanced form validation and error handling
- [x] Dashboard timeline synchronization
- [x] Advanced error handling and user-friendly error messages
- [x] Network status monitoring and offline state management
- [x] Centralized error management system with retry mechanisms
- [x] Field-specific form validation across all components

### Upcoming Features 🚀
- [ ] Multi-clinic support
- [ ] Advanced reporting and analytics
- [ ] Integration with dental equipment
- [ ] Mobile companion app
- [ ] Cloud synchronization and backup
- [ ] Automated appointment reminders
- [ ] Treatment plan templates
- [ ] Insurance claim management

---

**SmileSync** - Making dental clinic management simple and efficient. 🦷✨

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/ae9a37b8-2ed0-4cb8-9874-085c1577a27e" />
