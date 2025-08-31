***

## High Priority User Stories

### Story ID: ANALYTICS-001  
**Title:** Fix Analytics System ORM Compatibility  
**Narrative:** As a developer, I want the analytics dashboard queries to use the custom SQLite database layer instead of Sequelize ORM so that data loads correctly and reliably.  
**Acceptance Criteria:**  
- Replace Sequelize calls with custom DB layer methods in `analyticsController.js`.  
- Verify the dashboard loads real-time data without errors.  
- Ensure coverage with unit/integration tests for analytics.  

***

### Story ID: APPT-001  
**Title:** Implement Appointment Creation and Editing Forms  
**Narrative:** As a front-end user, I want to create and edit appointments through a form interface so that scheduling is possible.  
**Acceptance Criteria:**  
- `AppointmentForm.js` component implemented with all required fields.  
- Routes for `/appointments/new` and `/appointments/edit/:id` added in `App.js`.  
- Proper validation and error handling in forms.  
- Integration with backend appointment APIs.  

***

### Story ID: API-001  
**Title:** Standardize Field Naming between Frontend and Backend  
**Narrative:** As a developer, I want consistent field naming conventions between frontend (camelCase) and backend (snake_case) so that requests and data handling are unambiguous.  
**Acceptance Criteria:**  
- Implement serializers/deserializers to map fields from camelCase to snake_case and vice versa.  
- Refactor API controllers and frontend service layers accordingly.  
- Update documentation to reflect naming conventions.  

***

## Medium Priority User Stories

### Story ID: UI-001  
**Title:** Fix HTML DOM Nesting Issues  
**Narrative:** As a front-end developer, I want to resolve invalid DOM nesting warnings (e.g. <p> inside <p>) so that React renders cleanly without warnings.  
**Acceptance Criteria:**  
- Identify and refactor affected components by correcting HTML structure.  
- Verify warnings disappear during development.  

***

### Story ID: FORM-VAL-001  
**Title:** Add Robust Input Validation for All Forms  
**Narrative:** As a user, I want input fields to validate data properly before submission to avoid invalid or incomplete data entry.  
**Acceptance Criteria:**  
- Client-side validation for required fields, data formats, and value ranges.  
- Server-side validation to mirror client rules.  
- Clear user feedback on validation errors.  

***

### Story ID: ERROR-BOUND-001  
**Title:** Implement React Error Boundaries  
**Narrative:** As a user, I want the application to gracefully handle runtime UI errors so that the app does not crash and provides meaningful error messages.  
**Acceptance Criteria:**  
- Implement error boundary components wrapping critical UI sections.  
- Log errors for debugging.  
- Show fallback UI on errors.  

***

Please let me know if you would like to expand on these user stories with technical tasks or acceptance test scripts.