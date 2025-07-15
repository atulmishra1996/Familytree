import { createPersonSchema, updatePersonSchema, personIdSchema } from '../personValidation';

describe('Person Validation', () => {
  describe('createPersonSchema', () => {
    it('should validate a valid person creation input', () => {
      const validInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1990-01-01'),
        placeOfBirth: 'New York',
        phoneNumber: '+1234567890',
        parentIds: [],
        notes: 'Test person'
      };

      const { error } = createPersonSchema.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should require firstName and lastName', () => {
      const invalidInput = {
        email: 'john.doe@example.com'
      };

      const { error } = createPersonSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('firstName');
    });

    it('should validate email format', () => {
      const invalidInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      const { error } = createPersonSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('email');
    });

    it('should validate phone number format', () => {
      const invalidInput = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: 'invalid-phone'
      };

      const { error } = createPersonSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('phoneNumber');
    });

    it('should limit parentIds to maximum of 2', () => {
      const invalidInput = {
        firstName: 'John',
        lastName: 'Doe',
        parentIds: ['id1', 'id2', 'id3']
      };

      const { error } = createPersonSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('parentIds');
    });

    it('should validate string length limits', () => {
      const invalidInput = {
        firstName: 'A'.repeat(51),
        lastName: 'Doe'
      };

      const { error } = createPersonSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('firstName');
    });
  });

  describe('updatePersonSchema', () => {
    it('should validate a valid person update input', () => {
      const validInput = {
        firstName: 'Jane',
        email: 'jane.doe@example.com'
      };

      const { error } = updatePersonSchema.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should allow empty object for updates', () => {
      const { error } = updatePersonSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should validate email format in updates', () => {
      const invalidInput = {
        email: 'invalid-email'
      };

      const { error } = updatePersonSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('email');
    });
  });

  describe('personIdSchema', () => {
    it('should validate a valid UUID', () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      const { error } = personIdSchema.validate(validId);
      expect(error).toBeUndefined();
    });

    it('should reject invalid UUID format', () => {
      const invalidId = 'not-a-uuid';
      const { error } = personIdSchema.validate(invalidId);
      expect(error).toBeDefined();
    });

    it('should require the ID to be present', () => {
      const { error } = personIdSchema.validate(undefined);
      expect(error).toBeDefined();
    });
  });
});