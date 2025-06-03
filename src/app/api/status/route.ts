
import { NextResponse } from 'next/server';

// Illustrative uptime start time (could be fetched from a persistent store or process start time)
const serviceStartTime = Date.now() - (Math.floor(Math.random() * 20000) + 10000) * 1000; // Random uptime between ~3-8 hours


export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - serviceStartTime) / 1000);
  return NextResponse.json({
    status: "operational",
    serviceName: "Gen-Endpoint Backend",
    version: "1.2.3", // This could be dynamic, e.g., from package.json
    uptimeSeconds: uptimeSeconds,
    lastChecked: new Date().toISOString()
  });
}
