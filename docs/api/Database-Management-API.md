# Database Management API Documentation

## Overview

The Enterprise Documentation Platform provides comprehensive database management APIs for seeding sample data, production deployment preparation, and system administration. These endpoints are designed for secure database operations with proper authorization and confirmation mechanisms.

## Base URL

```
https://spaghetti-platform-drgev.ondigitalocean.app/api/admin
```

## Authentication

All endpoints require `System Administrator` role authorization except where noted as `[AllowAnonymous]`.

## API Endpoints

### Database Statistics

#### Get Database Statistics

Retrieve comprehensive database health and entity counts.

```http
GET /api/admin/database-stats
```

**Authorization:** `[AllowAnonymous]` - Available for health checks

**Response:**

```json
{
  "tenants": 3,
  "users": 8,
  "documents": 7,
  "documentTags": 22,
  "documentPermissions": 15,
  "roles": 6,
  "userRoles": 8,
  "tenantModules": 15,
  "documentAudits": 14,
  "userAudits": 16,
  "tenantAudits": 6,
  "databaseStatus": "healthy",
  "lastChecked": "2025-07-25T12:00:00Z"
}
```

### Sample Data Management

#### Check Sample Data Status

Verify if sample data exists in the database.

```http
GET /api/admin/sample-data-status
```

**Authorization:** `[AllowAnonymous]` - Available for status checks

**Response:**

```json
{
  "hasSampleData": true,
  "hasDemoUser": true,
  "sampleTenantsCount": 3,
  "totalUsers": 8,
  "totalDocuments": 7,
  "lastChecked": "2025-07-25T12:00:00Z"
}
```

#### Seed Sample Data

Populate the database with comprehensive sample data for demonstration purposes.

```http
POST /api/admin/seed-sample-data
```

**Authorization:** `System Administrator` required

**Response (Success):**

```json
{
  "message": "Sample data seeded successfully",
  "timestamp": "2025-07-25T12:00:00Z"
}
```

**Response (Error):**

```json
{
  "error": "Failed to seed sample data",
  "details": "Sample data already exists, skipping seeding"
}
```

**Sample Data Created:**

- **3 Demo Tenants**: Different tiers and industries
- **8 Professional Users**: Realistic profiles and roles
- **7 Sample Documents**: Industry-specific content
- **20+ Document Tags**: Categorization system
- **15+ Permission Entries**: Access control demonstration
- **25+ Audit Entries**: Activity history

### Production Management

#### Clear All Data

Remove all data from the database for production deployment preparation.

```http
DELETE /api/admin/clear-all-data?confirmationToken=CONFIRM_DELETE_ALL_DATA
```

**Authorization:** `System Administrator` required

**Parameters:**

- `confirmationToken` (required): Must be exactly `CONFIRM_DELETE_ALL_DATA`

**Response (Success):**

```json
{
  "message": "All data cleared successfully",
  "timestamp": "2025-07-25T12:00:00Z"
}
```

**Response (Invalid Token):**

```json
{
  "error": "Invalid confirmation token. Use 'CONFIRM_DELETE_ALL_DATA' to confirm."
}
```

**⚠️ Warning:** This operation deletes ALL data except system roles:

- All tenants and tenant-specific data
- All users and user authentication
- All documents and attachments
- All permissions and audit entries
- All tenant modules and configurations

System roles (System Administrator, Tenant Administrator, User) are preserved.

### User Management

#### Create Admin User

Create an initial administrator user for production environments.

```http
POST /api/admin/create-admin-user
```

**Authorization:** `[AllowAnonymous]` - Only allowed on empty database

**Request Body:**

