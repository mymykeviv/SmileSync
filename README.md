# SmileSync - Dental Clinic Management System

A comprehensive, production-ready dental clinic management system built with modern technologies. SmileSync provides a complete solution for managing patients, appointments, services, billing, and analytics in a desktop application.

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete patient profiles with medical history, contact information, and treatment records
- **Appointment Scheduling**: Advanced booking system with conflict detection, rescheduling, and cancellation capabilities
- **Service & Product Catalog**: Comprehensive management of dental services and products with pricing
- **Invoice & Billing**: Automated invoice generation with PDF preview and download, payment tracking in INR (₹)
- **Analytics Dashboard**: Real-time clinic performance metrics with interactive charts and data export
- **PDF Preview System**: Interactive invoice preview before download with embedded viewer
- **Localized Currency**: Complete INR (Indian Rupee) support across all financial components

### Technical Features
- **Desktop Application**: Cross-platform Electron app for Windows, macOS, and Linux
- **Modern UI**: Responsive React-based interface with professional design
- **Robust Backend**: RESTful API with Node.js and Express
- **SQLite Database**: Lightweight, embedded database with Sequelize ORM
- **Comprehensive Testing**: Unit, integration, and end-to-end test coverage

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

- **Frontend**: React 18, CSS3, Recharts for analytics
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: SQLite3
- **Desktop**: Electron
- **Testing**: Jest, React Testing Library, Playwright
- **Build Tools**: npm scripts, cross-platform shell scripts

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

### Patient Management
1. Navigate to "Patients" to add new patients or edit existing profiles
2. View complete patient history and treatment records
3. Search and filter patients by various criteria

### Appointment Scheduling
1. Use "Appointments" to book new appointments
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

- [ ] Multi-clinic support
- [ ] Advanced reporting features
- [ ] Integration with dental equipment
- [ ] Mobile companion app
- [ ] Cloud synchronization

---

**SmileSync** - Making dental clinic management simple and efficient. 🦷✨

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/ae9a37b8-2ed0-4cb8-9874-085c1577a27e" />
