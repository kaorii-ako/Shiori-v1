// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~])/.test(password)
  const minLength = password.length >= 8

  if (!minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }

  if (!passwordRegex) {
    return {
      isValid: false,
      message: 'Password must contain uppercase, lowercase, number, and symbol'
    }
  }

  return { isValid: true }
}

// Username validation: lowercase only, can contain non-leading hyphen/period
// Format: kaorii-ako (lowercase alphanumeric + hyphen/period, not at start, NO underscores)
export const validateUsername = (username) => {
  // Only lowercase letters, numbers, hyphens, and periods (no underscores, no leading hyphen/period)
  const usernameRegex = /^[a-z0-9][a-z0-9.-]*$/

  if (!username || username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' }
  }

  if (username.length > 30) {
    return { isValid: false, message: 'Username must be 30 characters or less' }
  }

  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: 'Username must be lowercase, start with letter/number, can contain - or . (no underscores)'
    }
  }

  return { isValid: true }
}

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email || !emailRegex.test(email)) {
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

// Validate signup data
export const validateSignupData = (data) => {
  const { username, firstName, lastName, country, email, password } = data

  // Username validation
  const usernameValidation = validateUsername(username)
  if (!usernameValidation.isValid) {
    return usernameValidation
  }

  // Name validation
  const firstNameValidation = validateName(firstName, 'First name')
  if (!firstNameValidation.isValid) {
    return firstNameValidation
  }

  const lastNameValidation = validateName(lastName, 'Last name')
  if (!lastNameValidation.isValid) {
    return lastNameValidation
  }

  // Country validation
  const countryValidation = validateCountry(country)
  if (!countryValidation.isValid) {
    return countryValidation
  }

  // Email validation
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return emailValidation
  }

  // Password validation
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return passwordValidation
  }

  return { isValid: true }
}
