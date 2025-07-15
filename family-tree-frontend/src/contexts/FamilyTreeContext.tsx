import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Person } from '../types/Person';
import type { FamilyTree } from '../types/FamilyTree';

// State interface
interface FamilyTreeState {
  familyTree: FamilyTree | null;
  persons: Person[];
  selectedPersonId: string | null;
  loading: boolean;
  error: string | null;
}

// Action types
type FamilyTreeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAMILY_TREE'; payload: FamilyTree }
  | { type: 'SET_PERSONS'; payload: Person[] }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'SELECT_PERSON'; payload: string | null }
  | { type: 'CLEAR_TREE' };

// Initial state
const initialState: FamilyTreeState = {
  familyTree: null,
  persons: [],
  selectedPersonId: null,
  loading: false,
  error: null,
};

// Reducer
function familyTreeReducer(state: FamilyTreeState, action: FamilyTreeAction): FamilyTreeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_FAMILY_TREE':
      return {
        ...state,
        familyTree: action.payload,
        persons: action.payload.persons,
        loading: false,
        error: null,
      };
    
    case 'SET_PERSONS':
      return { ...state, persons: action.payload };
    
    case 'ADD_PERSON':
      return {
        ...state,
        persons: [...state.persons, action.payload],
        familyTree: state.familyTree ? {
          ...state.familyTree,
          persons: [...state.familyTree.persons, action.payload],
        } : null,
      };
    
    case 'UPDATE_PERSON':
      const updatedPersons = state.persons.map(person =>
        person.id === action.payload.id ? action.payload : person
      );
      return {
        ...state,
        persons: updatedPersons,
        familyTree: state.familyTree ? {
          ...state.familyTree,
          persons: updatedPersons,
        } : null,
      };
    
    case 'DELETE_PERSON':
      const filteredPersons = state.persons.filter(person => person.id !== action.payload);
      return {
        ...state,
        persons: filteredPersons,
        familyTree: state.familyTree ? {
          ...state.familyTree,
          persons: filteredPersons,
        } : null,
        selectedPersonId: state.selectedPersonId === action.payload ? null : state.selectedPersonId,
      };
    
    case 'SELECT_PERSON':
      return { ...state, selectedPersonId: action.payload };
    
    case 'CLEAR_TREE':
      return initialState;
    
    default:
      return state;
  }
}

// Context interface
interface FamilyTreeContextType {
  state: FamilyTreeState;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setFamilyTree: (tree: FamilyTree) => void;
    setPersons: (persons: Person[]) => void;
    addPerson: (person: Person) => void;
    updatePerson: (person: Person) => void;
    deletePerson: (personId: string) => void;
    selectPerson: (personId: string | null) => void;
    clearTree: () => void;
  };
}

// Create context
const FamilyTreeContext = createContext<FamilyTreeContextType | undefined>(undefined);

// Provider component
interface FamilyTreeProviderProps {
  children: ReactNode;
}

export function FamilyTreeProvider({ children }: FamilyTreeProviderProps) {
  const [state, dispatch] = useReducer(familyTreeReducer, initialState);

  // Action creators
  const actions = {
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setFamilyTree: useCallback((tree: FamilyTree) => {
      dispatch({ type: 'SET_FAMILY_TREE', payload: tree });
    }, []),

    setPersons: useCallback((persons: Person[]) => {
      dispatch({ type: 'SET_PERSONS', payload: persons });
    }, []),

    addPerson: useCallback((person: Person) => {
      dispatch({ type: 'ADD_PERSON', payload: person });
    }, []),

    updatePerson: useCallback((person: Person) => {
      dispatch({ type: 'UPDATE_PERSON', payload: person });
    }, []),

    deletePerson: useCallback((personId: string) => {
      dispatch({ type: 'DELETE_PERSON', payload: personId });
    }, []),

    selectPerson: useCallback((personId: string | null) => {
      dispatch({ type: 'SELECT_PERSON', payload: personId });
    }, []),

    clearTree: useCallback(() => {
      dispatch({ type: 'CLEAR_TREE' });
    }, []),
  };

  return (
    <FamilyTreeContext.Provider value={{ state, actions }}>
      {children}
    </FamilyTreeContext.Provider>
  );
}

// Custom hook to use the context
export function useFamilyTree() {
  const context = useContext(FamilyTreeContext);
  if (context === undefined) {
    throw new Error('useFamilyTree must be used within a FamilyTreeProvider');
  }
  return context;
}