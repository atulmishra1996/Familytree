export interface StorageError extends Error {
    code: string;
    statusCode: number;
}
export declare class Storage {
    private dataDir;
    constructor(dataDir?: string);
    /**
     * Ensure data directory and subdirectories exist
     */
    ensureDirectories(): Promise<void>;
    /**
     * Read JSON data from file
     */
    readJSON<T>(filePath: string): Promise<T | null>;
    /**
     * Write JSON data to file
     */
    writeJSON<T>(filePath: string, data: T): Promise<void>;
    /**
     * Delete a file
     */
    deleteFile(filePath: string): Promise<void>;
    /**
     * Check if file exists
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * List files in a directory
     */
    listFiles(dirPath: string): Promise<string[]>;
}
export declare const storage: Storage;
//# sourceMappingURL=storage.d.ts.map