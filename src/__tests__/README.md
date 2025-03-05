# TradingView Replica Test Suite

This directory contains comprehensive tests for the TradingView replica application. The test suite ensures that all components, services, and utilities work correctly and maintain their functionality as the application evolves.

## Test Structure

The test suite is organized as follows:

- **API Service Tests**: Tests for the Polygon API integration and data fetching
- **WebSocket Service Tests**: Tests for real-time data streaming
- **Technical Indicators Tests**: Tests for technical analysis calculations
- **Component Tests**: Tests for React components
- **Mocks**: Common mocking utilities and mock data

## Running Tests

You can run the tests using the following npm commands:

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

## Test Coverage

The test suite aims to cover:

1. **API Services**:
   - Data fetching from Polygon API
   - Error handling and fallbacks
   - Data transformation

2. **WebSocket Services**:
   - Connection management
   - Data handling
   - Reconnection logic

3. **Technical Indicators**:
   - Calculation accuracy
   - Edge cases

4. **UI Components**:
   - Rendering
   - User interactions
   - State management
   - Props validation

## Mock Strategies

The test suite uses several mocking strategies:

1. **API Mocks**: Using MSW (Mock Service Worker) to intercept API calls
2. **WebSocket Mocks**: Simulating socket connections and messages
3. **Component Mocks**: Isolating components for unit testing
4. **DOM Mocks**: Mocking browser-specific functionality

## Contributing to Tests

When adding new features, please follow these guidelines for testing:

1. Create tests for all new services and components
2. Maintain existing test coverage when modifying code
3. Use descriptive test names
4. Group related tests in describe blocks
5. Mock external dependencies
6. Test edge cases and error scenarios

## Test Best Practices

- Use descriptive test names that explain what is being tested
- Keep tests independent of each other
- Mock external services and APIs
- Test both success and failure scenarios
- Avoid testing implementation details; focus on behavior
- Use setup and teardown functions for shared logic

## Example Test Structure

```typescript
describe('Component or Service Name', () => {
  // Setup before tests
  beforeEach(() => {
    // Common setup
  });

  // Cleanup after tests
  afterEach(() => {
    // Common cleanup
  });

  // Group related tests
  describe('Specific Functionality', () => {
    it('should behave in a specific way under normal conditions', () => {
      // Test code
    });

    it('should handle edge cases properly', () => {
      // Test code
    });
  });

  describe('Another Functionality', () => {
    // More tests
  });
});
``` 