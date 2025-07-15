import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}
export declare const createError: (message: string, statusCode?: number, code?: string) => ApiError;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map