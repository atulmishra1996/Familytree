"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.Storage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class Storage {
    constructor(dataDir = 'data') {
        this.dataDir = path_1.default.resolve(dataDir);
    }
    /**
     * Ensure data directory and subdirectories exist
     */
    async ensureDirectories() {
        try {
            await promises_1.default.mkdir(this.dataDir, { recursive: true });
            await promises_1.default.mkdir(path_1.default.join(this.dataDir, 'persons'), { recursive: true });
        }
        catch (error) {
            const storageError = new Error(`Failed to create data directories: ${error}`);
            storageError.code = 'DIRECTORY_CREATION_ERROR';
            storageError.statusCode = 500;
            throw storageError;
        }
    }
    /**
     * Read JSON data from file
     */
    async readJSON(filePath) {
        try {
            const fullPath = path_1.default.join(this.dataDir, filePath);
            const data = await promises_1.default.readFile(fullPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return null; // File doesn't exist
            }
            const storageError = new Error(`Failed to read file ${filePath}: ${error.message}`);
            storageError.code = 'FILE_READ_ERROR';
            storageError.statusCode = 500;
            throw storageError;
        }
    }
    /**
     * Write JSON data to file
     */
    async writeJSON(filePath, data) {
        try {
            const fullPath = path_1.default.join(this.dataDir, filePath);
            const jsonData = JSON.stringify(data, null, 2);
            await promises_1.default.writeFile(fullPath, jsonData, 'utf-8');
        }
        catch (error) {
            const storageError = new Error(`Failed to write file ${filePath}: ${error.message}`);
            storageError.code = 'FILE_WRITE_ERROR';
            storageError.statusCode = 500;
            throw storageError;
        }
    }
    /**
     * Delete a file
     */
    async deleteFile(filePath) {
        try {
            const fullPath = path_1.default.join(this.dataDir, filePath);
            await promises_1.default.unlink(fullPath);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return; // File doesn't exist, nothing to delete
            }
            const storageError = new Error(`Failed to delete file ${filePath}: ${error.message}`);
            storageError.code = 'FILE_DELETE_ERROR';
            storageError.statusCode = 500;
            throw storageError;
        }
    }
    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            const fullPath = path_1.default.join(this.dataDir, filePath);
            await promises_1.default.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * List files in a directory
     */
    async listFiles(dirPath) {
        try {
            const fullPath = path_1.default.join(this.dataDir, dirPath);
            const files = await promises_1.default.readdir(fullPath);
            return files.filter(file => file.endsWith('.json'));
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return []; // Directory doesn't exist
            }
            const storageError = new Error(`Failed to list files in ${dirPath}: ${error.message}`);
            storageError.code = 'DIRECTORY_READ_ERROR';
            storageError.statusCode = 500;
            throw storageError;
        }
    }
}
exports.Storage = Storage;
// Export singleton instance
exports.storage = new Storage();
//# sourceMappingURL=storage.js.map