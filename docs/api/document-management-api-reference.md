# Document Management System API Reference

## Overview

This document provides comprehensive reference for the **11 Document Management System API endpoints** implemented as part of Sprint 1 Phase A. All endpoints are production-ready with enterprise-grade security, performance optimizations, and complete documentation.

## 🚀 Quick Start

### Base URL
```
Production: https://spaghetti-platform-drgev.ondigitalocean.app/api
Development: http://localhost:5001/api
```

### Authentication
All endpoints require JWT Bearer token authentication:
```http
Authorization: Bearer <your-jwt-token>
```

### Swagger Documentation
Interactive API documentation available at:
- Production: https://spaghetti-platform-drgev.ondigitalocean.app/swagger
- Development: http://localhost:5001/swagger

## 📋 Complete API Endpoint Reference

### 1. Document CRUD Operations

#### 1.1 List Documents with Filtering and Pagination
```http
GET /api/documents
```

**Query Parameters:**
- `searchTerm` (string, optional): Search in title, content, and tags
- `tags` (array, optional): Filter by tag names
- `documentType` (string, optional): Filter by document type
- `industry` (string, optional): Filter by industry
- `status` (enum, optional): Draft, InReview, Approved, Published, Archived, Deleted
- `fromDate` (datetime, optional): Filter by creation date range
- `toDate` (datetime, optional): Filter by creation date range
- `createdBy` (guid, optional): Filter by creator user ID
- `contentType` (string, optional): Filter by MIME type
- `page` (int, default: 1): Page number for pagination
- `pageSize` (int, default: 20): Items per page

**Response:**
```json
{
  "items": [
    {
      "id": "guid",
      "title": "string",
      "documentType": "string",
      "industry": "string", 
      "status": "enum",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "createdByName": "string",
      "fileName": "string",
      "contentType": "string",
      "fileSize": "number",
      "version": "number",
      "isLatestVersion": "boolean",
      "tagNames": ["string"]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalPages": 5,
  "totalItems": 100,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

#### 1.2 Get Single Document with Full Metadata
```http
GET /api/documents/{id}
```

**Response:** Complete document object with all relationships, metadata, and AI processing results.

#### 1.3 Create New Document with Tags and Metadata
```http
POST /api/documents
Content-Type: application/json

{
  "title": "string (required, max: 500)",
  "content": "string",
  "documentType": "string (required, max: 100)",
  "industry": "string (required, max: 50)",
  "status": "enum (Draft, InReview, etc.)",
  "publicAccessLevel": "enum (Private, Public, etc.)",
  "publicSlug": "string (optional)",
  "metaDescription": "string (optional)",
  "metaKeywords": ["string"],
  "indexBySearchEngines": "boolean",
  "fileName": "string (optional)",
  "contentType": "string (optional)",
  "fileSize": "number (optional)",
  "versionNotes": "string (optional)",
  "tags": ["string"]
}
```

#### 1.4 Update Document with Partial Field Support
```http
PUT /api/documents/{id}
Content-Type: application/json

{
  "title": "string (optional)",
  "content": "string (optional)",
  "documentType": "string (optional)",
  "industry": "string (optional)",
  "status": "enum (optional)",
  "publicAccessLevel": "enum (optional)",
  "publicSlug": "string (optional)",
  "metaDescription": "string (optional)",
  "metaKeywords": ["string"] (optional),
  "indexBySearchEngines": "boolean (optional)",
  "versionNotes": "string (optional)",
  "tags": ["string"] (optional)
}
```

#### 1.5 Soft Delete Document with Audit Trail
```http
DELETE /api/documents/{id}
```

**Response:** `204 No Content` on success. Document status updated to `Deleted` (soft delete).

### 2. Version Management Operations

#### 2.1 Retrieve Complete Version History
```http
GET /api/documents/{id}/versions
```

**Response:** Array of document versions with metadata.

#### 2.2 Create New Document Version
```http
POST /api/documents/{id}/versions
Content-Type: application/json

{
  "content": "string (optional)",
  "versionNotes": "string (optional)", 
  "status": "enum (optional)",
  "tags": ["string"] (optional),
  "file": "IFormFile (optional)"
}
```

#### 2.3 Get Latest Version of Document
```http
GET /api/documents/{id}/latest
```

**Response:** Complete document object of the latest version.

### 3. File Operations

#### 3.1 Upload File with Metadata and Validation
```http
POST /api/documents/upload
Content-Type: multipart/form-data

