import { useState } from 'react';
import type { CreatePersonInput } from '../../types/Person';
import { personApi } from '../../services/api';
import { useFamilyTree } from '../../contexts/FamilyTreeContext';
import { useError } from '../../contexts/ErrorContext';
import { useFormValidation, PersonValidationSchema } from '../../utils/validation';
import { LoadingButton } from '../common/LoadingSpinner';
import { InlineError } from '../error/ErrorDisplay';
import './AddPersonForm.css';

interface AddPersonFormProps {
  parentId?: string;
  onSubmit: (person: any) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  showCancel?: boolean;
}

export function AddPersonForm({ 
  parentId, 
  onSubmit, 
  onCancel, 
  title = 'Add New Person',
  submitLabel = 'Add Person',
  showCancel = true
}: AddPersonFormProps) {
  const { actions } = useFamilyTree();
  const { showError, showInfo } = useError();
  const { validateForm: validate, validateField } = useFormValidation(PersonValidationSchema);
  
  const [formData, setFormData] = useState<CreatePersonInput>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: undefined,
    placeOfBirth: '',
    phoneNumber: '',
    notes: '',
    parentIds: parentId ? [parentId] : [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateFormData = (): boolean => {
    const result = validate(formData);
    setErrors(result.errors);
    return result.isValid;
  };

  const handleInputChange = (field: keyof CreatePersonInput, value: string | Date | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for this field
    const fieldError = validateField(field, value);
    setErrors(prev => ({ 
      ...prev, 
      [field]: fieldError || '' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      showError('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    try {
      let newPerson;
      
      if (parentId) {
        // Add as child to existing parent
        newPerson = await personApi.addChild(parentId, formData);
        showInfo(`Successfully added ${newPerson.fullName} as a child`);
      } else {
        // Add as standalone person
        newPerson = await personApi.create(formData);
        showInfo(`Successfully added ${newPerson.fullName} to the family tree`);
      }
      
      actions.addPerson(newPerson);
      onSubmit(newPerson);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add person';
      showError(errorMessage, {
        title: 'Failed to Add Person',
        details: error instanceof Error ? { stack: error.stack } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="add-person-form-overlay">
      <div className="add-person-form">
        <div className="form-header">
          <h2>{title}</h2>
          <button 
            className="close-button" 
            onClick={onCancel}
            aria-label="Cancel"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-content">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                    disabled={loading}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <InlineError message={errors.firstName} />}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                    disabled={loading}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <InlineError message={errors.lastName} />}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'error' : ''}
                    disabled={loading}
                    placeholder="Enter email address"
                  />
                  {errors.email && <InlineError message={errors.email} />}
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
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && <InlineError message={errors.phoneNumber} />}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Personal Details</h3>
              
              <div className="form-row">
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
                    placeholder="Enter place of birth"
                  />
                  {errors.placeOfBirth && <InlineError message={errors.placeOfBirth} />}
                </div>
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
                  placeholder="Add any additional notes or information"
                />
                {errors.notes && <InlineError message={errors.notes} />}
              </div>
            </div>

            {parentId && (
              <div className="form-section">
                <h3>Family Relationship</h3>
                <p className="relationship-info">
                  This person will be added as a child to the selected parent.
                </p>
              </div>
            )}
          </div>

          <div className="form-actions">
            {showCancel && (
              <button 
                type="button" 
                onClick={onCancel}
                disabled={loading}
                className="cancel-button"
              >
                Cancel
              </button>
            )}
            <LoadingButton
              type="submit"
              loading={loading}
              className="submit-button"
            >
              {submitLabel}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}