# SmileSync Frontend Application

The React-based frontend application for SmileSync dental clinic management system. Built with modern React patterns, Material-UI design system, role-based access control, and comprehensive user interface components.

## 🆕 Recent Updates (January 2025)

- **🔐 Authentication System**: JWT-based login with secure session management
- **👥 Role-Based Access Control**: Administrator, Dentist, Assistant, Receptionist, and Staff roles
- **🎨 Material-UI Integration**: Professional medical design system with consistent theming
- **📱 Mobile-First Design**: Responsive interface optimized for tablets and mobile devices
- **🛡️ Error Boundaries**: Comprehensive error handling and recovery mechanisms
- **📄 PDF Preview**: Interactive invoice preview with embedded PDF viewer
- **💰 INR Currency**: Complete conversion to Indian Rupee (₹) across all components
- **🔧 Enhanced Forms**: Improved validation, error messaging, and user guidance
- **👨‍⚕️ Staff Management**: Doctor and staff management with role assignments
- **📊 Dashboard Sync**: Timeline view synchronized with calendar date selection

## 🏗️ Architecture

```
app/
├── public/                 # Static assets and HTML template
│   ├── index.html         # Main HTML template
│   └── README.md          # Public assets documentation
├── src/
│   ├── App.js             # Main application component with routing
│   ├── index.js           # Application entry point
│   ├── components/        # Reusable UI components
│   │   ├── Layout/        # Application layout and navigation
│   │   ├── Common/        # Shared components (buttons, forms, etc.)
│   │   └── UI/            # Basic UI elements
│   ├── views/             # Page-level components
│   │   ├── Dashboard/     # Main dashboard view
│   │   ├── Patients/      # Patient management views
│   │   ├── Appointments/  # Appointment scheduling views
│   │   ├── Services/      # Service catalog management
│   │   ├── Invoices/      # Billing and invoice views
│   │   └── Analytics/     # Analytics dashboard
│   ├── services/          # API communication layer
│   │   ├── api.js         # Base API configuration
│   │   ├── patientService.js
│   │   ├── appointmentService.js
│   │   ├── serviceService.js
│   │   ├── invoiceService.js
│   │   └── analyticsService.js
│   ├── styles/            # CSS stylesheets
│   │   ├── global.css     # Global styles and variables
│   │   ├── components/    # Component-specific styles
│   │   └── views/         # View-specific styles
│   └── utils/             # Utility functions and helpers
│       ├── dateUtils.js   # Date formatting and manipulation
│       ├── validation.js  # Form validation helpers
│       └── constants.js   # Application constants
└── package.json           # Dependencies and scripts
```

## 🚀 Features

### Core Components
- **Authentication System**: Secure login with JWT tokens and session management
- **Role-Based Access Control**: Multi-level permissions for different user roles
- **Layout System**: Responsive navigation with sidebar and header
- **Dashboard**: Overview cards with key metrics and timeline synchronization
- **Patient Management**: CRUD operations with search, filtering, and role-based access
- **Appointment Scheduling**: Calendar interface with conflict detection and enhanced forms
- **Staff Management**: Doctor and staff directory with role assignments
- **Service Catalog**: Management of dental services and products with INR pricing
- **Invoice Generation**: Billing interface with PDF preview and export
- **Analytics Dashboard**: Interactive charts and data visualization

### UI/UX Features
- **Material-UI Design**: Professional medical theme with consistent components
- **Responsive Design**: Mobile-first approach optimized for tablets and phones
- **Modern Interface**: Clean, professional dental clinic aesthetic
- **Interactive Charts**: Recharts integration for analytics
- **Enhanced Form Validation**: Real-time validation with improved error messaging
- **Loading States**: Skeleton screens and loading indicators
- **Error Boundaries**: Comprehensive error handling and recovery
- **PDF Preview**: Embedded PDF viewer for invoices and documents
- **Currency Support**: Complete INR (₹) integration across all financial components

## 🛠️ Technology Stack

- **React 18**: Latest React with hooks and functional components
- **Material-UI (MUI)**: Professional design system with medical theme
- **React Router**: Client-side routing for SPA navigation with protected routes
- **JWT Authentication**: Secure token-based authentication system
- **Recharts**: Chart library for analytics visualization
- **PDF.js**: Embedded PDF preview functionality
- **Date-fns**: Modern date manipulation and formatting
- **CSS3**: Modern CSS with Flexbox, Grid, and Material-UI theming
- **Fetch API**: HTTP client with authentication headers

## 📋 Prerequisites

- Node.js 16+ and npm
- Backend server running on port 5001

## 🚀 Development Setup

### Install Dependencies
```bash
cd app
npm install
```

