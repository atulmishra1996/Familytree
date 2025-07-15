
import { useEffect, useState } from 'react';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import { useError } from '../contexts/ErrorContext';
import { TreeVisualization } from '../components/tree/TreeVisualization';
import { WelcomeScreen } from '../components/welcome/WelcomeScreen';
import { PersonDetails } from '../components/person/PersonDetails';
import { AddChildModal } from '../components/forms/AddChildModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorDisplay } from '../components/error/ErrorDisplay';
import { treeApi } from '../services/api';
import type { Person } from '../types/Person';
import './TreeView.css';

export function TreeView() {
  const { state, actions } = useFamilyTree();
  const { showError } = useError();
  const [showPersonDetails, setShowPersonDetails] = useState(false);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedPersonForChild, setSelectedPersonForChild] = useState<Person | null>(null);

  // Load family tree on component mount
  useEffect(() => {
    const loadFamilyTree = async () => {
      actions.setLoading(true);
      actions.setError(null);

      try {
        const familyTree = await treeApi.get();
        if (familyTree) {
          actions.setFamilyTree(familyTree);
        } else {
          actions.setLoading(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load family tree';
        actions.setError(errorMessage);
        showError(errorMessage, {
          title: 'Failed to Load Family Tree',
          details: error instanceof Error ? { stack: error.stack } : undefined,
        });
      }
    };

    loadFamilyTree();
  }, []); // Remove actions and showError from dependencies to prevent infinite loop

  const handleRetryLoad = () => {
    const loadFamilyTree = async () => {
      actions.setLoading(true);
      actions.setError(null);

      try {
        const familyTree = await treeApi.get();
        if (familyTree) {
          actions.setFamilyTree(familyTree);
        } else {
          actions.setLoading(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load family tree';
        actions.setError(errorMessage);
        showError(errorMessage, {
          title: 'Failed to Load Family Tree',
          details: error instanceof Error ? { stack: error.stack } : undefined,
        });
      }
    };

    loadFamilyTree();
  };

  if (state.loading) {
    return (
      <div className="tree-view">
        <LoadingSpinner
          size="large"
          message="Loading family tree..."
          overlay
        />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="tree-view">
        <ErrorDisplay
          title="Failed to Load Family Tree"
          message={state.error}
          type="error"
          showRetry
          onRetry={handleRetryLoad}
        />
      </div>
    );
  }

  if (!state.familyTree) {
    return <WelcomeScreen />;
  }

  const handleNodeClick = (personId: string) => {
    actions.selectPerson(personId);
    setShowPersonDetails(true);
  };

  const handlePersonSave = (updatedPerson: Person) => {
    actions.updatePerson(updatedPerson);
    setIsEditingPerson(false);
  };

  const handlePersonCancel = () => {
    setIsEditingPerson(false);
  };

  const handlePersonEdit = () => {
    setIsEditingPerson(true);
  };

  const handlePersonClose = () => {
    setShowPersonDetails(false);
    setIsEditingPerson(false);
    actions.selectPerson(null);
  };

  const handleAddChild = () => {
    const selectedPerson = state.persons.find(p => p.id === state.selectedPersonId);
    if (selectedPerson) {
      setSelectedPersonForChild(selectedPerson);
      setShowAddChildModal(true);
    }
  };

  const handleChildAdded = (child: Person) => {
    // Child is already added to context by AddChildModal
    // Select the new child and close modals
    actions.selectPerson(child.id);
    setShowAddChildModal(false);
    setSelectedPersonForChild(null);
  };

  const handleCloseAddChildModal = () => {
    setShowAddChildModal(false);
    setSelectedPersonForChild(null);
  };

  return (
    <div className="tree-view">
      <h1>Family Tree: {state.familyTree.name}</h1>
      <div className="tree-container">
        <TreeVisualization
          persons={state.persons}
          selectedPersonId={state.selectedPersonId}
          onNodeClick={handleNodeClick}
        />

        {state.selectedPersonId && (
          <div className="selected-person-info">
            {(() => {
              const selectedPerson = state.persons.find(p => p.id === state.selectedPersonId);
              return selectedPerson ? (
                <div className="person-summary">
                  <h3>Selected: {selectedPerson.fullName}</h3>
                  <p>Click on other family members to select them</p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Person Details Modal */}
      {showPersonDetails && state.selectedPersonId && (() => {
        const selectedPerson = state.persons.find(p => p.id === state.selectedPersonId);
        return selectedPerson ? (
          <div className="modal-overlay">
            <PersonDetails
              person={selectedPerson}
              isEditing={isEditingPerson}
              onSave={handlePersonSave}
              onCancel={handlePersonCancel}
              onEdit={handlePersonEdit}
              onClose={handlePersonClose}
              onAddChild={handleAddChild}
            />
          </div>
        ) : null;
      })()}

      {/* Add Child Modal */}
      {selectedPersonForChild && (
        <AddChildModal
          parent={selectedPersonForChild}
          isOpen={showAddChildModal}
          onClose={handleCloseAddChildModal}
          onChildAdded={handleChildAdded}
        />
      )}
    </div>
  );
}