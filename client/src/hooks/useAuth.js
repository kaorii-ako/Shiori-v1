import { useCallback } from 'react'
import { useAuthStore } from '../stores'
import { appwriteService } from '../services/appwrite'

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    setUser,
    setLoading,
    setError,
    clearError,
    loginWithEmail,
    logout: storeLogout
  } = useAuthStore()

  const register = useCallback(async (userData) => {
    setLoading(true)
    clearError()
    try {
      // Create user in Appwrite
      const appwriteUser = await appwriteService.createUser({
        userId: userData.userId || crypto.randomUUID(),
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        country: userData.country,
        timezone: userData.timezone,
        email: userData.email
      })

      // Also create session via API
      const response = await loginWithEmail(userData.email, userData.password)

      return { appwriteUser, user: response }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loginWithEmail, setLoading, setError, clearError])

  const logout = useCallback(async () => {
    storeLogout()
  }, [storeLogout])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    clearError()
    try {
      // Try to get user from Appwrite by email
      const appwriteUser = await appwriteService.getUserByEmail(email).catch(() => null)

      // Login via API
      const user = await loginWithEmail(email, password)

      // Merge Appwrite user data if exists
      if (appwriteUser && !user.country) {
        setUser({ ...user, timezone: appwriteUser.timezone, country: appwriteUser.country })
      }

      return user
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loginWithEmail, setUser, setLoading, setError, clearError])

  const updateProfile = useCallback(async (userId, userData) => {
    try {
      await appwriteService.updateUser(userId, userData)
      setUser({ ...user, ...userData })
    } catch (err) {
      console.error('Failed to update profile in Appwrite:', err)
    }
  }, [user, setUser])

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    clearError
  }
}

export default useAuth
