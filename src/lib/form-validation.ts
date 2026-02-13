/**
 * Form Validation Helpers
 * 
 * Utility functions for validating form inputs
 */

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password validation
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mindestens 8 Zeichen erforderlich");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mindestens einen Großbuchstaben erforderlich");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mindestens einen Kleinbuchstaben erforderlich");
  }
  if (!/\d/.test(password)) {
    errors.push("Mindestens eine Ziffer erforderlich");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * URL validation
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Swiss phone number validation
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+41|0)[1-9]\d{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Form data validation
 */
export interface FormErrors {
  [key: string]: string;
}

export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): FormErrors {
  const errors: FormErrors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const error = rule(data[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (fieldName: string) => (value: any) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} ist erforderlich`;
    }
    return null;
  },

  email: (fieldName = "E-Mail") => (value: string) => {
    if (!value) return null;
    if (!validateEmail(value)) {
      return `Geben Sie eine gültige ${fieldName} ein`;
    }
    return null;
  },

  minLength: (length: number, fieldName = "Feld") => (value: string) => {
    if (!value) return null;
    if (value.length < length) {
      return `${fieldName} muss mindestens ${length} Zeichen lang sein`;
    }
    return null;
  },

  maxLength: (length: number, fieldName = "Feld") => (value: string) => {
    if (!value) return null;
    if (value.length > length) {
      return `${fieldName} darf nicht länger als ${length} Zeichen sein`;
    }
    return null;
  },

  match: (value: any, matchValue: any, fieldName = "Feld") => {
    if (value !== matchValue) {
      return `${fieldName} stimmt nicht überein`;
    }
    return null;
  },

  phone: (fieldName = "Telefonnummer") => (value: string) => {
    if (!value) return null;
    if (!validatePhoneNumber(value)) {
      return `Geben Sie eine gültige ${fieldName} ein`;
    }
    return null;
  },

  url: (fieldName = "URL") => (value: string) => {
    if (!value) return null;
    if (!validateUrl(value)) {
      return `Geben Sie eine gültige ${fieldName} ein`;
    }
    return null;
  },
};
