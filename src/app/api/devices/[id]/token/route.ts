import { NextResponse } from 'next/server';
import { devicesStore, type Device } from '@/data/mock-devices';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const deviceId = (await params).id;
        const body = await request.json();
        const { pushToken, tokenType } = body;

        if (!pushToken) {
            return NextResponse.json(
                { error: 'Missing required field: pushToken' },
                { status: 400 }
            );
        }

        const allDevices = await devicesStore.getAll();
        const device = allDevices.find(d => d.deviceId === deviceId);

        if (!device) {
            return NextResponse.json(
                { error: 'Device not found' },
                { status: 404 }
            );
        }

        const updates: Partial<Device> = {
            pushToken,
            lastSeen: new Date().toISOString()
        };
        if (tokenType) updates.tokenType = tokenType;

        await devicesStore.update(device.id, updates);

        return NextResponse.json({
            deviceId: device.deviceId,
            pushToken,
            updatedAt: new Date().toISOString(),
            status: 'token_updated'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
