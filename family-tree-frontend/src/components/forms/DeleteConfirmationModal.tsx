import { useState } from 'react';
import type { Person } from '../../types/Person';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  person: Person;
  onConfirm: (strategy: 'orphan' | 'cascade') => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({ person, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  const [strategy, setStrategy] = useState<'orphan' | 'cascade'>('orphan');
  const hasChildren = person.childrenIds.length > 0;

  const handleConfirm = () => {
    onConfirm(strategy);
  };

  return (
    <div className="modal-overlay">
      <div className="delete-confirmation-modal">
        <div className="modal-header">
          <h2>Delete Person</h2>
          <button className="close-button" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="warning-message">
            <p>Are you sure you want to delete <strong>{person.fullName}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
          </div>

          {hasChildren && (
            <div className="deletion-strategy">
              <h3>This person has {person.childrenIds.length} child(ren). What should happen to them?</h3>
              
              <div className="strategy-options">
                <label className="strategy-option">
                  <input
                    type="radio"
                    name="strategy"
                    value="orphan"
                    checked={strategy === 'orphan'}
                    onChange={(e) => setStrategy(e.target.value as 'orphan' | 'cascade')}
                  />
                  <div className="strategy-details">
                    <strong>Keep children (Orphan)</strong>
                    <p>Remove the parent-child relationship but keep the children in the tree</p>
                  </div>
                </label>

                <label className="strategy-option">
                  <input
                    type="radio"
                    name="strategy"
                    value="cascade"
                    checked={strategy === 'cascade'}
                    onChange={(e) => setStrategy(e.target.value as 'orphan' | 'cascade')}
                  />
                  <div className="strategy-details">
                    <strong>Delete all descendants (Cascade)</strong>
                    <p className="warning-text">This will also delete all children and their descendants</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="person-summary">
            <h4>Person Details:</h4>
            <ul>
              <li>Name: {person.fullName}</li>
              <li>Parents: {person.parentIds.length}</li>
              <li>Children: {person.childrenIds.length}</li>
              {person.email && <li>Email: {person.email}</li>}
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-button" onClick={handleConfirm}>
            {hasChildren && strategy === 'cascade' ? 'Delete All' : 'Delete Person'}
          </button>
        </div>
      </div>
    </div>
  );
}