{
  "file": "IFormFile (required)",
  "title": "string (optional, max: 500)",
  "documentType": "string (optional, max: 100)",
  "industry": "string (optional, max: 50)",
  "description": "string (optional)",
  "tags": ["string"],
  "status": "enum",
  "publicAccessLevel": "enum"
}
```

**Features:**
- File type validation
- Virus scanning ready
- Duplicate detection via file hash
- Automatic metadata extraction

#### 3.2 Download Document File with Streaming
```http
GET /api/documents/{id}/download
```

**Response:** Binary file stream with appropriate `Content-Type` and `Content-Disposition` headers.

#### 3.3 Retrieve File Metadata and Storage Info
```http
GET /api/documents/{id}/file-info
```

**Response:**
```json
{
  "fileName": "string",
  "contentType": "string",
  "fileSize": "number",
  "fileHash": "string",
  "storage": {
    "created": "datetime",
    "lastModified": "datetime",
    "etag": "string",
    "storageSize": "number"
  }
}
```

## 🔧 Technical Features

### Authentication & Security
- **JWT Authentication**: All endpoints require valid JWT token
- **Multi-Tenant Security**: Automatic tenant isolation for all operations
- **Role-Based Access**: Permission validation (Read, Write, Delete) per endpoint
- **Audit Trail**: Complete logging of all document operations

### File Management
- **File Upload**: Support for multiple file types with validation
- **Streaming Download**: Memory-efficient large file handling
- **Duplicate Prevention**: File hash-based duplicate detection
- **Metadata Extraction**: Rich file information including size, type, timestamps

### Performance Features
- **Database Indexing**: Optimized queries for fast document retrieval
- **Pagination**: Efficient large dataset handling with configurable page sizes
- **Async Operations**: Non-blocking file operations
- **Caching Ready**: Architecture prepared for Redis integration

## 📊 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Delete operation successful |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - JWT token missing or invalid |
| 403 | Forbidden - User lacks required permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate file upload detected |
| 500 | Internal Server Error - Server error occurred |

## 🧪 Usage Examples

### Create Document
```bash
curl -X POST "https://spaghetti-platform-drgev.ondigitalocean.app/api/documents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Contract Template",
    "content": "Document content...",
    "documentType": "Contract",
    "industry": "Legal",
    "tags": ["template", "contract", "legal"],
    "status": "Draft"
  }'
```

### Search Documents
```bash
curl "https://spaghetti-platform-drgev.ondigitalocean.app/api/documents?searchTerm=contract&documentType=Legal&page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upload File
```bash
curl -X POST "https://spaghetti-platform-drgev.ondigitalocean.app/api/documents/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=Legal Document" \
  -F "documentType=PDF" \
  -F "tags=legal,important"
```

## 🛡️ Security Implementation

### Multi-Tenant Isolation
All queries automatically filter by tenant:
```csharp
var documents = await _unitOfWork.Documents.GetAccessibleDocumentsAsync(userId, tenantId);
```

### Permission Validation
Permission check before any operation:
```csharp
var hasAccess = await _unitOfWork.Documents.HasUserAccessAsync(documentId, userId, PermissionType.Read);
```

### File Security
- File type validation with configurable restrictions
- Virus scanning integration ready
- File hash verification for integrity
- Secure file storage with access controls

## 📈 Performance Benchmarks

| Operation | Target Response Time | Actual Performance |
|-----------|---------------------|-------------------|
| Document List | <200ms | ✅ Optimized with indexing |
| Single Document | <100ms | ✅ Direct ID lookup |
| File Upload | <5s (10MB) | ✅ Streaming implementation |
| File Download | <2s (10MB) | ✅ Streaming with resume support |
| Search | <500ms | ✅ Ready for Elasticsearch |

## 🎯 Implementation Status

- ✅ **Complete API Coverage**: All 11 endpoints implemented and tested
- ✅ **Security Implementation**: Multi-tenant isolation and JWT authentication
- ✅ **Performance Optimization**: Database indexing and async operations
- ✅ **Production Ready**: Comprehensive error handling and logging
- ✅ **Documentation**: Complete Swagger/OpenAPI documentation

## 🔄 Next Steps - Sprint 2

### Search Integration
- [ ] Elasticsearch configuration and indexing
- [ ] Full-text search across document content
- [ ] Advanced search filters and faceting
- [ ] Search result highlighting and ranking

### Real-Time Features
- [ ] SignalR hub setup for WebSocket connections
- [ ] Document lock/unlock for collaborative editing
- [ ] Real-time collaboration notifications
- [ ] Presence indicators for active users

### Advanced Features
- [ ] Batch operations for multiple documents
- [ ] Document preview generation
- [ ] Advanced workflow and approval processes
- [ ] Document analytics and reporting

---

**Related Issues**: #32 (Implementation)  
**Production Deployment**: Live at https://spaghetti-platform-drgev.ondigitalocean.app/  
**Swagger Documentation**: https://spaghetti-platform-drgev.ondigitalocean.app/swagger