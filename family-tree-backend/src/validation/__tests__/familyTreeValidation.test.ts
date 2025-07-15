import { createFamilyTreeSchema, updateFamilyTreeSchema, familyTreeIdSchema } from '../familyTreeValidation';

describe('Family Tree Validation', () => {
  describe('createFamilyTreeSchema', () => {
    it('should validate a valid family tree creation input', () => {
      const validInput = {
        name: 'Smith Family Tree',
        rootPersonIds: ['123e4567-e89b-12d3-a456-426614174000']
      };

      const { error } = createFamilyTreeSchema.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should require name', () => {
      const invalidInput = {
        rootPersonIds: []
      };

      const { error } = createFamilyTreeSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('name');
    });

    it('should validate name length', () => {
      const invalidInput = {
        name: 'A'.repeat(101)
      };

      const { error } = createFamilyTreeSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('name');
    });

    it('should validate rootPersonIds as UUIDs', () => {
      const invalidInput = {
        name: 'Test Tree',
        rootPersonIds: ['not-a-uuid']
      };

      const { error } = createFamilyTreeSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('rootPersonIds');
    });

    it('should allow empty rootPersonIds', () => {
      const validInput = {
        name: 'Test Tree',
        rootPersonIds: []
      };

      const { error } = createFamilyTreeSchema.validate(validInput);
      expect(error).toBeUndefined();
    });
  });

  describe('updateFamilyTreeSchema', () => {
    it('should validate a valid family tree update input', () => {
      const validInput = {
        name: 'Updated Family Tree'
      };

      const { error } = updateFamilyTreeSchema.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should allow empty object for updates', () => {
      const { error } = updateFamilyTreeSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should validate name length in updates', () => {
      const invalidInput = {
        name: 'A'.repeat(101)
      };

      const { error } = updateFamilyTreeSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('name');
    });
  });

  describe('familyTreeIdSchema', () => {
    it('should validate a valid UUID', () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      const { error } = familyTreeIdSchema.validate(validId);
      expect(error).toBeUndefined();
    });

    it('should reject invalid UUID format', () => {
      const invalidId = 'not-a-uuid';
      const { error } = familyTreeIdSchema.validate(invalidId);
      expect(error).toBeDefined();
    });

    it('should require the ID to be present', () => {
      const { error } = familyTreeIdSchema.validate(undefined);
      expect(error).toBeDefined();
    });
  });
});