# FinCoach-AI Setup and Integration Plan

## Current State Analysis

### Backend (Spring Boot) - ✅ Most Complete
- **Authentication System**: JWT-based authentication implemented
- **Email Service**: Basic email service for OTP delivery
- **Controllers**: AuthController with proper endpoints (/auth/register, /auth/verify-email-otp, /auth/login)
- **Services**: AuthService and EmailService implemented
- **Dependencies**: All required dependencies in pom.xml (including validation, H2, JWT, etc.)
- **Configuration**: application.yml properly configured with H2 database and email settings
- **Database**: H2 in-memory database configured

### Frontend (React/Vite) - ⚠️ Needs Major Updates
- **Registration**: Currently only collects name, email, phone (missing password fields)
- **OTP**: Currently simulates OTP verification (not connected to backend)
- **Login**: No login component exists
- **Authentication Flow**: No JWT token management or auth state handling
- **API Integration**: No backend API connections

## Issues Found

1. **Register.tsx**: Missing password and confirmPassword fields
2. **OTP.tsx**: Not integrated with backend API - uses fake verification
3. **No Login Component**: Missing login functionality
4. **No JWT Management**: No token storage, retrieval, or authentication state
5. **No API Service Layer**: Missing HTTP client and API integration

## Detailed Implementation Plan

### Phase 1: Prerequisites and Backend Setup
1. **Verify Prerequisites**
   - Check Java 17+, Maven 3.6+, Node.js 16+, npm installations
   - Install missing dependencies if needed

2. **Backend Compilation and Configuration**
   - Fix any compilation issues in Java files
   - Ensure @EnableJpaRepositories is properly configured
   - Verify email service configuration
   - Test backend compilation and startup

3. **Backend Testing**
   - Build backend: `mvn clean package -DskipTests`
   - Start backend server: `java -jar target/fincoach-backend-1.0.0.jar`
   - Verify all endpoints are accessible

### Phase 2: Frontend Authentication Components
1. **Create API Service Layer**
   - Create `src/services/api.ts` for HTTP client
   - Implement authentication API calls
   - Add JWT token management utilities

2. **Update Register.tsx**
   - Add password and confirmPassword fields
   - Add validation for password fields
   - Integrate with backend `/auth/register` API
   - Handle registration response and navigation

3. **Create Login.tsx**
   - New login component with email/password fields
   - Integration with backend `/auth/login` API
   - JWT token storage and authentication state management
   - Navigate to dashboard on successful login

4. **Update OTP.tsx**
   - Integrate with backend `/auth/verify-email-otp` API
   - Get email from registration data
   - Handle OTP verification response
   - Navigate to login or dashboard based on response

### Phase 3: Authentication Flow Integration
1. **Create Auth Context**
   - `src/context/AuthContext.tsx` for global auth state
   - JWT token storage in localStorage
   - Authentication state management
   - Protected route handling

2. **Update App.tsx**
   - Add authentication routes
   - Implement protected route wrapper
   - Handle authentication redirects

3. **Update Layout.tsx**
   - Add logout functionality
   - Show user information when authenticated
   - Handle authentication state in navigation

### Phase 4: Backend Integration and Testing
1. **Database and Entity Verification**
   - Ensure all entities are properly mapped
   - Verify JPA repository functionality
   - Test CRUD operations

2. **Email Configuration**
   - Configure Gmail SMTP or email service
   - Test email OTP delivery
   - Verify email templates

3. **CORS and Security**
   - Ensure CORS is properly configured for frontend
   - Test JWT token validation
   - Verify security configuration

### Phase 5: End-to-End Testing
1. **Registration Flow**
   - Test user registration with email
   - Verify OTP email delivery
   - Test OTP verification
   - Confirm user verification status

2. **Login Flow**
   - Test login with verified user
   - Verify JWT token generation
   - Test protected route access
   - Test logout functionality

3. **Error Handling**
   - Test invalid OTP scenarios
   - Test registration with existing email
   - Test login with wrong credentials
   - Test expired OTP handling

## Implementation Priority

### High Priority (Must Have)
1. Fix backend compilation issues
2. Update Register.tsx with password fields
3. Create Login.tsx component
4. Integrate OTP.tsx with backend
5. Create API service layer
6. Implement JWT token management

### Medium Priority (Should Have)
1. Create Auth Context for state management
2. Update App.tsx with auth routes
3. Update Layout.tsx with logout
4. Test complete registration flow

### Low Priority (Nice to Have)
1. Enhanced error handling
2. Loading states and spinners
3. Responsive design improvements
4. Additional validation

## Technical Requirements

### Backend Requirements
- Java 17+ (preferably 21)
- Maven 3.6+
- H2 Database (configured)
- Email service (Gmail SMTP)

### Frontend Requirements
- Node.js 16+
- npm
- React Router
- Axios for HTTP client
- JWT token handling

### Environment Configuration
- Backend: http://localhost:8080/api
- Frontend: http://localhost:5173
- CORS properly configured
- JWT secret configured

## Success Criteria

1. ✅ Backend compiles and starts without errors
2. ✅ User can register with email/password
3. ✅ OTP is sent to user's email in real-time
4. ✅ User can verify OTP and complete registration
5. ✅ User can login with email/password
6. ✅ JWT tokens are properly generated and validated
7. ✅ Protected routes require authentication
8. ✅ Complete authentication flow works end-to-end

## Next Steps

1. Get user approval for this plan
2. Start with backend compilation and testing
3. Proceed with frontend authentication implementation
4. Test complete authentication flow
5. Deploy and validate the application

---

**Note**: This plan addresses all the requirements mentioned in the original task, focusing on creating a working login/register system with real-time email OTP verification.
