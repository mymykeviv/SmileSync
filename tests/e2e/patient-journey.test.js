const { test, expect } = require('@playwright/test');

test.describe('Patient Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('complete patient management workflow', async ({ page }) => {
    // Navigate to Patients page
    await page.click('text=Patients');
    await expect(page).toHaveURL(/.*patients/);

    // Add new patient
    await page.click('button:has-text("Add Patient")');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '555-0123');
    await page.fill('input[name="dateOfBirth"]', '1990-01-15');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('textarea[name="address"]', '123 Main St, City, State 12345');
    
    await page.click('button:has-text("Save Patient")');
    
    // Verify patient was added
    await expect(page.locator('text=John Doe')).toBeVisible();
    
    // Edit patient
    await page.click('button[aria-label="Edit patient"]');
    await page.fill('input[name="phone"]', '555-0124');
    await page.click('button:has-text("Update Patient")');
    
    // Verify patient was updated
    await expect(page.locator('text=555-0124')).toBeVisible();
  });

  test('patient search and filtering', async ({ page }) => {
    await page.click('text=Patients');
    
    // Test search functionality
    await page.fill('input[placeholder*="Search"]', 'John');
    await page.waitForTimeout(500); // Wait for debounced search
    
    // Verify search results
    const patientRows = page.locator('[data-testid="patient-row"]');
    await expect(patientRows).toHaveCount(1);
    
    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);
    
    // Verify all patients are shown
    await expect(patientRows.first()).toBeVisible();
  });
});

test.describe('Appointment Management Journey', () => {
  test('complete appointment booking workflow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to Appointments
    await page.click('text=Appointments');
    await expect(page).toHaveURL(/.*appointments/);
    
    // Book new appointment
    await page.click('button:has-text("Book Appointment")');
    
    // Select patient
    await page.click('div[role="combobox"]');
    await page.click('li:has-text("John Doe")');
    
    // Select service
    await page.selectOption('select[name="serviceId"]', '1');
    
    // Set appointment date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[name="appointmentDate"]', dateString);
    await page.fill('input[name="appointmentTime"]', '10:00');
    
    await page.fill('textarea[name="notes"]', 'Regular checkup appointment');
    
    await page.click('button:has-text("Book Appointment")');
    
    // Verify appointment was created
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Regular checkup appointment')).toBeVisible();
  });

  test('appointment status management', async ({ page }) => {
    await page.goto('http://localhost:3000/appointments');
    
    // Find an appointment and change status
    await page.click('button[aria-label="Edit appointment"]');
    await page.selectOption('select[name="status"]', 'completed');
    await page.click('button:has-text("Update Appointment")');
    
    // Verify status change
    await expect(page.locator('text=Completed')).toBeVisible();
  });
});

test.describe('Analytics Dashboard Journey', () => {
  test('analytics dashboard functionality', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to Analytics
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*analytics/);
    
    // Verify dashboard components load
    await expect(page.locator('[data-testid="total-patients-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-appointments-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue-card"]')).toBeVisible();
    
    // Test date range filter
    await page.click('input[name="startDate"]');
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startDate = lastMonth.toISOString().split('T')[0];
    
    await page.fill('input[name="startDate"]', startDate);
    await page.click('button:has-text("Apply Filter")');
    
    // Wait for charts to update
    await page.waitForTimeout(1000);
    
    // Verify charts are present
    await expect(page.locator('[data-testid="appointments-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('data export functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/analytics');
    
    // Test export functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('analytics');
  });
});

test.describe('Billing and Invoice Journey', () => {
  test('invoice creation and management', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to Billing
    await page.click('text=Billing');
    await expect(page).toHaveURL(/.*billing/);
    
    // Create new invoice
    await page.click('button:has-text("Create Invoice")');
    
    // Select patient
    await page.click('div[role="combobox"]');
    await page.click('li:has-text("John Doe")');
    
    // Add service items
    await page.click('button:has-text("Add Item")');
    await page.selectOption('select[name="serviceId"]', '1');
    await page.fill('input[name="quantity"]', '1');
    
    // Save invoice
    await page.click('button:has-text("Create Invoice")');
    
    // Verify invoice was created
    await expect(page.locator('text=John Doe')).toBeVisible();
    
    // Test PDF export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button[aria-label="Download PDF"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});