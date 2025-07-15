"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../utils/storage");
const relationshipUtils_1 = require("../utils/relationshipUtils");
const personValidation_1 = require("../validation/personValidation");
const router = (0, express_1.Router)();
// GET /api/persons - Get all persons
router.get('/', async (req, res, next) => {
    try {
        const personFiles = await storage_1.storage.listFiles('persons');
        const persons = [];
        for (const file of personFiles) {
            const person = await storage_1.storage.readJSON(`persons/${file}`);
            if (person) {
                persons.push(person);
            }
        }
        res.json({
            success: true,
            data: persons,
            count: persons.length
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/persons/:id - Get specific person
router.get('/:id', async (req, res, next) => {
    try {
        const { error } = personValidation_1.personIdSchema.validate(req.params.id);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid person ID format',
                    details: error.details
                }
            });
        }
        const person = await storage_1.storage.readJSON(`persons/${req.params.id}.json`);
        if (!person) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PERSON_NOT_FOUND',
                    message: 'Person not found'
                }
            });
        }
        res.json({
            success: true,
            data: person
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/persons - Create new person
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = personValidation_1.createPersonSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid person data',
                    details: error.details
                }
            });
        }
        const createInput = value;
        // Validate parent relationships if provided
        if (createInput.parentIds && createInput.parentIds.length > 0) {
            // Check that parents exist
            for (const parentId of createInput.parentIds) {
                const parent = await storage_1.storage.readJSON(`persons/${parentId}.json`);
                if (!parent) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'PARENT_NOT_FOUND',
                            message: `Parent with ID ${parentId} not found`
                        }
                    });
                }
            }
            // Validate parent count (max 2)
            if (createInput.parentIds.length > 2) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'TOO_MANY_PARENTS',
                        message: 'A person cannot have more than 2 parents'
                    }
                });
            }
        }
        // Create the new person
        const newPerson = relationshipUtils_1.RelationshipUtils.createPerson({
            firstName: createInput.firstName,
            lastName: createInput.lastName,
            email: createInput.email,
            dateOfBirth: createInput.dateOfBirth,
            placeOfBirth: createInput.placeOfBirth,
            phoneNumber: createInput.phoneNumber,
            profilePhoto: createInput.profilePhoto,
            parentIds: createInput.parentIds || [],
            spouseId: createInput.spouseId,
            notes: createInput.notes
        });
        // Save the new person
        await storage_1.storage.writeJSON(`persons/${newPerson.id}.json`, newPerson);
        // Update parent relationships
        if (createInput.parentIds && createInput.parentIds.length > 0) {
            for (const parentId of createInput.parentIds) {
                const parent = await storage_1.storage.readJSON(`persons/${parentId}.json`);
                if (parent) {
                    const { parent: updatedParent } = relationshipUtils_1.RelationshipUtils.addChildRelationship(parent, newPerson);
                    await storage_1.storage.writeJSON(`persons/${parentId}.json`, updatedParent);
                }
            }
        }
        res.status(201).json({
            success: true,
            data: newPerson,
            message: 'Person created successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/persons/:id - Update person
router.put('/:id', async (req, res, next) => {
    try {
        const { error: idError } = personValidation_1.personIdSchema.validate(req.params.id);
        if (idError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid person ID format',
                    details: idError.details
                }
            });
        }
        const { error, value } = personValidation_1.updatePersonSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid update data',
                    details: error.details
                }
            });
        }
        const updateInput = value;
        const existingPerson = await storage_1.storage.readJSON(`persons/${req.params.id}.json`);
        if (!existingPerson) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PERSON_NOT_FOUND',
                    message: 'Person not found'
                }
            });
        }
        // Update the person
        const updatedPerson = {
            ...existingPerson,
            ...updateInput,
            updatedAt: new Date()
        };
        // Update full name if first or last name changed
        if (updateInput.firstName || updateInput.lastName) {
            updatedPerson.fullName = `${updatedPerson.firstName} ${updatedPerson.lastName}`;
        }
        await storage_1.storage.writeJSON(`persons/${req.params.id}.json`, updatedPerson);
        res.json({
            success: true,
            data: updatedPerson,
            message: 'Person updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/persons/:id - Delete person
router.delete('/:id', async (req, res, next) => {
    try {
        const { error } = personValidation_1.personIdSchema.validate(req.params.id);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid person ID format',
                    details: error.details
                }
            });
        }
        const person = await storage_1.storage.readJSON(`persons/${req.params.id}.json`);
        if (!person) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PERSON_NOT_FOUND',
                    message: 'Person not found'
                }
            });
        }
        // Get deletion strategy from query params (default: 'orphan')
        const deletionStrategy = req.query.strategy || 'orphan';
        // Validate deletion strategy
        if (!['orphan', 'cascade'].includes(deletionStrategy)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DELETION_STRATEGY',
                    message: 'Deletion strategy must be either "orphan" or "cascade"'
                }
            });
        }
        // Check if person has children and handle accordingly
        if (person.childrenIds.length > 0) {
            if (deletionStrategy === 'cascade') {
                // Cascade delete: delete all descendants
                const allPersons = await getAllPersons();
                const descendants = relationshipUtils_1.RelationshipUtils.getDescendants(allPersons, person.id);
                // Delete all descendants first
                for (const descendant of descendants) {
                    await deletePersonAndCleanup(descendant.id);
                }
            }
            else {
                // Orphan strategy: remove parent relationships from children
                for (const childId of person.childrenIds) {
                    const child = await storage_1.storage.readJSON(`persons/${childId}.json`);
                    if (child) {
                        const { child: updatedChild } = relationshipUtils_1.RelationshipUtils.removeChildRelationship(person, child);
                        await storage_1.storage.writeJSON(`persons/${childId}.json`, updatedChild);
                    }
                }
            }
        }
        // Remove relationships with parents
        for (const parentId of person.parentIds) {
            const parent = await storage_1.storage.readJSON(`persons/${parentId}.json`);
            if (parent) {
                const { parent: updatedParent } = relationshipUtils_1.RelationshipUtils.removeChildRelationship(parent, person);
                await storage_1.storage.writeJSON(`persons/${parentId}.json`, updatedParent);
            }
        }
        // Delete the person file
        await storage_1.storage.deleteFile(`persons/${req.params.id}.json`);
        res.json({
            success: true,
            message: 'Person deleted successfully',
            data: {
                id: req.params.id,
                strategy: deletionStrategy,
                childrenAffected: person.childrenIds.length
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Helper function to delete a person and cleanup relationships
async function deletePersonAndCleanup(personId) {
    const person = await storage_1.storage.readJSON(`persons/${personId}.json`);
    if (!person)
        return;
    // Remove relationships with parents
    for (const parentId of person.parentIds) {
        const parent = await storage_1.storage.readJSON(`persons/${parentId}.json`);
        if (parent) {
            const { parent: updatedParent } = relationshipUtils_1.RelationshipUtils.removeChildRelationship(parent, person);
            await storage_1.storage.writeJSON(`persons/${parentId}.json`, updatedParent);
        }
    }
    // Remove relationships with children
    for (const childId of person.childrenIds) {
        const child = await storage_1.storage.readJSON(`persons/${childId}.json`);
        if (child) {
            const { child: updatedChild } = relationshipUtils_1.RelationshipUtils.removeChildRelationship(person, child);
            await storage_1.storage.writeJSON(`persons/${childId}.json`, updatedChild);
        }
    }
    // Delete the person file
    await storage_1.storage.deleteFile(`persons/${personId}.json`);
}
// POST /api/persons/:id/children - Add child to person
router.post('/:id/children', async (req, res, next) => {
    try {
        const { error: idError } = personValidation_1.personIdSchema.validate(req.params.id);
        if (idError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid person ID format',
                    details: idError.details
                }
            });
        }
        const { error: childIdError } = personValidation_1.personIdSchema.validate(req.body.childId);
        if (childIdError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid child ID format',
                    details: childIdError.details
                }
            });
        }
        const parent = await storage_1.storage.readJSON(`persons/${req.params.id}.json`);
        const child = await storage_1.storage.readJSON(`persons/${req.body.childId}.json`);
        if (!parent) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PARENT_NOT_FOUND',
                    message: 'Parent not found'
                }
            });
        }
        if (!child) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CHILD_NOT_FOUND',
                    message: 'Child not found'
                }
            });
        }
        // Check if relationship already exists
        if (parent.childrenIds.includes(child.id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'RELATIONSHIP_EXISTS',
                    message: 'Parent-child relationship already exists'
                }
            });
        }
        // Check if child would have too many parents
        if (child.parentIds.length >= 2) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOO_MANY_PARENTS',
                    message: 'Child already has maximum number of parents (2)'
                }
            });
        }
        // Check for circular relationships
        const allPersons = await getAllPersons();
        if (relationshipUtils_1.RelationshipUtils.hasCircularRelationship(allPersons, parent.id, child.id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CIRCULAR_RELATIONSHIP',
                    message: 'Adding this relationship would create a circular dependency'
                }
            });
        }
        // Add the relationship
        const { parent: updatedParent, child: updatedChild } = relationshipUtils_1.RelationshipUtils.addChildRelationship(parent, child);
        // Save both updated persons
        await storage_1.storage.writeJSON(`persons/${parent.id}.json`, updatedParent);
        await storage_1.storage.writeJSON(`persons/${child.id}.json`, updatedChild);
        res.json({
            success: true,
            message: 'Child relationship added successfully',
            data: {
                parent: updatedParent,
                child: updatedChild
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/persons/:parentId/children/:childId - Remove parent-child relationship
router.delete('/:parentId/children/:childId', async (req, res, next) => {
    try {
        const { error: parentIdError } = personValidation_1.personIdSchema.validate(req.params.parentId);
        const { error: childIdError } = personValidation_1.personIdSchema.validate(req.params.childId);
        if (parentIdError || childIdError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid ID format',
                    details: parentIdError?.details || childIdError?.details
                }
            });
        }
        const parent = await storage_1.storage.readJSON(`persons/${req.params.parentId}.json`);
        const child = await storage_1.storage.readJSON(`persons/${req.params.childId}.json`);
        if (!parent) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PARENT_NOT_FOUND',
                    message: 'Parent not found'
                }
            });
        }
        if (!child) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CHILD_NOT_FOUND',
                    message: 'Child not found'
                }
            });
        }
        // Check if relationship exists
        if (!parent.childrenIds.includes(child.id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'RELATIONSHIP_NOT_EXISTS',
                    message: 'Parent-child relationship does not exist'
                }
            });
        }
        // Remove the relationship
        const { parent: updatedParent, child: updatedChild } = relationshipUtils_1.RelationshipUtils.removeChildRelationship(parent, child);
        // Save both updated persons
        await storage_1.storage.writeJSON(`persons/${parent.id}.json`, updatedParent);
        await storage_1.storage.writeJSON(`persons/${child.id}.json`, updatedChild);
        res.json({
            success: true,
            message: 'Child relationship removed successfully',
            data: {
                parent: updatedParent,
                child: updatedChild
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Helper function to get all persons
async function getAllPersons() {
    const personFiles = await storage_1.storage.listFiles('persons');
    const persons = [];
    for (const file of personFiles) {
        const person = await storage_1.storage.readJSON(`persons/${file}`);
        if (person) {
            persons.push(person);
        }
    }
    return persons;
}
exports.default = router;
//# sourceMappingURL=persons.js.map