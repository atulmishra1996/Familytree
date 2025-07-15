import { useState, useEffect } from 'react';
import type { Person, UpdatePersonInput } from '../../types/Person';
import { personApi } from '../../services/api';
import { useFamilyTree } from '../../contexts/FamilyTreeContext';
import { useError } from '../../contexts/ErrorContext';
import { useFormValidation, PersonValidationSchema } from '../../utils/validation';
import { LoadingButton } from '../common/LoadingSpinner';
import { InlineError } from '../error/ErrorDisplay';
import { DeleteConfirmationModal } from '../forms/DeleteConfirmationModal';
import './PersonDetails.css';

interface PersonDetailsProps {
  person: Person;
  isEditing: boolean;
  onSave: (updatedPerson: Person) => void;
  onCancel: () => void;
  onEdit: () => void;
  onClose: () => void;
  onAddChild: () => void;
  onDelete?: () => void;
}

export function PersonDetails({ 
  person, 
  isEditing, 
  onSave, 
  onCancel, 
  onEdit, 
  onClose,
  onAddChild,
  onDelete
}: PersonDetailsProps) {
  const { actions } = useFamilyTree();
  const { showError, showInfo } = useError();
  const { validateForm: validate, validateField } = useFormValidation(PersonValidationSchema);
  
  const [formData, setFormData] = useState<UpdatePersonInput>({
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email || '',
    dateOfBirth: person.dateOfBirth,
    placeOfBirth: person.placeOfBirth || '',
    phoneNumber: person.phoneNumber || '',
    notes: person.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email || '',
      dateOfBirth: person.dateOfBirth,
      placeOfBirth: person.placeOfBirth || '',
      phoneNumber: person.phoneNumber || '',
      notes: person.notes || '',
    });
    setErrors({});
  }, [person, isEditing]);

  const validateFormData = (): boolean => {
    const result = validate(formData);
    setErrors(result.errors);
    return result.isValid;
  };

  const handleInputChange = (field: keyof UpdatePersonInput, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for this field
    const fieldError = validateField(field, value);
    setErrors(prev => ({ 
      ...prev, 
      [field]: fieldError || '' 
    }));
  };

  const handleSave = async () => {
    if (!validateFormData()) {
      showError('Please fix the validation errors before saving');
      return;
    }

    setLoading(true);
    try {
      const updatedPerson = await personApi.update(person.id, formData);
      actions.updatePerson(updatedPerson);
      showInfo(`Successfully updated ${updatedPerson.fullName}`);
      onSave(updatedPerson);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update person';
      showError(errorMessage, {
        title: 'Failed to Update Person',
        details: error instanceof Error ? { stack: error.stack } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (strategy: 'orphan' | 'cascade') => {
    setLoading(true);
    try {
      await personApi.delete(person.id, strategy);
      actions.deletePerson(person.id);
      setShowDeleteModal(false);
      showInfo(`Successfully deleted ${person.fullName}`);
      if (onDelete) {
        onDelete();
      } else {
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      showError(errorMessage, {
        title: 'Failed to Delete Person',
        details: error instanceof Error ? { stack: error.stack } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  if (isEditing) {
    return (
      <div className="person-details editing">
        <div className="person-details-header">
          <h2>Edit Person</h2>
          <button 
            className="close-button" 
            onClick={onCancel}
            aria-label="Cancel editing"
          >
            ×
          </button>
        </div>

        <form className="person-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
              disabled={loading}
            />
            {errors.firstName && <InlineError message={errors.firstName} />}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
              disabled={loading}
            />
            {errors.lastName && <InlineError message={errors.lastName} />}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
            {errors.email && <InlineError message={errors.email} />}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              type="date"
              value={formatDateForInput(formData.dateOfBirth)}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
              className={errors.dateOfBirth ? 'error' : ''}
              disabled={loading}
            />
            {errors.dateOfBirth && <InlineError message={errors.dateOfBirth} />}
          </div>

          <div className="form-group">
            <label htmlFor="placeOfBirth">Place of Birth</label>
            <input
              id="placeOfBirth"
              type="text"
              value={formData.placeOfBirth || ''}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
              className={errors.placeOfBirth ? 'error' : ''}
              disabled={loading}
            />
            {errors.placeOfBirth && <InlineError message={errors.placeOfBirth} />}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={errors.phoneNumber ? 'error' : ''}
              disabled={loading}
            />
            {errors.phoneNumber && <InlineError message={errors.phoneNumber} />}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className={errors.notes ? 'error' : ''}
              rows={4}
              disabled={loading}
            />
            {errors.notes && <InlineError message={errors.notes} />}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={loading}
              className="save-button"
            >
              Save
            </LoadingButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="person-details">
      <div className="person-details-header">
        <h2>{person.fullName}</h2>
        <div className="header-actions">
          <button 
            className="add-child-button" 
            onClick={onAddChild}
            aria-label="Add child"
          >
            Add Child
          </button>
          <button 
            className="edit-button" 
            onClick={onEdit}
            aria-label="Edit person"
          >
            Edit
          </button>
          <button 
            className="delete-button" 
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete person"
          >
            Delete
          </button>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>
      </div>

      <div className="person-info">
        <div className="info-section">
          <h3>Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>First Name:</label>
              <span>{person.firstName}</span>
            </div>
            <div className="info-item">
              <label>Last Name:</label>
              <span>{person.lastName}</span>
            </div>
            {person.email && (
              <div className="info-item">
                <label>Email:</label>
                <span>{person.email}</span>
              </div>
            )}
            {person.dateOfBirth && (
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{formatDate(person.dateOfBirth)}</span>
              </div>
            )}
            {person.placeOfBirth && (
              <div className="info-item">
                <label>Place of Birth:</label>
                <span>{person.placeOfBirth}</span>
              </div>
            )}
            {person.phoneNumber && (
              <div className="info-item">
                <label>Phone:</label>
                <span>{person.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-section">
          <h3>Family Relationships</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Parents:</label>
              <span>{person.parentIds.length > 0 ? `${person.parentIds.length} parent(s)` : 'None'}</span>
            </div>
            <div className="info-item">
              <label>Children:</label>
              <span>{person.childrenIds.length > 0 ? `${person.childrenIds.length} child(ren)` : 'None'}</span>
            </div>
            {person.spouseId && (
              <div className="info-item">
                <label>Spouse:</label>
                <span>Connected</span>
              </div>
            )}
          </div>
        </div>

        {person.notes && (
          <div className="info-section">
            <h3>Notes</h3>
            <p className="notes-content">{person.notes}</p>
          </div>
        )}

        <div className="info-section metadata">
          <h3>Record Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Created:</label>
              <span>{formatDate(person.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(person.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          person={person}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}