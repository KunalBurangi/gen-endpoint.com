# 🚀 File Upload API Testing Guide

## Multiple Ways to Test File Uploads

The Gen-Endpoint project now includes a fully functional file upload API with several testing methods:

### 🎯 **Quick Test Options**

#### 1. **React Upload Test Page** (Recommended)
```
http://localhost:4000/upload-test
```
- Modern drag & drop interface
- Real-time progress tracking
- File preview for images
- Comprehensive API testing buttons
- Upload result display

#### 2. **Simple HTML Form**
```
http://localhost:4000/api/upload?format=html
```
- Basic HTML form for quick testing
- Works in any browser
- No JavaScript framework required
- Direct form submission

#### 3. **API Documentation Interface**
```
http://localhost:4000/apis/file-upload-api
```
- Interactive file upload in documentation
- Auto-detects FormData endpoints
- Built-in file selection UI
- Response visualization

## 📡 **API Endpoints**

### Upload Files
```
POST /api/upload
Content-Type: multipart/form-data
Field name: "files" (supports multiple files)
```

### List Files
```
GET /api/files
GET /api/files?type=image&limit=10&page=1
```

### File Details
```
GET /api/files/{fileId}
PUT /api/files/{fileId} - Update metadata
DELETE /api/files/{fileId} - Delete file
```

### File Download
```
GET /api/files/{fileId}/download
```

### Bulk Operations
```
POST /api/files/bulk
GET /api/files/bulk - Documentation
```

## 🛠️ **Command Line Testing**

### Upload Single File
```bash
curl -X POST -F "files=@document.pdf" http://localhost:4000/api/upload
```

### Upload Multiple Files
```bash
curl -X POST \
  -F "files=@photo.jpg" \
  -F "files=@document.pdf" \
  -F "files=@data.csv" \
  http://localhost:4000/api/upload
```

### List Files
```bash
curl "http://localhost:4000/api/files"
curl "http://localhost:4000/api/files?type=image&limit=5"
```

### Get File Details
```bash
curl "http://localhost:4000/api/files/file_123"
```

### Download File
```bash
curl -O "http://localhost:4000/api/files/file_123/download"
```

### Update File Metadata
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description", "tags": ["important"]}' \
  http://localhost:4000/api/files/file_123
```

### Delete File
```bash
curl -X DELETE "http://localhost:4000/api/files/file_123"
```

## 📋 **Supported File Types**

- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Text**: TXT, CSV, JSON
- **Archives**: ZIP
- **Media**: MP4, WebM, MP3, WAV

**Size Limit**: 10MB per file

## 🔍 **Testing Features**

### File Validation
- File type checking
- Size limit enforcement
- Filename sanitization
- Security validation

### Search & Filter
```bash
# Filter by type
curl "http://localhost:4000/api/files?type=image"

# Search in names
curl "http://localhost:4000/api/files?search=document"

# Sort by size
curl "http://localhost:4000/api/files?sortBy=size&sortOrder=desc"
```

### Pagination
```bash
curl "http://localhost:4000/api/files?page=1&limit=5"
```

### Bulk Operations
```bash
# Delete multiple files
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"operation": "delete", "fileIds": ["file_123", "file_456"]}' \
  http://localhost:4000/api/files/bulk

# Delete by filter
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"operation": "delete", "filters": {"mimeType": "image/", "olderThan": "2024-08-01"}}' \
  http://localhost:4000/api/files/bulk
```

## 🚨 **Troubleshooting**

### Common Issues

1. **"No files provided" error**
   - Ensure field name is "files"
   - Check Content-Type is multipart/form-data
   - Verify files are actually selected

2. **File type not supported**
   - Check the supported types list above
   - Verify file MIME type is correct

3. **File size exceeds limit**
   - Maximum 10MB per file
   - Compress or split large files

4. **CORS issues**
   - API allows cross-origin requests
   - Check browser console for errors

### Debug Steps

1. **Test with simple HTML form first**
   ```
   http://localhost:4000/api/upload?format=html
   ```

2. **Check upload endpoint info**
   ```bash
   curl "http://localhost:4000/api/upload"
   ```

3. **Verify server is running**
   ```bash
   npm run dev
   ```

4. **Check file permissions**
   - Ensure files are readable
   - Check file path is correct

## 🎨 **Example Responses**

### Successful Upload
```json
{
  "success": true,
  "files": [
    {
      "id": "file_abc123",
      "originalName": "document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "uploadedAt": "2024-08-16T12:00:00Z",
      "url": "/api/files/file_abc123",
      "downloadUrl": "/api/files/file_abc123/download"
    }
  ],
  "uploaded": 1,
  "message": "All 1 file(s) uploaded successfully"
}
```

### Upload with Errors
```json
{
  "success": true,
  "files": [...],
  "uploaded": 2,
  "totalAttempted": 3,
  "errors": [
    {
      "filename": "large-file.zip",
      "error": "File size exceeds 10MB limit"
    }
  ],
  "message": "2 file(s) uploaded successfully, 1 failed"
}
```

### Files List
```json
{
  "files": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "statistics": {
    "totalFiles": 25,
    "totalSize": 52428800,
    "typeDistribution": {
      "image": 10,
      "application": 8,
      "text": 7
    }
  }
}
```

## 🔗 **Related Documentation**

- Main documentation: http://localhost:4000/apis/file-upload-api
- All APIs: http://localhost:4000
- AI tools: http://localhost:4000/generate

## 📝 **Notes**

- Files are stored in memory for this demo
- In production, use cloud storage (AWS S3, etc.)
- Consider implementing virus scanning
- Add authentication for production use
- Monitor storage quotas and cleanup