```json
{
  "email": "admin@company.com",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Response (Success):**

```json
{
  "message": "Admin user created successfully",
  "userId": "12345678-1234-1234-1234-123456789abc",
  "email": "admin@company.com",
  "timestamp": "2025-07-25T12:00:00Z"
}
```

**Response (Database Not Empty):**

```json
{
  "error": "Admin user creation only allowed on empty database"
}
```

**Response (Validation Error):**

```json
{
  "error": "Email, FirstName, and LastName are required"
}
```

## Sample Data Schema

### Demo Tenants

#### Acme Legal Services

- **Tier:** Professional
- **Status:** Active
- **Industry:** Legal
- **Users:** 4 (Senior Partner, Associate Attorney, Legal Secretary, Demo User)
- **Documents:** 3 (Merger Agreement, Employment Contract, Meeting Notes)
- **Features:** MFA required, AI features enabled, SOC2/ISO27001 compliance

#### TechStart Inc

- **Tier:** Starter (Trial)
- **Status:** Trial
- **Industry:** Technology
- **Users:** 2 (CEO/Founder, Head of Product)
- **Documents:** 2 (Product Requirements, Go-to-Market Strategy)
- **Features:** AI enabled, GDPR compliance, 14-day trial

#### Global Consulting Group

- **Tier:** Enterprise
- **Status:** Active
- **Industry:** Consulting
- **Users:** 2 (Managing Director, Senior Consultant)
- **Documents:** 2 (Digital Transformation, Operations Analysis)
- **Features:** Full enterprise features, SSO required, multi-compliance

### Sample Documents

Each document includes:

- **Realistic content** specific to the industry
- **Metadata** with keywords, summaries, word counts
- **AI processing metadata** with confidence scores
- **Version control** with parent/child relationships
- **Tag categorization** for search optimization
- **Permission structure** demonstrating access control
- **Audit trails** showing creation and modification history

### User Roles and Permissions

#### System Roles

- **System Administrator:** Full platform access
- **Tenant Administrator:** Tenant-specific admin rights
- **User:** Standard document access

#### Permission Structure

- **Document Permissions:** Read, Write, Comment, Share, Delete, Admin
- **User Assignments:** Role-based with expiration support
- **Tenant Isolation:** Complete separation between organizations

## Usage Examples

### Development Workflow

1. **Check Current State**

   ```bash
   curl GET https://spaghetti-platform-drgev.ondigitalocean.app/api/admin/database-stats
   ```

2. **Seed Development Data**

   ```bash
   curl -X POST https://spaghetti-platform-drgev.ondigitalocean.app/api/admin/seed-sample-data \
        -H "Authorization: Bearer <admin-token>"
   ```

3. **Verify Sample Data**

   ```bash
   curl GET https://spaghetti-platform-drgev.ondigitalocean.app/api/admin/sample-data-status
   ```

### Production Deployment

1. **Clear Development Data**

   ```bash
   curl -X DELETE "https://spaghetti-platform-drgev.ondigitalocean.app/api/admin/clear-all-data?confirmationToken=CONFIRM_DELETE_ALL_DATA" \
        -H "Authorization: Bearer <admin-token>"
   ```

2. **Create Initial Admin**

   ```bash
   curl -X POST https://spaghetti-platform-drgev.ondigitalocean.app/api/admin/create-admin-user \
        -H "Content-Type: application/json" \
        -d '{
          "email": "admin@company.com",
          "firstName": "Admin",
          "lastName": "User"
        }'
   ```

3. **Verify Clean State**

   ```bash
   curl GET https://spaghetti-platform-drgev.ondigitalocean.app/api/admin/database-stats
   ```

## Error Handling

All endpoints implement comprehensive error handling:

- **400 Bad Request:** Invalid request parameters or validation errors
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **500 Internal Server Error:** Server-side errors with detailed logging

Error responses include:

- Clear error messages
- Specific validation details
- Timestamp for debugging
- Request correlation for support

## Security Considerations

- **Authorization Required:** Most endpoints require System Administrator role
- **Confirmation Tokens:** Destructive operations require explicit confirmation
- **Audit Logging:** All admin operations are logged for security review
- **Rate Limiting:** API endpoints are protected against abuse
- **Input Validation:** All parameters are validated and sanitized
- **Database Transactions:** Operations use transactions for data consistency

## Monitoring and Logging

All database management operations are monitored with:

- **Structured Logging:** Using Serilog with contextual information
- **Performance Metrics:** Operation timing and success rates
- **Error Tracking:** Detailed error reporting and alerting
- **Audit Trails:** Complete record of administrative actions
- **Health Checks:** Regular database connectivity verification

## Integration Notes

These APIs are designed for:

- **CI/CD Pipelines:** Automated testing with fresh sample data
- **Development Environments:** Quick setup with realistic data
- **Demo Environments:** Showcase platform capabilities
- **Production Deployment:** Clean database preparation
- **System Administration:** Ongoing database management

The seeding service creates data that demonstrates all platform features while maintaining realistic relationships and enterprise-appropriate content suitable for legal, technology, and consulting professionals.
