"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Image, Video, Archive, X, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  downloadUrl: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export default function UploadTestPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [filesList, setFilesList] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    
    setSelectedFiles(prev => [...prev, ...fileArray]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      setUploadResult(result);

      if (response.ok) {
        // Clear selected files on success
        selectedFiles.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
        setSelectedFiles([]);
        // Refresh files list
        await fetchFilesList();
      }
    } catch (error) {
      setUploadResult({
        error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const fetchFilesList = async () => {
    try {
      // Use absolute URL for server-side rendering/static generation
      const baseUrl = typeof window === 'undefined'
        ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
        : '';
      const response = await fetch(`${baseUrl}/api/files?limit=10`);
      const data = await response.json();
      if (response.ok) {
        setFilesList(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
      // Optionally set an error state here to inform the user
    }
  };

  const testEndpoint = async (url: string, method: string = 'GET') => {
    try {
      const baseUrl = typeof window === 'undefined'
        ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
        : '';
      const response = await fetch(`${baseUrl}${url}`, { method });
      const data = await response.json();
      setUploadResult({
        endpoint: `${method} ${baseUrl}${url}`,
        status: response.status,
        data
      });
    } catch (error) {
      setUploadResult({
        endpoint: `${method} ${baseUrl}${url}`, // Keep baseUrl here for consistency in error reporting
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Load files list on component mount (client-side only)
  useEffect(() => {
    fetchFilesList();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">File Upload Test</h1>
          <p className="text-muted-foreground">Test the file upload API with drag & drop or file selection</p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
            <CardDescription>
              Supports images, documents, text files, and archives up to 10MB each
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drop files here or click to select</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: Images, PDF, Documents, Text files, Archives
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose Files
              </Button>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button and Progress */}
            <div className="space-y-4">
              <Button
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
              </Button>

              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Result */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResult.error ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {uploadResult.endpoint ? 'API Response' : uploadResult.error ? 'Upload Failed' : 'Upload Result'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* API Testing Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Test API Endpoints</CardTitle>
            <CardDescription>
              Test various file-related API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => testEndpoint('/api/files')}>
                List Files
              </Button>
              <Button variant="outline" onClick={() => testEndpoint('/api/files?type=image')}>
                List Images
              </Button>
              <Button variant="outline" onClick={() => testEndpoint('/api/files?limit=3')}>
                List 3 Files
              </Button>
              <Button variant="outline" onClick={() => testEndpoint('/api/upload')}>
                Upload Info
              </Button>
              <Button variant="outline" onClick={() => testEndpoint('/api/files/file_123')}>
                Get File Details
              </Button>
              <Button variant="outline" onClick={() => testEndpoint('/api/files/bulk')}>
                Bulk Operations Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Files */}
        {filesList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Files
              </CardTitle>
              <CardDescription>
                Last 10 uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filesList.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {file.id}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.downloadUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}