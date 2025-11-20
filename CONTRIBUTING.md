# Contributing Guide

Thank you for considering contributing to this project! This guide will help you understand how to write and contribute tests.

## Table of Contents

- [Setting Up Your Environment](#setting-up-your-environment)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Submitting Your Changes](#submitting-your-changes)

## Setting Up Your Environment

### Prerequisites

- Node.js >= 22.0.0
- npm or yarn package manager
- Docker (for running services locally)

### Installation

1. Clone the repository
2. Install dependencies for both backend and frontend:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables (refer to `.env.example` or project documentation)

4. Start the development services:

```bash
# From the project root
docker-compose up -d
```

## Backend Testing

The backend uses **Jest** for unit and integration testing with TypeScript support.

### Test Directory Structure

Backend tests are located in `backend/__test__/` directory:

```
backend/__test__/
  ├── server.test.ts
  ├── user.test.ts
  ├── post.test.ts
  ├── announcement.test.ts
  ├── categories.test.ts
  └── request_categories.test.ts
```

### Backend Test Environment

- **Framework**: Jest with TypeScript
- **Reporter**: JUnit XML format (for CI/CD integration)
- **Coverage**: LCOV format for detailed reporting
- **Database**: Uses testcontainers for isolated database instances

### Writing Backend Tests

#### Basic Test Structure

```typescript
import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

describe('Feature Name', () => {
  test('should perform expected action', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});
```

#### Testing API Endpoints

Use **supertest** to test Express routes:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('User Routes', () => {
  test('GET /users should return users list', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /users should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

#### Using Global Setup/Teardown

Tests run with global setup and teardown defined in `globalSetup.ts` and `globalTeardown.ts`. These handle:
- Database initialization
- Test container management
- Environment variable setup

### Running Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- user.test.ts

# Run tests with coverage report
npm test

# Generate HTML coverage report
npm test -- --coverage
```

## Frontend Testing

The frontend uses **Playwright** for end-to-end (E2E) testing.

### Test Directory Structure

Frontend tests are located in `frontend/__test__/` directory:

```
frontend/__test__/
  └── login.spec.ts
```

### Frontend Test Environment

- **Framework**: Playwright Test
- **Browser Support**: Chromium (currently configured)
- **Reporter**: HTML report in `playwright-report/`
- **Configuration**: `playwright.config.ts`

### Writing Frontend Tests

#### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should load home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

#### Navigation and User Interaction

```typescript
import { test, expect } from '@playwright/test';

test('Login workflow', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill form
  await page.locator('input[name="email"]').fill('admin@admin.com');
  await page.locator('input[name="password"]').fill('Admin@1234');

  // Click submit
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Verify navigation
  await expect(page).toHaveURL('/posts');
  await expect(page.locator('h1')).toContainText('Posts');
});
```

#### Testing with Different Selectors

```typescript
// By role (preferred)
await page.getByRole('button', { name: 'Submit' }).click();

// By placeholder
await page.locator('input[placeholder="Enter email"]').fill('test@example.com');

// By test ID
await page.locator('[data-testid="submit-btn"]').click();

// By CSS selector
await page.locator('.submit-button').click();
```

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests in headed mode (see browser)
npm test -- --headed

# Run specific test file
npm test -- login.spec.ts

# Run with debug mode
npm test -- --debug

# View HTML report
npm test -- --reporter=html
```

## Running Tests

### Run All Tests (from project root)

```bash
# Backend tests only
cd backend && npm test

# Frontend tests only
cd frontend && npm test
```

### Docker-based Testing

Tests can run in Docker containers matching the CI/CD environment:

```bash
# Build and run tests in containers
docker-compose -f compose.yml run backend npm test
docker-compose -f compose.yml run frontend npm test
```

## Writing Tests

### Naming Conventions

- Test files: `<feature>.test.ts` (backend) or `<feature>.spec.ts` (frontend)
- Test suites: Use `describe()` with clear, descriptive names
- Test cases: Use `test()` or `it()` with action-oriented descriptions

```typescript
describe('User Authentication', () => {
  test('should authenticate valid credentials', () => {
    // test code
  });

  test('should reject invalid password', () => {
    // test code
  });
});
```

### Test Structure (AAA Pattern)

Follow the Arrange-Act-Assert pattern:

```typescript
test('should update user profile', async () => {
  // Arrange: Set up test data
  const userId = 'test-user-123';
  const newName = 'Updated Name';

  // Act: Perform the action
  const response = await request(app)
    .put(`/api/users/${userId}`)
    .send({ name: newName });

  // Assert: Verify the results
  expect(response.status).toBe(200);
  expect(response.body.name).toBe(newName);
});
```

### Testing Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Clarity**: Use descriptive test names that explain what is being tested
3. **Coverage**: Aim for high coverage but focus on critical paths
4. **Mocking**: Mock external dependencies (APIs, databases) when appropriate
5. **Assertions**: Use meaningful assertions with clear expectations
6. **Cleanup**: Clean up test data after each test (handled by global teardown)

## Best Practices

### Backend Best Practices

- Use `supertest` for HTTP endpoint testing
- Keep tests focused on one functionality per test
- Use meaningful variable names and comments
- Test both success and error cases
- Verify HTTP status codes and response structure
- Group related tests using `describe()` blocks

### Frontend Best Practices

- Use semantic selectors (role > testid > css selector)
- Wait for elements explicitly rather than using fixed delays
- Test user workflows, not implementation details
- Keep tests maintainable by avoiding hard-coded values
- Use `expect()` for assertions
- Tag related tests with `@tag` comments for organization

### General Best Practices

- Write tests as you write code
- Keep test files close to the code they test
- Use clear, descriptive naming
- Avoid test interdependencies
- Mock external services
- Aim for >80% code coverage
- Run tests locally before pushing

## Submitting Your Changes

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/add-new-tests
   ```

2. Write your tests following the guidelines above

3. Ensure all tests pass:
   ```bash
   npm test  # in the relevant directory
   ```

4. Check code coverage:
   ```bash
   # Backend coverage report in backend/coverage/
   npm test -- --coverage
   ```

5. Lint your code:
   ```bash
   npm run lint
   ```

6. Commit with clear messages:
   ```bash
   git commit -m "feat: add tests for user authentication"
   ```

7. Push your changes:
   ```bash
   git push origin feature/add-new-tests
   ```

8. Open a Pull Request with:
   - Clear description of what tests were added
   - Explanation of the scenarios covered
   - Link to related issues if applicable

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions?

If you have questions or need clarification, please open an issue or contact the maintainers.

Happy testing! 🎉
