"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
describe('Server Integration Tests', () => {
    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/health')
                .expect(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('message', 'Family Tree API is running');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
    describe('Error Handling', () => {
        it('should return 404 for non-existent API endpoints', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/non-existent')
                .expect(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
            expect(response.body.error).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
        });
        it('should handle malformed JSON in request body', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('CORS', () => {
        it('should include CORS headers', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/health')
                .expect(200);
            expect(response.headers).toHaveProperty('access-control-allow-origin');
        });
    });
    describe('Route Structure', () => {
        it('should have person routes implemented', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/persons')
                .expect(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('count');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
        it('should have tree routes placeholder', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/tree')
                .expect(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('availableEndpoints');
            expect(Array.isArray(response.body.availableEndpoints)).toBe(true);
        });
    });
});
//# sourceMappingURL=server.test.js.map