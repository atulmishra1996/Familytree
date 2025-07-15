import { useState } from 'react';
import type { Person } from '../../types/Person';
import { AddPersonForm } from './AddPersonForm';
import { useFamilyTree } from '../../contexts/FamilyTreeContext';
import './AddChildModal.css';

interface AddChildModalProps {
  parent: Person;
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: (child: Person) => void;
}

export function AddChildModal({ parent, isOpen, onClose, onChildAdded }: AddChildModalProps) {
  const { state } = useFamilyTree();
  const [showExistingPersons, setShowExistingPersons] = useState(false);

  if (!isOpen) return null;

  const handleNewChildSubmit = (child: Person) => {
    onChildAdded(child);
    onClose();
  };

  const handleCancel = () => {
    setShowExistingPersons(false);
    onClose();
  };

  const availablePersons = state.persons.filter(person => 
    person.id !== parent.id && 
    !person.parentIds.includes(parent.id) &&
    person.parentIds.length < 2 // Can only have max 2 parents
  );

  return (
    <div className="add-child-modal-overlay">
      <div className="add-child-modal">
        {!showExistingPersons ? (
          <div className="add-child-options">
            <div className="modal-header">
              <h2>Add Child to {parent.fullName}</h2>
              <button 
                className="close-button" 
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="options-content">
              <p className="parent-info">
                Adding a child to <strong>{parent.fullName}</strong>
              </p>
              
              <div className="option-buttons">
                <button 
                  className="option-button primary"
                  onClick={() => setShowExistingPersons(false)}
                >
                  <div className="option-icon">👶</div>
                  <div className="option-text">
                    <h3>Create New Child</h3>
                    <p>Add a new person as a child</p>
                  </div>
                </button>
                
                {availablePersons.length > 0 && (
                  <button 
                    className="option-button secondary"
                    onClick={() => setShowExistingPersons(true)}
                  >
                    <div className="option-icon">👥</div>
                    <div className="option-text">
                      <h3>Link Existing Person</h3>
                      <p>Connect an existing family member as a child</p>
                    </div>
                  </button>
                )}
              </div>
              
              {availablePersons.length === 0 && (
                <div className="no-available-persons">
                  <p>No existing persons available to link as children.</p>
                  <small>All persons either already have maximum parents or are already connected to this parent.</small>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ExistingPersonSelector
            parent={parent}
            availablePersons={availablePersons}
            onPersonSelected={onChildAdded}
            onBack={() => setShowExistingPersons(false)}
            onCancel={handleCancel}
          />
        )}
        
        {!showExistingPersons && (
          <AddPersonForm
            parentId={parent.id}
            onSubmit={handleNewChildSubmit}
            onCancel={handleCancel}
            title={`Add Child to ${parent.fullName}`}
            submitLabel="Add Child"
          />
        )}
      </div>
    </div>
  );
}

interface ExistingPersonSelectorProps {
  parent: Person;
  availablePersons: Person[];
  onPersonSelected: (person: Person) => void;
  onBack: () => void;
  onCancel: () => void;
}

function ExistingPersonSelector({ 
  parent, 
  availablePersons, 
  onPersonSelected, 
  onBack, 
  onCancel 
}: ExistingPersonSelectorProps) {
  const { actions } = useFamilyTree();
  const [loading, setLoading] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  const handleLinkPerson = async () => {
    if (!selectedPersonId) return;

    setLoading(true);
    try {
      // Use the linkChild API to establish the relationship
      const { personApi } = await import('../../services/api');
      const result = await personApi.linkChild(parent.id, selectedPersonId);
      
      // Update both persons in the context
      actions.updatePerson(result.parent);
      actions.updatePerson(result.child);
      
      onPersonSelected(result.child);
    } catch (error) {
      actions.setError(error instanceof Error ? error.message : 'Failed to link child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="existing-person-selector">
      <div className="modal-header">
        <button 
          className="back-button" 
          onClick={onBack}
          aria-label="Back"
        >
          ← Back
        </button>
        <h2>Link Existing Person as Child</h2>
        <button 
          className="close-button" 
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      <div className="selector-content">
        <p className="parent-info">
          Select a person to link as a child to <strong>{parent.fullName}</strong>
        </p>
        
        <div className="person-list">
          {availablePersons.map(person => (
            <label key={person.id} className="person-option">
              <input
                type="radio"
                name="selectedPerson"
                value={person.id}
                checked={selectedPersonId === person.id}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                disabled={loading}
              />
              <div className="person-info">
                <div className="person-name">{person.fullName}</div>
                <div className="person-details">
                  {person.email && <span>{person.email}</span>}
                  {person.dateOfBirth && (
                    <span>Born: {new Date(person.dateOfBirth).toLocaleDateString()}</span>
                  )}
                  <span>Parents: {person.parentIds.length}/2</span>
                </div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="selector-actions">
          <button 
            type="button" 
            onClick={onBack}
            disabled={loading}
            className="cancel-button"
          >
            Back
          </button>
          <button 
            type="button"
            onClick={handleLinkPerson}
            disabled={loading || !selectedPersonId}
            className="link-button"
          >
            {loading ? 'Linking...' : 'Link as Child'}
          </button>
        </div>
      </div>
    </div>
  );
}