import { JsonFileStore } from '@/lib/store';

export interface Device {
    id: string;
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    osVersion?: string;
    appVersion?: string;
    pushToken?: string;
    tokenType?: 'apns' | 'fcm';
    deviceInfo?: Record<string, any>;
    status: 'active' | 'inactive';
    registeredAt: string;
    lastSeen: string;
    preferences?: {
        notifications?: {
            push: boolean;
            email: boolean;
            marketing: boolean;
        };
        quietHours?: {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        };
    };
}

const defaultDevices: Device[] = [
    {
        id: "dev_789",
        deviceId: "device_abc123",
        platform: "ios",
        deviceInfo: { model: "iPhone 15 Pro" },
        lastSeen: "2024-08-16T12:00:00Z",
        status: "active",
        registeredAt: "2024-08-16T12:00:00Z"
    }
];

export const devicesStore = new JsonFileStore<Device>('devices.json', defaultDevices);
