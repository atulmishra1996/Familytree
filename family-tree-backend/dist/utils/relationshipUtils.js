"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipUtils = void 0;
const uuid_1 = require("uuid");
class RelationshipUtils {
    /**
     * Creates a new person with generated ID and timestamps
     */
    static createPerson(input) {
        const now = new Date();
        return {
            ...input,
            id: (0, uuid_1.v4)(),
            fullName: `${input.firstName} ${input.lastName}`,
            childrenIds: [],
            createdAt: now,
            updatedAt: now
        };
    }
    /**
     * Updates a person's full name when first or last name changes
     */
    static updateFullName(person) {
        return {
            ...person,
            fullName: `${person.firstName} ${person.lastName}`,
            updatedAt: new Date()
        };
    }
    /**
     * Adds a child relationship between parent and child
     */
    static addChildRelationship(parent, child) {
        const updatedParent = {
            ...parent,
            childrenIds: [...parent.childrenIds, child.id],
            updatedAt: new Date()
        };
        const updatedChild = {
            ...child,
            parentIds: [...child.parentIds, parent.id],
            updatedAt: new Date()
        };
        return { parent: updatedParent, child: updatedChild };
    }
    /**
     * Removes a child relationship between parent and child
     */
    static removeChildRelationship(parent, child) {
        const updatedParent = {
            ...parent,
            childrenIds: parent.childrenIds.filter(id => id !== child.id),
            updatedAt: new Date()
        };
        const updatedChild = {
            ...child,
            parentIds: child.parentIds.filter(id => id !== parent.id),
            updatedAt: new Date()
        };
        return { parent: updatedParent, child: updatedChild };
    }
    /**
     * Validates that a person doesn't have more than 2 parents
     */
    static validateParentCount(person) {
        return person.parentIds.length <= 2;
    }
    /**
     * Checks for circular relationships (person cannot be their own ancestor)
     */
    static hasCircularRelationship(persons, parentId, childId) {
        const visited = new Set();
        const checkAncestors = (personId) => {
            if (visited.has(personId))
                return false;
            if (personId === childId)
                return true;
            visited.add(personId);
            const person = persons.find(p => p.id === personId);
            if (!person)
                return false;
            return person.parentIds.some(pid => checkAncestors(pid));
        };
        return checkAncestors(parentId);
    }
    /**
     * Gets all descendants of a person
     */
    static getDescendants(persons, personId) {
        const descendants = [];
        const visited = new Set();
        const collectDescendants = (id) => {
            if (visited.has(id))
                return;
            visited.add(id);
            const person = persons.find(p => p.id === id);
            if (!person)
                return;
            person.childrenIds.forEach(childId => {
                const child = persons.find(p => p.id === childId);
                if (child) {
                    descendants.push(child);
                    collectDescendants(childId);
                }
            });
        };
        collectDescendants(personId);
        return descendants;
    }
    /**
     * Gets all ancestors of a person
     */
    static getAncestors(persons, personId) {
        const ancestors = [];
        const visited = new Set();
        const collectAncestors = (id) => {
            if (visited.has(id))
                return;
            visited.add(id);
            const person = persons.find(p => p.id === id);
            if (!person)
                return;
            person.parentIds.forEach(parentId => {
                const parent = persons.find(p => p.id === parentId);
                if (parent) {
                    ancestors.push(parent);
                    collectAncestors(parentId);
                }
            });
        };
        collectAncestors(personId);
        return ancestors;
    }
    /**
     * Validates the integrity of all relationships in a family tree
     */
    static validateTreeIntegrity(persons) {
        const errors = [];
        persons.forEach(person => {
            // Check parent count
            if (!this.validateParentCount(person)) {
                errors.push(`Person ${person.fullName} has more than 2 parents`);
            }
            // Check that all parent IDs reference existing persons
            person.parentIds.forEach(parentId => {
                const parent = persons.find(p => p.id === parentId);
                if (!parent) {
                    errors.push(`Person ${person.fullName} references non-existent parent ${parentId}`);
                }
                else if (!parent.childrenIds.includes(person.id)) {
                    errors.push(`Parent ${parent.fullName} doesn't have ${person.fullName} in their children list`);
                }
            });
            // Check that all children IDs reference existing persons
            person.childrenIds.forEach(childId => {
                const child = persons.find(p => p.id === childId);
                if (!child) {
                    errors.push(`Person ${person.fullName} references non-existent child ${childId}`);
                }
                else if (!child.parentIds.includes(person.id)) {
                    errors.push(`Child ${child.fullName} doesn't have ${person.fullName} in their parents list`);
                }
            });
            // Check for circular relationships
            person.childrenIds.forEach(childId => {
                if (this.hasCircularRelationship(persons, person.id, childId)) {
                    errors.push(`Circular relationship detected involving ${person.fullName}`);
                }
            });
        });
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.RelationshipUtils = RelationshipUtils;
//# sourceMappingURL=relationshipUtils.js.map