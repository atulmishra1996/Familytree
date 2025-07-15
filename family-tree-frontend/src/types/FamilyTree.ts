import type { Person } from './Person';

export interface FamilyTree {
  id: string;
  name: string;
  rootPersonIds: string[];
  persons: Person[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFamilyTreeInput {
  name: string;
  rootPersonIds?: string[];
}

export interface UpdateFamilyTreeInput {
  name?: string;
  rootPersonIds?: string[];
}