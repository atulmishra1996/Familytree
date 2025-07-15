import { RelationshipUtils } from '../relationshipUtils';
import { Person } from '../../models/Person';

describe('RelationshipUtils', () => {
  const mockPerson = (overrides: Partial<Person> = {}): Person => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    parentIds: [],
    childrenIds: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ...overrides
  });

  describe('createPerson', () => {
    it('should create a person with generated ID and timestamps', () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Smith',
        parentIds: []
      };

      const person = RelationshipUtils.createPerson(input);

      expect(person.id).toBeDefined();
      expect(person.fullName).toBe('Jane Smith');
      expect(person.childrenIds).toEqual([]);
      expect(person.createdAt).toBeInstanceOf(Date);
      expect(person.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateFullName', () => {
    it('should update full name and timestamp', () => {
      const person = mockPerson({ firstName: 'Jane', lastName: 'Smith' });
      const originalUpdatedAt = person.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        const updatedPerson = RelationshipUtils.updateFullName(person);

        expect(updatedPerson.fullName).toBe('Jane Smith');
        expect(updatedPerson.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });
  });

  describe('addChildRelationship', () => {
    it('should add child to parent and parent to child', () => {
      const parent = mockPerson({ id: 'parent-id', childrenIds: [] });
      const child = mockPerson({ id: 'child-id', parentIds: [] });

      const result = RelationshipUtils.addChildRelationship(parent, child);

      expect(result.parent.childrenIds).toContain('child-id');
      expect(result.child.parentIds).toContain('parent-id');
      expect(result.parent.updatedAt).toBeInstanceOf(Date);
      expect(result.child.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve existing relationships', () => {
      const parent = mockPerson({ 
        id: 'parent-id', 
        childrenIds: ['existing-child'] 
      });
      const child = mockPerson({ 
        id: 'child-id', 
        parentIds: ['existing-parent'] 
      });

      const result = RelationshipUtils.addChildRelationship(parent, child);

      expect(result.parent.childrenIds).toEqual(['existing-child', 'child-id']);
      expect(result.child.parentIds).toEqual(['existing-parent', 'parent-id']);
    });
  });

  describe('removeChildRelationship', () => {
    it('should remove child from parent and parent from child', () => {
      const parent = mockPerson({ 
        id: 'parent-id', 
        childrenIds: ['child-id', 'other-child'] 
      });
      const child = mockPerson({ 
        id: 'child-id', 
        parentIds: ['parent-id', 'other-parent'] 
      });

      const result = RelationshipUtils.removeChildRelationship(parent, child);

      expect(result.parent.childrenIds).toEqual(['other-child']);
      expect(result.child.parentIds).toEqual(['other-parent']);
    });
  });

  describe('validateParentCount', () => {
    it('should return true for person with 0 parents', () => {
      const person = mockPerson({ parentIds: [] });
      expect(RelationshipUtils.validateParentCount(person)).toBe(true);
    });

    it('should return true for person with 1 parent', () => {
      const person = mockPerson({ parentIds: ['parent1'] });
      expect(RelationshipUtils.validateParentCount(person)).toBe(true);
    });

    it('should return true for person with 2 parents', () => {
      const person = mockPerson({ parentIds: ['parent1', 'parent2'] });
      expect(RelationshipUtils.validateParentCount(person)).toBe(true);
    });

    it('should return false for person with more than 2 parents', () => {
      const person = mockPerson({ parentIds: ['parent1', 'parent2', 'parent3'] });
      expect(RelationshipUtils.validateParentCount(person)).toBe(false);
    });
  });

  describe('hasCircularRelationship', () => {
    it('should detect direct circular relationship', () => {
      const persons = [
        mockPerson({ id: 'person1', parentIds: [], childrenIds: ['person2'] }),
        mockPerson({ id: 'person2', parentIds: ['person1'], childrenIds: [] })
      ];

      const hasCircular = RelationshipUtils.hasCircularRelationship(persons, 'person2', 'person1');
      expect(hasCircular).toBe(true);
    });

    it('should detect indirect circular relationship', () => {
      const persons = [
        mockPerson({ id: 'person1', parentIds: [], childrenIds: ['person2'] }),
        mockPerson({ id: 'person2', parentIds: ['person1'], childrenIds: ['person3'] }),
        mockPerson({ id: 'person3', parentIds: ['person2'], childrenIds: [] })
      ];

      const hasCircular = RelationshipUtils.hasCircularRelationship(persons, 'person3', 'person1');
      expect(hasCircular).toBe(true);
    });

    it('should return false for valid relationships', () => {
      const persons = [
        mockPerson({ id: 'parent', parentIds: [], childrenIds: ['child'] }),
        mockPerson({ id: 'child', parentIds: ['parent'], childrenIds: [] })
      ];

      const hasCircular = RelationshipUtils.hasCircularRelationship(persons, 'parent', 'child');
      expect(hasCircular).toBe(false);
    });
  });

  describe('getDescendants', () => {
    it('should return all descendants', () => {
      const persons = [
        mockPerson({ id: 'grandparent', childrenIds: ['parent1', 'parent2'] }),
        mockPerson({ id: 'parent1', parentIds: ['grandparent'], childrenIds: ['child1'] }),
        mockPerson({ id: 'parent2', parentIds: ['grandparent'], childrenIds: ['child2'] }),
        mockPerson({ id: 'child1', parentIds: ['parent1'], childrenIds: [] }),
        mockPerson({ id: 'child2', parentIds: ['parent2'], childrenIds: [] })
      ];

      const descendants = RelationshipUtils.getDescendants(persons, 'grandparent');
      const descendantIds = descendants.map(p => p.id);

      expect(descendantIds).toContain('parent1');
      expect(descendantIds).toContain('parent2');
      expect(descendantIds).toContain('child1');
      expect(descendantIds).toContain('child2');
      expect(descendants).toHaveLength(4);
    });
  });

  describe('getAncestors', () => {
    it('should return all ancestors', () => {
      const persons = [
        mockPerson({ id: 'grandparent', childrenIds: ['parent'] }),
        mockPerson({ id: 'parent', parentIds: ['grandparent'], childrenIds: ['child'] }),
        mockPerson({ id: 'child', parentIds: ['parent'], childrenIds: [] })
      ];

      const ancestors = RelationshipUtils.getAncestors(persons, 'child');
      const ancestorIds = ancestors.map(p => p.id);

      expect(ancestorIds).toContain('parent');
      expect(ancestorIds).toContain('grandparent');
      expect(ancestors).toHaveLength(2);
    });
  });

  describe('validateTreeIntegrity', () => {
    it('should return valid for a well-formed tree', () => {
      const persons = [
        mockPerson({ 
          id: 'parent', 
          childrenIds: ['child'],
          parentIds: []
        }),
        mockPerson({ 
          id: 'child', 
          parentIds: ['parent'],
          childrenIds: []
        })
      ];

      const result = RelationshipUtils.validateTreeIntegrity(persons);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect person with too many parents', () => {
      const persons = [
        mockPerson({ 
          id: 'child', 
          parentIds: ['parent1', 'parent2', 'parent3'],
          childrenIds: []
        })
      ];

      const result = RelationshipUtils.validateTreeIntegrity(persons);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('more than 2 parents');
    });

    it('should detect missing parent reference', () => {
      const persons = [
        mockPerson({ 
          id: 'child', 
          parentIds: ['non-existent-parent'],
          childrenIds: []
        })
      ];

      const result = RelationshipUtils.validateTreeIntegrity(persons);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('non-existent parent');
    });

    it('should detect inconsistent parent-child relationships', () => {
      const persons = [
        mockPerson({ 
          id: 'parent', 
          childrenIds: [],
          parentIds: []
        }),
        mockPerson({ 
          id: 'child', 
          parentIds: ['parent'],
          childrenIds: []
        })
      ];

      const result = RelationshipUtils.validateTreeIntegrity(persons);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("doesn't have");
    });
  });
});