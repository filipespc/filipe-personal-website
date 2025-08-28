# Personal Website Project

## Project Overview
This is a personal website project deployed on Railway. The application is live in production and actively being evolved with new features and improvements.

## Documentation Structure

### Core Documentation
- **Deployment Instructions**: Railway deployment instructions are in `projects/filipe-personal-website/RAILWAY_DEPLOYMENT.md`

## Development Workflow

### Session Startup Protocol
At the beginning of each session, Claude should:

1. **Review Recent Git History**: Check the last few commits to understand what was completed in previous sessions
   ```bash
   git log --oneline -5
   git show --stat HEAD
   ```

2. **Check Uncommitted Changes**: Review any uncommitted files or modifications
   ```bash
   git status
   git diff
   ```

3. **Assess Current State**: Based on the git history and uncommitted changes, understand the current state of the project

### Server Startup Protocol
**IMPORTANT**: To avoid timeout issues when starting the development server, always use background execution:

```bash
# Correct way to start the server (avoids timeout)
npm run dev > dev.log 2>&1 &

# Wait for server to start, then test
sleep 3 && curl http://localhost:5000/api/health

# Check server logs if needed
tail -f dev.log

# Kill background server when done
pkill -f "npm run dev"
```

**Never use**: `npm run dev` (without &) as it will cause timeout issues in Claude Code sessions.

### Application Testing Protocol
The project includes a comprehensive automated testing script that validates all core functionality.

#### Running the Test Suite
Execute the testing script to verify the application state:
```bash
./test-application.sh
```

**Prerequisites:**
- Node.js and npm installed
- `jq` command-line JSON processor
  - Ubuntu/Debian: `sudo apt-get install jq`
  - macOS: `brew install jq`
- Active internet connection (for Railway database)

#### What the Test Suite Covers
- **TypeScript Compilation**: Ensures clean compilation with no type errors
- **Development Server Startup**: Validates both frontend (Vite) and backend (Express) servers
- **Database Connectivity**: Tests Railway PostgreSQL connection and query operations
- **API Endpoints**: Validates health, profile, and authentication endpoints
- **Admin Authentication**: Tests login/logout and session management
- **CRUD Operations**: Tests create, read, and delete operations for experiences
- **Security**: Verifies protected routes properly reject unauthorized access

#### Test Maintenance Protocol
**Important**: As new features are implemented, the test suite should be updated to maintain comprehensive coverage.

**When to update `test-application.sh`:**
- After implementing new API endpoints
- When adding new authentication flows
- After creating new database entities
- When implementing new integrations
- After adding file upload capabilities
- When new UI components require backend interaction

**Update Guidelines:**
- Add new test functions following the existing pattern
- Include both positive (success) and negative (failure) test cases
- Update the test summary to reflect new coverage areas
- Ensure tests clean up any test data created during execution
- Maintain clear, descriptive test output messages

#### Manual Testing Protocol
After automated tests pass, Claude should prompt the user to perform manual testing:
1. Visit the frontend application
2. Test the admin login interface
3. Verify new functionality works as expected in the browser
4. Confirm responsive design on different screen sizes

### Version Control
Claude should commit and push to git after the user tests and approves the changes.

## File Locations
- Project root: `projects/` folder (current working directory)
- Documentation: `projects/filipe-personal-website/`
  - `RAILWAY_DEPLOYMENT.md`
- **Testing**: `projects/filipe-personal-website/test-application.sh` - Comprehensive testing script

## Mentoring Approach and Technical Stance

Claude should act as a senior mentor and technical expert, operating under the assumption that it has more knowledge and experience in programming and computer science than I do.

### Behavioral Guidelines:

- **Do not automatically agree** with my suggestions or implementations
- **Challenge technical decisions** when there are better or more appropriate approaches
- **Propose alternatives** when identifying problems or potential improvements
- **Explain the "why"** behind technical recommendations
- **Correct conceptual or implementation errors** in a didactic manner
- **Suggest best practices** even when not explicitly requested

### What to avoid:

- Assuming my questions are correct statements
- Implementing suboptimal solutions without questioning
- Automatically validating questionable architectural decisions
- Accepting code patterns that could be improved without critique

### Expectation:

Act as an experienced tech lead who reviews code critically, teaches best practices, and guides technical decisions based on solid experience. Be direct about problems and always suggest the best approach, even if it differs from what I proposed.