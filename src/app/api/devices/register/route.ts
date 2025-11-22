import { NextResponse } from 'next/server';
import { devicesStore, type Device } from '@/data/mock-devices';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { deviceId, platform, osVersion, appVersion, pushToken, deviceInfo } = body;

        if (!deviceId || !platform) {
            return NextResponse.json(
                { error: 'Missing required fields: deviceId, platform' },
                { status: 400 }
            );
        }

        // Check if device already exists
        const allDevices = await devicesStore.getAll();
        const existingDevice = allDevices.find(d => d.deviceId === deviceId);

        if (existingDevice) {
            // Update existing
            const updates: Partial<Device> = {
                lastSeen: new Date().toISOString(),
                status: 'active'
            };
            if (pushToken) updates.pushToken = pushToken;
            if (osVersion) updates.osVersion = osVersion;
            if (appVersion) updates.appVersion = appVersion;
            if (deviceInfo) updates.deviceInfo = deviceInfo;

            const updatedDevice = await devicesStore.update(existingDevice.id, updates);
            return NextResponse.json(updatedDevice);
        }

        // Register new
        const newDevice: Device = {
            id: `dev_${nanoid(6)}`,
            deviceId,
            platform,
            osVersion,
            appVersion,
            pushToken,
            deviceInfo,
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };

        const addedDevice = await devicesStore.add(newDevice);

        return NextResponse.json(addedDevice, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
