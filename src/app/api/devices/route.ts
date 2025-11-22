import { NextResponse } from 'next/server';
import { devicesStore } from '@/data/mock-devices';

export async function GET() {
    const devices = await devicesStore.getAll();
    return NextResponse.json(devices);
}
