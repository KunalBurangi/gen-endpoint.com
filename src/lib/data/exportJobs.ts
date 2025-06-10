export interface ExportJob {
  id: string;
  format: 'csv' | 'json' | 'xml';
  entity: string; // e.g., 'users', 'products', 'orders'
  status: 'processing' | 'completed' | 'failed' | 'cancelled' | 'pending';
  createdAt: string;
  updatedAt?: string;
  estimatedCompletion?: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  downloadUrl?: string;
  fileSize?: number;
  filename?: string;
  mimeType?: string;
  totalRecords?: number;
  filters?: any; // Store filters used for the export
  fields?: string[]; // Store fields selected for the export
  progress?: number; // Percentage, 0-100
  error?: string; // Reason for failure
}

// Initialize an in-memory array
let exportJobs: ExportJob[] = [];

// Function to generate a unique ID
function generateJobId(): string {
  return `export_${Math.random().toString(36).substring(2, 9)}`;
}

// Exported functions

export function getAllJobs(): ExportJob[] {
  return [...exportJobs];
}

export function getJobById(id: string): ExportJob | undefined {
  return exportJobs.find(job => job.id === id);
}

export function createExportJob(
  details: Omit<ExportJob, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'progress'>
): ExportJob {
  const newJob: ExportJob = {
    ...details,
    id: generateJobId(),
    status: 'pending', // Will be set to 'processing' by the route handler typically
    createdAt: new Date().toISOString(),
    progress: 0,
  };
  exportJobs.push(newJob);
  return newJob;
}

export function updateJob(
  id: string,
  updates: Partial<Omit<ExportJob, 'id' | 'createdAt' | 'format' | 'entity'>> // format & entity usually don't change
): ExportJob | undefined {
  const jobIndex = exportJobs.findIndex(job => job.id === id);
  if (jobIndex === -1) {
    return undefined;
  }

  const originalJob = exportJobs[jobIndex];

  // Ensure status transitions are logical if needed (e.g. can't go from completed to processing)
  // For this mock, we'll keep it simple.

  const updatedJobData: ExportJob = {
    ...originalJob,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Specific timestamp updates based on status
  if (updates.status) {
    if (updates.status === 'completed' && !updatedJobData.completedAt) {
      updatedJobData.completedAt = updatedJobData.updatedAt;
    } else if (updates.status === 'failed' && !updatedJobData.failedAt) {
      updatedJobData.failedAt = updatedJobData.updatedAt;
    } else if (updates.status === 'cancelled' && !updatedJobData.cancelledAt) {
      updatedJobData.cancelledAt = updatedJobData.updatedAt;
    }
  }

  exportJobs[jobIndex] = updatedJobData;
  return updatedJobData;
}

// Primarily for testing or cleanup, not part of the core API usually
export function deleteJob(id: string): boolean {
  const jobIndex = exportJobs.findIndex(job => job.id === id);
  if (jobIndex === -1) {
    return false;
  }
  exportJobs.splice(jobIndex, 1);
  return true;
}

// Utility to reset jobs if needed for testing environments
export function _resetJobsForTesting(): void {
  exportJobs = [];
}
