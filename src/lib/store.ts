import fs from 'fs/promises';
import path from 'path';

export class JsonFileStore<T extends { id: string }> {
    private filePath: string;
    private defaultData: T[];

    constructor(fileName: string, defaultData: T[] = []) {
        this.filePath = path.join(process.cwd(), 'data', fileName);
        this.defaultData = defaultData;
    }

    private async ensureFile() {
        try {
            await fs.access(this.filePath);
        } catch {
            const dir = path.dirname(this.filePath);
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
            await fs.writeFile(this.filePath, JSON.stringify(this.defaultData, null, 2));
        }
    }

    async read(): Promise<T[]> {
        await this.ensureFile();
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data);
    }

    async write(data: T[]): Promise<void> {
        await this.ensureFile();
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    async getAll(): Promise<T[]> {
        return this.read();
    }

    async getById(id: string): Promise<T | undefined> {
        const items = await this.read();
        return items.find((item) => item.id === id);
    }

    async add(item: T): Promise<T> {
        const items = await this.read();
        items.push(item);
        await this.write(items);
        return item;
    }

    async update(id: string, updates: Partial<T>): Promise<T | null> {
        const items = await this.read();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates };
        await this.write(items);
        return items[index];
    }

    async delete(id: string): Promise<boolean> {
        const items = await this.read();
        const initialLength = items.length;
        const filtered = items.filter((item) => item.id !== id);

        if (filtered.length === initialLength) return false;

        await this.write(filtered);
        return true;
    }
}
