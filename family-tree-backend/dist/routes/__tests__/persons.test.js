"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index"));
const storage_1 = require("../../utils/storage");
const uuid_1 = require("uuid");
describe('Person API Endpoints', () => {
    beforeEach(async () => {
        // Clean up test data before each test
        await storage_1.storage.ensureDirectories();
        // Clear any existing test data
        const personFiles = await storage_1.storage.listFiles('persons');
        for (const file of personFiles) {
            await storage_1.storage.deleteFile(`persons/${file}`);
        }
    });
    afterAll(async () => {
        // Clean up after all tests
        const personFiles = await storage_1.storage.listFiles('persons');
        for (const file of personFiles) {
            await storage_1.storage.deleteFile(`persons/${file}`);
        }
    });
    describe('GET /api/persons', () => {
        it('should return empty array when no persons exist', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/persons')
                .expect(200);
            expect(response.body).toEqual({
                success: true,
                data: [],
                count: 0
            });
        });
        it('should return all persons when they exist', async () => {
            // Create test persons
            const person1 = {
                id: (0, uuid_1.v4)(),
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const person2 = {
                id: (0, uuid_1.v4)(),
                firstName: 'Jane',
                lastName: 'Smith',
                fullName: 'Jane Smith',
                email: 'jane@example.com',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${person1.id}.json`, person1);
            await storage_1.storage.writeJSON(`persons/${person2.id}.json`, person2);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/persons')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(2);
            expect(response.body.data).toHaveLength(2);
            const returnedIds = response.body.data.map((p) => p.id);
            expect(returnedIds).toContain(person1.id);
            expect(returnedIds).toContain(person2.id);
        });
    });
    describe('GET /api/persons/:id', () => {
        it('should return person when valid ID is provided', async () => {
            const person = {
                id: (0, uuid_1.v4)(),
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                email: 'john@example.com',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${person.id}.json`, person);
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/persons/${person.id}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(person.id);
            expect(response.body.data.firstName).toBe('John');
            expect(response.body.data.lastName).toBe('Doe');
            expect(response.body.data.email).toBe('john@example.com');
        });
        it('should return 404 when person does not exist', async () => {
            const nonExistentId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/persons/${nonExistentId}`)
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('PERSON_NOT_FOUND');
        });
        it('should return 400 when invalid ID format is provided', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/persons/invalid-id')
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
    describe('POST /api/persons', () => {
        it('should create person with valid data', async () => {
            const personData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                placeOfBirth: 'New York',
                phoneNumber: '+1234567890',
                notes: 'Test person'
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .send(personData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('John');
            expect(response.body.data.lastName).toBe('Doe');
            expect(response.body.data.fullName).toBe('John Doe');
            expect(response.body.data.email).toBe('john@example.com');
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.createdAt).toBeDefined();
            expect(response.body.data.updatedAt).toBeDefined();
            expect(response.body.data.parentIds).toEqual([]);
            expect(response.body.data.childrenIds).toEqual([]);
        });
        it('should create person with parent relationships', async () => {
            // Create parent first
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            const personData = {
                firstName: 'Child',
                lastName: 'Doe',
                parentIds: [parent.id]
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .send(personData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.parentIds).toContain(parent.id);
            // Check that parent was updated
            const updatedParent = await storage_1.storage.readJSON(`persons/${parent.id}.json`);
            expect(updatedParent?.childrenIds).toContain(response.body.data.id);
        });
        it('should return 400 when required fields are missing', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .send({ firstName: 'John' }) // Missing lastName
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
        it('should return 400 when parent does not exist', async () => {
            const nonExistentParentId = (0, uuid_1.v4)();
            const personData = {
                firstName: 'Child',
                lastName: 'Doe',
                parentIds: [nonExistentParentId]
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .send(personData)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('PARENT_NOT_FOUND');
        });
        it('should return 400 when more than 2 parents are provided', async () => {
            const personData = {
                firstName: 'Child',
                lastName: 'Doe',
                parentIds: [(0, uuid_1.v4)(), (0, uuid_1.v4)(), (0, uuid_1.v4)()]
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .send(personData)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toBe('Invalid person data');
        });
        it('should return 400 when invalid email format is provided', async () => {
            const personData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email'
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/persons')
                .send(personData)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
    describe('PUT /api/persons/:id', () => {
        it('should update person with valid data', async () => {
            const person = {
                id: (0, uuid_1.v4)(),
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                email: 'john@example.com',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${person.id}.json`, person);
            const updateData = {
                firstName: 'Johnny',
                email: 'johnny@example.com',
                notes: 'Updated person'
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/persons/${person.id}`)
                .send(updateData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('Johnny');
            expect(response.body.data.lastName).toBe('Doe'); // Should remain unchanged
            expect(response.body.data.fullName).toBe('Johnny Doe'); // Should be updated
            expect(response.body.data.email).toBe('johnny@example.com');
            expect(response.body.data.notes).toBe('Updated person');
        });
        it('should return 404 when person does not exist', async () => {
            const nonExistentId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/persons/${nonExistentId}`)
                .send({ firstName: 'Updated' })
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('PERSON_NOT_FOUND');
        });
        it('should return 400 when invalid data is provided', async () => {
            const person = {
                id: (0, uuid_1.v4)(),
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${person.id}.json`, person);
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/persons/${person.id}`)
                .send({ email: 'invalid-email' })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
    describe('DELETE /api/persons/:id', () => {
        it('should delete person and clean up relationships', async () => {
            // Create parent, child, and target person
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const person = {
                id: (0, uuid_1.v4)(),
                firstName: 'Target',
                lastName: 'Person',
                fullName: 'Target Person',
                parentIds: [parent.id],
                childrenIds: [child.id],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Update relationships
            parent.childrenIds = [person.id];
            child.parentIds = [person.id];
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            await storage_1.storage.writeJSON(`persons/${person.id}.json`, person);
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/persons/${person.id}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(person.id);
            // Check that person was deleted
            const deletedPerson = await storage_1.storage.readJSON(`persons/${person.id}.json`);
            expect(deletedPerson).toBeNull();
            // Check that relationships were cleaned up
            const updatedParent = await storage_1.storage.readJSON(`persons/${parent.id}.json`);
            const updatedChild = await storage_1.storage.readJSON(`persons/${child.id}.json`);
            expect(updatedParent?.childrenIds).not.toContain(person.id);
            expect(updatedChild?.parentIds).not.toContain(person.id);
        });
        it('should return 404 when person does not exist', async () => {
            const nonExistentId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/persons/${nonExistentId}`)
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('PERSON_NOT_FOUND');
        });
    });
    describe('POST /api/persons/:id/children', () => {
        it('should add child relationship successfully', async () => {
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/persons/${parent.id}/children`)
                .send({ childId: child.id })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.parent.childrenIds).toContain(child.id);
            expect(response.body.data.child.parentIds).toContain(parent.id);
        });
        it('should return 400 when relationship already exists', async () => {
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [parent.id],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            parent.childrenIds = [child.id];
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/persons/${parent.id}/children`)
                .send({ childId: child.id })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('RELATIONSHIP_EXISTS');
        });
        it('should return 400 when child already has 2 parents', async () => {
            const parent1 = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent1',
                lastName: 'Doe',
                fullName: 'Parent1 Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const parent2 = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent2',
                lastName: 'Doe',
                fullName: 'Parent2 Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const parent3 = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent3',
                lastName: 'Doe',
                fullName: 'Parent3 Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [parent1.id, parent2.id], // Already has 2 parents
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${parent1.id}.json`, parent1);
            await storage_1.storage.writeJSON(`persons/${parent2.id}.json`, parent2);
            await storage_1.storage.writeJSON(`persons/${parent3.id}.json`, parent3);
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/persons/${parent3.id}/children`)
                .send({ childId: child.id })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('TOO_MANY_PARENTS');
        });
        it('should return 404 when parent does not exist', async () => {
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const nonExistentParentId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/persons/${nonExistentParentId}/children`)
                .send({ childId: child.id })
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('PARENT_NOT_FOUND');
        });
        it('should return 404 when child does not exist', async () => {
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            const nonExistentChildId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/persons/${parent.id}/children`)
                .send({ childId: nonExistentChildId })
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('CHILD_NOT_FOUND');
        });
    });
    describe('DELETE /api/persons/:parentId/children/:childId', () => {
        it('should remove child relationship successfully', async () => {
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [parent.id],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            parent.childrenIds = [child.id];
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/persons/${parent.id}/children/${child.id}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.parent.childrenIds).not.toContain(child.id);
            expect(response.body.data.child.parentIds).not.toContain(parent.id);
        });
        it('should return 400 when relationship does not exist', async () => {
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/persons/${parent.id}/children/${child.id}`)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('RELATIONSHIP_NOT_EXISTS');
        });
        it('should return 404 when parent does not exist', async () => {
            const child = {
                id: (0, uuid_1.v4)(),
                firstName: 'Child',
                lastName: 'Doe',
                fullName: 'Child Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${child.id}.json`, child);
            const nonExistentParentId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/persons/${nonExistentParentId}/children/${child.id}`)
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('PARENT_NOT_FOUND');
        });
        it('should return 404 when child does not exist', async () => {
            const parent = {
                id: (0, uuid_1.v4)(),
                firstName: 'Parent',
                lastName: 'Doe',
                fullName: 'Parent Doe',
                parentIds: [],
                childrenIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storage_1.storage.writeJSON(`persons/${parent.id}.json`, parent);
            const nonExistentChildId = (0, uuid_1.v4)();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/persons/${parent.id}/children/${nonExistentChildId}`)
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('CHILD_NOT_FOUND');
        });
    });
});
//# sourceMappingURL=persons.test.js.map