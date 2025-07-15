import { Person } from '../models/Person';
export declare class RelationshipUtils {
    /**
     * Creates a new person with generated ID and timestamps
     */
    static createPerson(input: Omit<Person, 'id' | 'fullName' | 'childrenIds' | 'createdAt' | 'updatedAt'>): Person;
    /**
     * Updates a person's full name when first or last name changes
     */
    static updateFullName(person: Person): Person;
    /**
     * Adds a child relationship between parent and child
     */
    static addChildRelationship(parent: Person, child: Person): {
        parent: Person;
        child: Person;
    };
    /**
     * Removes a child relationship between parent and child
     */
    static removeChildRelationship(parent: Person, child: Person): {
        parent: Person;
        child: Person;
    };
    /**
     * Validates that a person doesn't have more than 2 parents
     */
    static validateParentCount(person: Person): boolean;
    /**
     * Checks for circular relationships (person cannot be their own ancestor)
     */
    static hasCircularRelationship(persons: Person[], parentId: string, childId: string): boolean;
    /**
     * Gets all descendants of a person
     */
    static getDescendants(persons: Person[], personId: string): Person[];
    /**
     * Gets all ancestors of a person
     */
    static getAncestors(persons: Person[], personId: string): Person[];
    /**
     * Validates the integrity of all relationships in a family tree
     */
    static validateTreeIntegrity(persons: Person[]): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=relationshipUtils.d.ts.map