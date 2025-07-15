"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const storage_1 = require("./utils/storage");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Initialize storage directories
storage_1.storage.ensureDirectories().catch(console.error);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Family Tree API is running', timestamp: new Date().toISOString() });
});
// Mount API routes
app.use('/api', routes_1.default);
// 404 handler for API routes
app.use('/api', errorHandler_1.notFound);
// Global error handler
app.use(errorHandler_1.errorHandler);
// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map