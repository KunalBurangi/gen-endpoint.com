import { NextResponse } from 'next/server';
import { devicesStore, type Device } from '@/data/mock-devices';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const deviceId = (await params).id;
        const body = await request.json();
        const { notifications, quietHours } = body;

        const allDevices = await devicesStore.getAll();
        const device = allDevices.find(d => d.deviceId === deviceId);

        if (!device) {
            return NextResponse.json(
                { error: 'Device not found' },
                { status: 404 }
            );
        }

        const updatedPreferences = device.preferences || {};
        if (notifications) updatedPreferences.notifications = notifications;
        if (quietHours) updatedPreferences.quietHours = quietHours;

        const updates: Partial<Device> = {
            preferences: updatedPreferences,
            lastSeen: new Date().toISOString()
        };

        await devicesStore.update(device.id, updates);

        return NextResponse.json({
            deviceId: device.deviceId,
            preferences: updatedPreferences,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
