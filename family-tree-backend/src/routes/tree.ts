import { Router, Request, Response, NextFunction } from 'express';
import { Person, CreatePersonInput } from '../models/Person';
import { FamilyTree } from '../models/FamilyTree';
import { storage } from '../utils/storage';
import { RelationshipUtils } from '../utils/relationshipUtils';
import { createPersonSchema } from '../validation/personValidation';
import Joi from 'joi';

const router = Router();

// Validation schema for tree initialization
const initializeTreeSchema = Joi.object({
  parents: Joi.array().items(createPersonSchema).min(1).max(2).required()
});

// GET /api/tree - Get complete family tree
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if tree metadata exists
    const treeMetadata = await storage.readJSON<FamilyTree>('familyTree.json');
    
    if (!treeMetadata) {
      return res.json({
        success: true,
        data: null,
        message: 'No family tree exists yet',
        availableEndpoints: [
          'POST /api/tree/initialize - Initialize new tree with root parents',
          'GET /api/persons - Get all persons',
          'POST /api/persons - Create new person'
        ]
      });
    }

    // Get all persons
    const personFiles = await storage.listFiles('persons');
    const persons: Person[] = [];

    for (const file of personFiles) {
      const person = await storage.readJSON<Person>(`persons/${file}`);
      if (person) {
        persons.push(person);
      }
    }

    // Update tree with current persons
    const familyTree: FamilyTree = {
      ...treeMetadata,
      persons,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: familyTree
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tree/initialize - Initialize new tree with root parents
router.post('/initialize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = initializeTreeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid initialization data',
          details: error.details
        }
      });
    }

    // Check if tree already exists
    const existingTree = await storage.readJSON<FamilyTree>('familyTree.json');
    if (existingTree) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TREE_ALREADY_EXISTS',
          message: 'Family tree already exists. Use update endpoints to modify existing tree.'
        }
      });
    }

    const parentInputs: CreatePersonInput[] = value.parents;
    const createdParents: Person[] = [];
    const rootPersonIds: string[] = [];

    // Create parent persons
    for (const parentInput of parentInputs) {
      const newParent = RelationshipUtils.createPerson({
        firstName: parentInput.firstName,
        lastName: parentInput.lastName,
        email: parentInput.email,
        dateOfBirth: parentInput.dateOfBirth,
        placeOfBirth: parentInput.placeOfBirth,
        phoneNumber: parentInput.phoneNumber,
        profilePhoto: parentInput.profilePhoto,
        parentIds: [],
        spouseId: undefined,
        notes: parentInput.notes
      });

      createdParents.push(newParent);
      rootPersonIds.push(newParent.id);
    }

    // If two parents, establish spouse relationship
    if (createdParents.length === 2) {
      createdParents[0].spouseId = createdParents[1].id;
      createdParents[1].spouseId = createdParents[0].id;
    }

    // Save all parent persons
    for (const parent of createdParents) {
      await storage.writeJSON(`persons/${parent.id}.json`, parent);
    }

    // Create family tree metadata
    const familyTree: FamilyTree = {
      id: `tree-${Date.now()}`,
      name: createdParents.length === 1 
        ? `${createdParents[0].fullName}'s Family Tree`
        : `${createdParents[0].fullName} & ${createdParents[1].fullName}'s Family Tree`,
      rootPersonIds,
      persons: createdParents,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save tree metadata
    await storage.writeJSON('familyTree.json', familyTree);

    res.status(201).json({
      success: true,
      data: familyTree,
      message: 'Family tree initialized successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tree - Delete entire family tree (for testing/reset purposes)
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete all person files
    const personFiles = await storage.listFiles('persons');
    for (const file of personFiles) {
      await storage.deleteFile(`persons/${file}`);
    }

    // Delete tree metadata
    await storage.deleteFile('familyTree.json');

    res.json({
      success: true,
      message: 'Family tree deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;