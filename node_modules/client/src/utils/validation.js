// Validation patterns and helper functions for Shiori auth

// Username: lowercase, can contain non-leading hyphen/period
// Example valid: kaorii-ako, john.doe, user123
// Example invalid: -kaorii (starts with hyphen), 123user (starts with number)
export const USERNAME_REGEX = /^[a-z][a-z0-9.-]*$/

// Password: min 8 chars, 1 capital, 1 lower, 1 number, 1 symbol
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

// Email: standard email format
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validators = {
  username: (value) => {
    if (!value) return 'Username is required'
    if (!USERNAME_REGEX.test(value)) {
      return 'Must start with lowercase letter, can contain letters, numbers, hyphens, periods'
    }
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 30) return 'Username must be 30 characters or less'
    return null
  },

  firstName: (value) => {
    if (!value?.trim()) return 'First name is required'
    if (value.trim().length < 2) return 'First name must be at least 2 characters'
    if (value.trim().length > 50) return 'First name must be 50 characters or less'
    return null
  },

  lastName: (value) => {
    if (!value?.trim()) return 'Last name is required'
    if (value.trim().length < 2) return 'Last name must be at least 2 characters'
    if (value.trim().length > 50) return 'Last name must be 50 characters or less'
    return null
  },

  email: (value) => {
    if (!value) return 'Email is required'
    if (!EMAIL_REGEX.test(value)) return 'Invalid email format'
    return null
  },

  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!PASSWORD_REGEX.test(value)) {
      return 'Must contain: 1 uppercase, 1 lowercase, 1 number, 1 symbol'
    }
    return null
  },

  confirmPassword: (value, password) => {
    if (!value) return 'Please confirm your password'
    if (value !== password) return 'Passwords do not match'
    return null
  },

  country: (value) => {
    if (!value) return 'Country is required'
    return null
  }
}

// Combined validation for signup form
export const validateSignupForm = (formData) => {
  const errors = {}

  const usernameError = validators.username(formData.username)
  if (usernameError) errors.username = usernameError

  const firstNameError = validators.firstName(formData.firstName)
  if (firstNameError) errors.firstName = firstNameError

  const lastNameError = validators.lastName(formData.lastName)
  if (lastNameError) errors.lastName = lastNameError

  const emailError = validators.email(formData.email)
  if (emailError) errors.email = emailError

  const passwordError = validators.password(formData.password)
  if (passwordError) errors.password = passwordError

  const confirmError = validators.confirmPassword(formData.confirmPassword, formData.password)
  if (confirmError) errors.confirmPassword = confirmError

  const countryError = validators.country(formData.country)
  if (countryError) errors.country = countryError

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Combined validation for login form
export const validateLoginForm = (formData) => {
  const errors = {}

  const emailError = validators.email(formData.email)
  if (emailError) errors.email = emailError

  if (!formData.password) errors.password = 'Password is required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
