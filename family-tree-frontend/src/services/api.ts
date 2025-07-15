import type { Person, CreatePersonInput, UpdatePersonInput } from '../types/Person';
import type { FamilyTree } from '../types/FamilyTree';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  // If the API response has a data field, return it (even if null)
  // Otherwise return the entire result
  return result.hasOwnProperty('data') ? result.data : result;
}

export const personApi = {
  // Get all persons
  getAll: async (): Promise<Person[]> => {
    const response = await fetch(`${API_BASE_URL}/persons`);
    return handleResponse<Person[]>(response);
  },

  // Get person by ID
  getById: async (id: string): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons/${id}`);
    return handleResponse<Person>(response);
  },

  // Create new person
  create: async (personData: CreatePersonInput): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personData),
    });
    return handleResponse<Person>(response);
  },

  // Update person
  update: async (id: string, personData: UpdatePersonInput): Promise<Person> => {
    const response = await fetch(`${API_BASE_URL}/persons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personData),
    });
    return handleResponse<Person>(response);
  },

  // Delete person
  delete: async (id: string, strategy: 'orphan' | 'cascade' = 'orphan'): Promise<{ id: string; strategy: string; childrenAffected: number }> => {
    const response = await fetch(`${API_BASE_URL}/persons/${id}?strategy=${strategy}`, {
      method: 'DELETE',
    });
    return handleResponse<{ id: string; strategy: string; childrenAffected: number }>(response);
  },

  // Add child to person (create new child and establish relationship)
  addChild: async (parentId: string, childData: CreatePersonInput): Promise<Person> => {
    // First create the child with parent relationship
    const childWithParent = { ...childData, parentIds: [parentId] };
    const response = await fetch(`${API_BASE_URL}/persons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(childWithParent),
    });
    return handleResponse<Person>(response);
  },

  // Link existing person as child to parent
  linkChild: async (parentId: string, childId: string): Promise<{ parent: Person; child: Person }> => {
    const response = await fetch(`${API_BASE_URL}/persons/${parentId}/children`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ childId }),
    });
    return handleResponse<{ parent: Person; child: Person }>(response);
  },
};

export const treeApi = {
  // Get complete family tree
  get: async (): Promise<FamilyTree> => {
    const response = await fetch(`${API_BASE_URL}/tree`);
    return handleResponse<FamilyTree>(response);
  },

  // Initialize new tree with root parents
  initialize: async (parentData: CreatePersonInput[]): Promise<FamilyTree> => {
    const response = await fetch(`${API_BASE_URL}/tree/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parents: parentData }),
    });
    return handleResponse<FamilyTree>(response);
  },
};

export { ApiError };