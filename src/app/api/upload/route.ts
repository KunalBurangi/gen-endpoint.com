import { type NextRequest, NextResponse } from 'next/server';
import { addFile, generateFileId, validateFile, type UploadedFile } from '@/lib/data/files';

// POST /api/upload - Upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided. Please select at least one file.' },
        { status: 400 }
      );
    }

    // Filter out non-file entries
    const validFiles = files.filter(file => file instanceof File && file.size > 0);
    
    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files found. Please ensure files are properly selected.' },
        { status: 400 }
      );
    }

    const uploadedFileData: UploadedFile[] = [];
    const errors: Array<{ filename: string; error: string }> = [];

    for (const file of validFiles) {
      try {
        const validation = validateFile(file);
        
        if (!validation.valid) {
          errors.push({
            filename: file.name,
            error: validation.error || 'Unknown validation error'
          });
          continue;
        }

        const fileId = generateFileId();
        const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${fileId}_${cleanFilename}`;
        
        // Create file metadata
        const fileData: UploadedFile = {
          id: fileId,
          originalName: file.name,
          filename: filename,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          url: `/api/files/${fileId}`,
          downloadUrl: `/api/files/${fileId}/download`
        };

        // Add file to shared storage
        addFile(fileData);
        uploadedFileData.push(fileData);

      } catch (fileError) {
        errors.push({
          filename: file.name,
          error: `Processing error: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`
        });
      }
    }

    // Prepare response
    const response: any = {
      success: uploadedFileData.length > 0,
      files: uploadedFileData,
      uploaded: uploadedFileData.length,
      totalAttempted: validFiles.length
    };

    if (errors.length > 0) {
      response.errors = errors;
      response.message = `${uploadedFileData.length} file(s) uploaded successfully, ${errors.length} failed`;
    } else {
      response.message = `All ${uploadedFileData.length} file(s) uploaded successfully`;
    }

    const statusCode = uploadedFileData.length > 0 ? 201 : 400;
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process file upload',
        details: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
}

// GET /api/upload - Provide upload information and HTML form
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format');

  // Return HTML form for browser testing
  if (format === 'html') {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Upload Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .upload-form { border: 2px dashed #ccc; padding: 40px; text-align: center; border-radius: 8px; }
        .upload-form:hover { border-color: #007bff; }
        input[type="file"] { margin: 20px 0; }
        button { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .result { margin: 20px 0; padding: 15px; border-radius: 4px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🚀 File Upload Test</h1>
    <p>Test the file upload API directly from your browser</p>
    
    <form id="uploadForm" class="upload-form" enctype="multipart/form-data">
        <h3>📁 Select Files to Upload</h3>
        <input type="file" name="files" multiple accept="image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" required>
        <br>
        <button type="submit">Upload Files</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const resultDiv = document.getElementById('result');
            
            try {
                resultDiv.innerHTML = '<p>Uploading...</p>';
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = '<div class="result success"><h4>✅ Upload Successful!</h4><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                } else {
                    resultDiv.innerHTML = '<div class="result error"><h4>❌ Upload Failed</h4><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="result error"><h4>❌ Error</h4><p>' + error.message + '</p></div>';
            }
        });
    </script>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Return JSON API information
  return NextResponse.json({
    endpoint: '/api/upload',
    method: 'POST',
    contentType: 'multipart/form-data',
    fieldName: 'files',
    maxFileSize: '10MB',
    supportedTypes: [
      'Images: JPEG, PNG, GIF, WebP, SVG',
      'Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX',
      'Text: TXT, CSV, JSON',
      'Archives: ZIP',
      'Media: MP4, WebM, MP3, WAV'
    ],
    testPage: '/api/upload?format=html',
    example: {
      curl: 'curl -X POST -F "files=@example.pdf" -F "files=@image.jpg" /api/upload',
      javascript: `
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

fetch('/api/upload', {
  method: 'POST',
  body: formData
}).then(res => res.json())
  .then(data => console.log(data));`
    },
    listFiles: '/api/files',
    fileDetails: '/api/files/{fileId}'
  });
}