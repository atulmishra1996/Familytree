// Validation utility functions and schemas

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private schema: ValidationSchema;

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field];
      const fieldRules = Array.isArray(rules) ? rules : [rules];

      for (const rule of fieldRules) {
        const error = this.validateField(field, value, rule);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateField(field: string, value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && this.isEmpty(value)) {
      return rule.message || `${this.formatFieldName(field)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (this.isEmpty(value) && !rule.required) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${this.formatFieldName(field)} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${this.formatFieldName(field)} must be no more than ${rule.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${this.formatFieldName(field)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0);
  }

  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

// Pre-defined validation rules
export const ValidationRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message,
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address',
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: /^[\d\s\-\+\(\)]+$/,
    message: message || 'Please enter a valid phone number',
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message,
  }),

  dateNotFuture: (message?: string): ValidationRule => ({
    custom: (value: Date | string) => {
      if (!value) return null;
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        return message || 'Date cannot be in the future';
      }
      return null;
    },
  }),

  validDate: (message?: string): ValidationRule => ({
    custom: (value: Date | string) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return message || 'Please enter a valid date';
      }
      return null;
    },
  }),

  noSpecialChars: (message?: string): ValidationRule => ({
    pattern: /^[a-zA-Z0-9\s\-'\.]+$/,
    message: message || 'Only letters, numbers, spaces, hyphens, apostrophes, and periods are allowed',
  }),
};

// Person validation schema
export const PersonValidationSchema: ValidationSchema = {
  firstName: [
    ValidationRules.required(),
    ValidationRules.minLength(1),
    ValidationRules.maxLength(50),
    ValidationRules.noSpecialChars(),
  ],
  lastName: [
    ValidationRules.required(),
    ValidationRules.minLength(1),
    ValidationRules.maxLength(50),
    ValidationRules.noSpecialChars(),
  ],
  email: [
    ValidationRules.email(),
    ValidationRules.maxLength(100),
  ],
  phoneNumber: [
    ValidationRules.phone(),
    ValidationRules.maxLength(20),
  ],
  dateOfBirth: [
    ValidationRules.validDate(),
    ValidationRules.dateNotFuture(),
  ],
  placeOfBirth: [
    ValidationRules.maxLength(100),
  ],
  notes: [
    ValidationRules.maxLength(500),
  ],
};

// Hook for form validation
export function useFormValidation(schema: ValidationSchema) {
  const validator = new FormValidator(schema);

  const validateForm = (data: Record<string, any>): ValidationResult => {
    return validator.validate(data);
  };

  const validateField = (field: string, value: any): string | null => {
    const fieldRules = schema[field];
    if (!fieldRules) return null;

    const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

    for (const rule of rules) {
      const error = validator.validateField(field, value, rule);
      if (error) return error;
    }

    return null;
  };

  return {
    validateForm,
    validateField,
  };
}