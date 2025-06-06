import { type NextRequest, NextResponse } from 'next/server';

// Mock data stores
const users = [
  { id: 'usr_1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'usr_2', name: 'Bob Builder', email: 'bob@example.com', role: 'editor', createdAt: '2024-01-11T11:00:00Z' },
  { id: 'usr_3', name: 'Charlie Chaplin', email: 'charlie@example.com', role: 'viewer', createdAt: '2024-01-12T12:00:00Z' }
];

const products = [
  { id: 'prod_1', name: 'JavaScript Book', category: 'Books', price: 29.99, stock: 50 },
  { id: 'prod_2', name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 25 },
  { id: 'prod_3', name: 'Coffee Beans', category: 'Groceries', price: 15.99, stock: 100 }
];

const orders = [
  { id: 'ord_1', userId: 'usr_1', total: 129.98, status: 'completed', createdAt: '2024-08-15T10:00:00Z' },
  { id: 'ord_2', userId: 'usr_2', total: 45.98, status: 'pending', createdAt: '2024-08-16T11:00:00Z' }
];

let exportJobs: any[] = [];
let jobCounter = 1;

interface Params {
  format: string;
}

function generateJobId(): string {
  return `export_${jobCounter++}`;
}

function getDataByEntity(entity: string): any[] {
  switch (entity.toLowerCase()) {
    case 'users':
      return users;
    case 'products':
      return products;
    case 'orders':
      return orders;
    default:
      return [];
  }
}

function applyFilters(data: any[], filters: any): any[] {
  if (!filters) return data;

  return data.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

function selectFields(data: any[], fields?: string[]): any[] {
  if (!fields || fields.length === 0) return data;

  return data.map(item => {
    const filtered: any = {};
    fields.forEach(field => {
      if (item.hasOwnProperty(field)) {
        filtered[field] = item[field];
      }
    });
    return filtered;
  });
}

function formatData(data: any[], format: string): { content: string; mimeType: string; filename: string } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  switch (format.toLowerCase()) {
    case 'csv':
      if (data.length === 0) {
        return { content: '', mimeType: 'text/csv', filename: `export-${timestamp}.csv` };
      }
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      const content = [headers, ...rows].join('\n');
      
      return { content, mimeType: 'text/csv', filename: `export-${timestamp}.csv` };
      
    case 'json':
      return { 
        content: JSON.stringify(data, null, 2), 
        mimeType: 'application/json',
        filename: `export-${timestamp}.json`
      };
      
    case 'xml':
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<data>
${data.map(item => `  <item>
${Object.entries(item).map(([key, value]) => `    <${key}>${value}</${key}>`).join('\n')}
  </item>`).join('\n')}
</data>`;
      return { content: xmlContent, mimeType: 'application/xml', filename: `export-${timestamp}.xml` };
      
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// POST /api/export/{format} - Export data in specified format
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { format } = params;
  
  try {
    const body = await request.json();
    const { entity = 'users', filters, fields, includeHeaders = true } = body;

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity parameter is required' },
        { status: 400 }
      );
    }

    // Validate format
    const supportedFormats = ['csv', 'json', 'xml'];
    if (!supportedFormats.includes(format.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported format. Supported formats: ${supportedFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Get data
    let data = getDataByEntity(entity);
    if (data.length === 0) {
      return NextResponse.json(
        { error: `No data available for entity: ${entity}` },
        { status: 404 }
      );
    }

    // Apply filters
    data = applyFilters(data, filters);

    // Select specific fields
    data = selectFields(data, fields);

    // Create export job
    const jobId = generateJobId();
    const estimatedCompletion = new Date(Date.now() + 5000); // 5 seconds from now
    
    const exportJob = {
      id: jobId,
      format: format.toLowerCase(),
      entity,
      status: 'processing',
      totalRecords: data.length,
      createdAt: new Date().toISOString(),
      estimatedCompletion: estimatedCompletion.toISOString(),
      filters,
      fields
    };

    exportJobs.push(exportJob);

    // Simulate async processing
    setTimeout(() => {
      const jobIndex = exportJobs.findIndex(j => j.id === jobId);
      if (jobIndex >= 0) {
        const { content, mimeType, filename } = formatData(data, format);
        
        exportJobs[jobIndex] = {
          ...exportJobs[jobIndex],
          status: 'completed',
          completedAt: new Date().toISOString(),
          downloadUrl: `/api/export/download/${jobId}`,
          fileSize: Buffer.byteLength(content, 'utf8'),
          filename,
          mimeType
        };
      }
    }, 2000);

    return NextResponse.json({
      jobId,
      status: 'processing',
      format: format.toLowerCase(),
      entity,
      totalRecords: data.length,
      estimatedCompletion: exportJob.estimatedCompletion,
      statusUrl: `/api/export/status/${jobId}`
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or export processing error' },
      { status: 400 }
    );
  }
}

// GET /api/export/{format} - Get format information
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { format } = params;
  
  const formatInfo: any = {
    csv: {
      format: 'csv',
      mimeType: 'text/csv',
      description: 'Comma-separated values format',
      features: ['Headers included', 'Automatic quoting for special characters']
    },
    json: {
      format: 'json',
      mimeType: 'application/json',
      description: 'JavaScript Object Notation format',
      features: ['Structured data', 'Nested objects supported', 'Human readable']
    },
    xml: {
      format: 'xml',
      mimeType: 'application/xml',
      description: 'Extensible Markup Language format',
      features: ['Structured data', 'Self-describing', 'Industry standard']
    }
  };

  const info = formatInfo[format.toLowerCase()];
  if (!info) {
    return NextResponse.json(
      { error: `Unsupported format: ${format}. Supported formats: ${Object.keys(formatInfo).join(', ')}` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ...info,
    supportedEntities: ['users', 'products', 'orders'],
    exampleRequest: {
      entity: 'users',
      filters: { role: 'admin' },
      fields: ['name', 'email', 'createdAt']
    }
  });
}