### Development Server
```bash
# Start development server (port 3000)
npm start

# Start with specific port
PORT=3001 npm start
```

### Production Build
```bash
# Create optimized production build
npm run build

# Serve production build locally
npx serve -s build
```

## 📁 Component Structure

### Layout Components
- **Layout.js**: Main application layout with navigation
- **Header.js**: Top navigation bar with user actions
- **Sidebar.js**: Side navigation menu
- **Footer.js**: Application footer

### View Components
- **Dashboard.js**: Main dashboard with overview cards
- **Patients.js**: Patient list and management interface
- **PatientForm.js**: Add/edit patient form
- **Appointments.js**: Appointment calendar and list view
- **AppointmentForm.js**: Appointment booking form
- **Services.js**: Service and product catalog
- **ServiceForm.js**: Add/edit service form
- **Invoices.js**: Invoice list and management
- **InvoiceForm.js**: Invoice creation and editing
- **Analytics.js**: Analytics dashboard with charts

### Common Components
- **ErrorBoundary.js**: Application-wide error boundary for crash recovery
- **ProtectedRoute.js**: Route protection based on authentication and roles
- **Button.js**: Reusable Material-UI button components
- **Input.js**: Enhanced form input components with validation
- **Modal.js**: Material-UI modal dialog component
- **Table.js**: Data table component with sorting and filtering
- **Card.js**: Material-UI content card component
- **LoadingSpinner.js**: Loading indicator with skeleton screens
- **ErrorMessage.js**: Enhanced error display component
- **PDFPreview.js**: Embedded PDF viewer component
- **CurrencyDisplay.js**: INR currency formatting component

## 🔌 API Integration

### Service Layer
The application uses a service layer pattern for API communication:

```javascript
// Example: patientService.js
export const patientService = {
  getAll: () => fetch('/api/patients').then(res => res.json()),
  getById: (id) => fetch(`/api/patients/${id}`).then(res => res.json()),
  create: (data) => fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  // ... other methods
};
```

### API Endpoints
- **Patients**: `/api/patients/*`
- **Appointments**: `/api/appointments/*`
- **Services**: `/api/services/*`
- **Products**: `/api/products/*`
- **Invoices**: `/api/invoices/*`
- **Analytics**: `/api/analytics/*`

## 🎨 Styling Guidelines

### CSS Organization
- **Global styles**: Base styles, variables, and resets
- **Component styles**: Scoped styles for specific components
- **Utility classes**: Helper classes for common patterns

### Design System
- **Colors**: Professional blue and white theme
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent margin and padding scale
- **Breakpoints**: Mobile-first responsive design

### CSS Variables
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --background-color: #f8fafc;
  --text-color: #1e293b;
  --border-color: #e2e8f0;
}
```

## 🧪 Testing

### Component Testing
```bash
# Run component tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: ARIA and keyboard navigation
- **Visual Tests**: Component rendering verification

## 🔧 Development Scripts

```bash
# Development
npm start              # Start development server
npm run dev            # Alternative development command

# Building
npm run build          # Create production build
npm run build:analyze  # Analyze bundle size

# Testing
npm test               # Run test suite
npm run test:watch     # Watch mode testing
npm run test:coverage  # Coverage report

# Linting
npm run lint           # ESLint code checking
npm run lint:fix       # Auto-fix linting issues

# Utilities
npm run clean          # Clean build artifacts
npm run eject          # Eject from Create React App
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly interface elements
- Collapsible navigation menu
- Optimized form layouts
- Swipe gestures for tables

## 🔒 Security Considerations

- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Role-Based Access Control**: Multi-level permissions (Administrator, Dentist, Assistant, Receptionist, Staff)
- **Protected Routes**: Route-level security based on authentication and user roles
- **Input Sanitization**: All user inputs are validated and sanitized
- **XSS Prevention**: Proper escaping of dynamic content
- **CSRF Protection**: Token-based request validation
- **Secure Communication**: HTTPS-only in production
- **Session Management**: Automatic logout on token expiration
- **Error Boundaries**: Secure error handling without exposing sensitive information

## 🚀 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Responsive images with proper sizing
- **Caching**: Service worker for offline functionality
- **Bundle Analysis**: Regular bundle size monitoring

## 🤝 Contributing

### Code Style
- Use functional components with hooks
- Follow React best practices and patterns
- Maintain consistent naming conventions
- Write descriptive component and function names

### Component Guidelines
- Keep components small and focused
- Use props for component communication
- Implement proper error boundaries
- Include PropTypes for type checking

---

**Frontend Application** - Modern React interface for SmileSync dental clinic management. 🦷⚛️