"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.asyncHandler = exports.createError = void 0;
const createError = (message, statusCode = 500, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFound = (req, res, next) => {
    const error = (0, exports.createError)(`API endpoint ${req.path} not found`, 404, 'NOT_FOUND');
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || err.status || 500;
    const errorResponse = {
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map