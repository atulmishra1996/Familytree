"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const familyTreeValidation_1 = require("../familyTreeValidation");
describe('Family Tree Validation', () => {
    describe('createFamilyTreeSchema', () => {
        it('should validate a valid family tree creation input', () => {
            const validInput = {
                name: 'Smith Family Tree',
                rootPersonIds: ['123e4567-e89b-12d3-a456-426614174000']
            };
            const { error } = familyTreeValidation_1.createFamilyTreeSchema.validate(validInput);
            expect(error).toBeUndefined();
        });
        it('should require name', () => {
            const invalidInput = {
                rootPersonIds: []
            };
            const { error } = familyTreeValidation_1.createFamilyTreeSchema.validate(invalidInput);
            expect(error).toBeDefined();
            expect(error?.details[0].path).toContain('name');
        });
        it('should validate name length', () => {
            const invalidInput = {
                name: 'A'.repeat(101)
            };
            const { error } = familyTreeValidation_1.createFamilyTreeSchema.validate(invalidInput);
            expect(error).toBeDefined();
            expect(error?.details[0].path).toContain('name');
        });
        it('should validate rootPersonIds as UUIDs', () => {
            const invalidInput = {
                name: 'Test Tree',
                rootPersonIds: ['not-a-uuid']
            };
            const { error } = familyTreeValidation_1.createFamilyTreeSchema.validate(invalidInput);
            expect(error).toBeDefined();
            expect(error?.details[0].path).toContain('rootPersonIds');
        });
        it('should allow empty rootPersonIds', () => {
            const validInput = {
                name: 'Test Tree',
                rootPersonIds: []
            };
            const { error } = familyTreeValidation_1.createFamilyTreeSchema.validate(validInput);
            expect(error).toBeUndefined();
        });
    });
    describe('updateFamilyTreeSchema', () => {
        it('should validate a valid family tree update input', () => {
            const validInput = {
                name: 'Updated Family Tree'
            };
            const { error } = familyTreeValidation_1.updateFamilyTreeSchema.validate(validInput);
            expect(error).toBeUndefined();
        });
        it('should allow empty object for updates', () => {
            const { error } = familyTreeValidation_1.updateFamilyTreeSchema.validate({});
            expect(error).toBeUndefined();
        });
        it('should validate name length in updates', () => {
            const invalidInput = {
                name: 'A'.repeat(101)
            };
            const { error } = familyTreeValidation_1.updateFamilyTreeSchema.validate(invalidInput);
            expect(error).toBeDefined();
            expect(error?.details[0].path).toContain('name');
        });
    });
    describe('familyTreeIdSchema', () => {
        it('should validate a valid UUID', () => {
            const validId = '123e4567-e89b-12d3-a456-426614174000';
            const { error } = familyTreeValidation_1.familyTreeIdSchema.validate(validId);
            expect(error).toBeUndefined();
        });
        it('should reject invalid UUID format', () => {
            const invalidId = 'not-a-uuid';
            const { error } = familyTreeValidation_1.familyTreeIdSchema.validate(invalidId);
            expect(error).toBeDefined();
        });
        it('should require the ID to be present', () => {
            const { error } = familyTreeValidation_1.familyTreeIdSchema.validate(undefined);
            expect(error).toBeDefined();
        });
    });
});
//# sourceMappingURL=familyTreeValidation.test.js.map