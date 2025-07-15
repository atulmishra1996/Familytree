"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const storage_1 = require("../storage");
describe('Storage Utility Tests', () => {
    let storage;
    const testDataDir = 'test-data';
    beforeEach(() => {
        storage = new storage_1.Storage(testDataDir);
    });
    afterEach(async () => {
        // Clean up test data directory
        try {
            await promises_1.default.rm(testDataDir, { recursive: true, force: true });
        }
        catch (error) {
            // Ignore cleanup errors
        }
    });
    describe('Directory Management', () => {
        it('should create data directories', async () => {
            await storage.ensureDirectories();
            const dataDir = await promises_1.default.stat(testDataDir);
            expect(dataDir.isDirectory()).toBe(true);
            const personsDir = await promises_1.default.stat(path_1.default.join(testDataDir, 'persons'));
            expect(personsDir.isDirectory()).toBe(true);
        });
    });
    describe('JSON File Operations', () => {
        beforeEach(async () => {
            await storage.ensureDirectories();
        });
        it('should write and read JSON data', async () => {
            const testData = { id: '1', name: 'Test Person', age: 30 };
            await storage.writeJSON('test.json', testData);
            const readData = await storage.readJSON('test.json');
            expect(readData).toEqual(testData);
        });
        it('should return null for non-existent files', async () => {
            const result = await storage.readJSON('non-existent.json');
            expect(result).toBeNull();
        });
        it('should handle file deletion', async () => {
            const testData = { test: 'data' };
            await storage.writeJSON('delete-test.json', testData);
            expect(await storage.fileExists('delete-test.json')).toBe(true);
            await storage.deleteFile('delete-test.json');
            expect(await storage.fileExists('delete-test.json')).toBe(false);
        });
        it('should check file existence', async () => {
            expect(await storage.fileExists('non-existent.json')).toBe(false);
            await storage.writeJSON('exists-test.json', { test: 'data' });
            expect(await storage.fileExists('exists-test.json')).toBe(true);
        });
        it('should list JSON files in directory', async () => {
            await storage.writeJSON('file1.json', { id: 1 });
            await storage.writeJSON('file2.json', { id: 2 });
            await storage.writeJSON('persons/person1.json', { id: 3 });
            const rootFiles = await storage.listFiles('.');
            expect(rootFiles).toContain('file1.json');
            expect(rootFiles).toContain('file2.json');
            expect(rootFiles).not.toContain('person1.json');
            const personFiles = await storage.listFiles('persons');
            expect(personFiles).toContain('person1.json');
        });
        it('should return empty array for non-existent directory', async () => {
            const files = await storage.listFiles('non-existent-dir');
            expect(files).toEqual([]);
        });
    });
    describe('Error Handling', () => {
        it('should throw StorageError for write failures', async () => {
            // Try to write to an invalid path
            const invalidStorage = new storage_1.Storage('/invalid/path/that/cannot/be/created');
            await expect(invalidStorage.writeJSON('test.json', {}))
                .rejects
                .toMatchObject({
                code: 'FILE_WRITE_ERROR',
                statusCode: 500
            });
        });
        it('should throw StorageError for read failures on corrupted files', async () => {
            await storage.ensureDirectories();
            // Create a file with invalid JSON
            const filePath = path_1.default.join(testDataDir, 'invalid.json');
            await promises_1.default.writeFile(filePath, 'invalid json content');
            await expect(storage.readJSON('invalid.json'))
                .rejects
                .toMatchObject({
                code: 'FILE_READ_ERROR',
                statusCode: 500
            });
        });
    });
});
//# sourceMappingURL=storage.test.js.map