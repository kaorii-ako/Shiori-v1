// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)

  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter' }
  }

  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter' }
  }

  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least 1 number' }
  }

  if (!hasSymbol) {
    return { isValid: false, message: 'Password must contain at least 1 symbol (!@#$%^&*)' }
  }

  return { isValid: true }
}

// Username validation: lowercase only, can contain non-leading hyphen/period
export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' }
  }

  if (username.length > 30) {
    return { isValid: false, message: 'Username must be 30 characters or less' }
  }

  // Only lowercase letters, numbers, hyphens, and periods (no underscores, no leading hyphen/period)
  const usernameRegex = /^[a-z0-9][a-z0-9.-]*$/

  if (!usernameRegex.test(username)) {
    return { isValid: false, message: 'Username must be lowercase, start with letter/number, can contain - or . (no underscores)' }
  }

  return { isValid: true }
}

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' }
  }

  return { isValid: true }
}

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required` }
  }

  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} must be 50 characters or less` }
  }

  return { isValid: true }
}

// Country validation
export const validateCountry = (country) => {
  if (!country || country.trim().length === 0) {
    return { isValid: false, message: 'Country is required' }
  }

  return { isValid: true }
}

// Signup form validation
export const validateSignupForm = (formData) => {
  const errors = {}

  // Username validation
  const usernameValidation = validateUsername(formData.username)
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message
  }

  // First name validation
  const firstNameValidation = validateName(formData.firstName, 'First name')
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.message
  }

  // Last name validation
  const lastNameValidation = validateName(formData.lastName, 'Last name')
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.message
  }

  // Country validation
  const countryValidation = validateCountry(formData.country)
  if (!countryValidation.isValid) {
    errors.country = countryValidation.message
  }

  // Email validation
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message
  }

  // Password confirmation
  if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {}

  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message
  }

  if (!formData.password) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
