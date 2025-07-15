import { useState } from 'react';
import { AddPersonForm } from '../forms/AddPersonForm';
import { treeApi } from '../../services/api';
import { useFamilyTree } from '../../contexts/FamilyTreeContext';
import { useError } from '../../contexts/ErrorContext';
import { LoadingButton } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../error/ErrorDisplay';
import type { CreatePersonInput } from '../../types/Person';
import './WelcomeScreen.css';

export function WelcomeScreen() {
  const { actions } = useFamilyTree();
  const { showError, showInfo } = useError();
  const [step, setStep] = useState<'welcome' | 'add-parents'>('welcome');
  const [parents, setParents] = useState<CreatePersonInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = () => {
    setStep('add-parents');
    setError(null);
  };

  const handleAddParent = (parentData: CreatePersonInput) => {
    setParents(prev => [...prev, parentData]);
    setError(null);
    showInfo(`Added ${parentData.firstName} ${parentData.lastName} as a root parent`);
  };

  const handleRemoveParent = (index: number) => {
    const removedParent = parents[index];
    setParents(prev => prev.filter((_, i) => i !== index));
    showInfo(`Removed ${removedParent.firstName} ${removedParent.lastName}`);
  };

  const handleCreateTree = async () => {
    if (parents.length === 0) {
      const errorMessage = 'Please add at least one parent to create the family tree.';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const familyTree = await treeApi.initialize(parents);
      actions.setFamilyTree(familyTree);
      showInfo('Successfully created your family tree!');
      // Force a page refresh to ensure the tree view loads
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create family tree';
      setError(errorMessage);
      showError(errorMessage, {
        title: 'Failed to Create Family Tree',
        details: err instanceof Error ? { stack: err.stack } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('welcome');
    setParents([]);
    setError(null);
  };

  if (step === 'welcome') {
    return (
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="welcome-header">
            <h1>Welcome to Family Tree</h1>
            <p className="welcome-subtitle">
              Create and explore your family's genealogy with an interactive family tree
            </p>
          </div>

          <div className="welcome-features">
            <div className="feature">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3>Build Your Tree</h3>
              <p>Add family members and establish parent-child relationships</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌳</div>
              <h3>Visual Tree</h3>
              <p>See your family connections in an interactive tree visualization</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📝</div>
              <h3>Detailed Profiles</h3>
              <p>Store comprehensive information for each family member</p>
            </div>
          </div>

          <div className="welcome-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleStartSetup}
            >
              Create Your Family Tree
            </button>
          </div>

          <div className="welcome-help">
            <p>
              <strong>Getting Started:</strong> You'll begin by adding one or two root parents 
              who will be the foundation of your family tree. You can always add more family 
              members later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-screen">
      <div className="setup-content">
        <div className="setup-header">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
          <h2>Set Up Your Family Tree</h2>
          <p>Add the root parents who will be the foundation of your family tree</p>
        </div>

        {error && (
          <ErrorDisplay
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        )}

        <div className="setup-body">
          <div className="parents-section">
            <h3>Root Parents ({parents.length}/2)</h3>
            
            {parents.length > 0 && (
              <div className="added-parents">
                {parents.map((parent, index) => (
                  <div key={index} className="parent-card">
                    <div className="parent-info">
                      <h4>{parent.firstName} {parent.lastName}</h4>
                      {parent.email && <p>Email: {parent.email}</p>}
                      {parent.dateOfBirth && (
                        <p>Born: {new Date(parent.dateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleRemoveParent(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {parents.length < 2 && (
              <div className="add-parent-section">
                <h4>Add {parents.length === 0 ? 'First' : 'Second'} Parent</h4>
                <AddPersonForm
                  onSubmit={handleAddParent}
                  onCancel={handleBack}
                  submitLabel={`Add ${parents.length === 0 ? 'First' : 'Second'} Parent`}
                  showCancel={false}
                />
              </div>
            )}
          </div>

          <div className="setup-actions">
            <LoadingButton
              className="btn btn-primary btn-large"
              onClick={handleCreateTree}
              loading={loading}
              disabled={parents.length === 0}
            >
              Create Family Tree
            </LoadingButton>
            
            {parents.length === 1 && (
              <p className="setup-note">
                You can create the tree with one parent now, or add a second parent first.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}