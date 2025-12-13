/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { usersAPI } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const mountedRef = useRef(true)
  const profileLoadAttempts = useRef(0)
  const MAX_PROFILE_RETRIES = 3

  const loading = authLoading || profileLoading

  const loadProfile = useCallback(async (userId, retryCount = 0) => {
  if (!mountedRef.current) return
  
  try {
    setProfileLoading(true)
    console.log('Loading profile for:', userId)
    
    const { user: userProfile } = await usersAPI.getUser(userId)
    
    console.log('Profile loaded:', userProfile)
    
    if (mountedRef.current) {
      setProfile(userProfile)
      setError(null)
      profileLoadAttempts.current = 0
      setProfileLoading(false) // MAKE SURE THIS IS HERE
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    
    // If user not found (404), don't retry - this is a permanent error
    if (error.response?.status === 404 || error.code === 'user_not_found') {
      if (mountedRef.current) {
        setProfile(null)
        setError({
          type: 'PROFILE_NOT_FOUND',
          message: 'Your profile was not found. Please complete your profile setup.'
        })
        setProfileLoading(false) // CRITICAL: Set loading to false
      }
      return // Stop retrying
    }
    
    // For other errors, retry with exponential backoff
    if (retryCount < MAX_PROFILE_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`Retrying in ${delay}ms...`)
      setTimeout(() => {
        loadProfile(userId, retryCount + 1)
      }, delay)
    } else {
      if (mountedRef.current) {
        setProfile(null)
        setError({
          type: 'PROFILE_LOAD_FAILED',
          message: 'Unable to load your profile. Please refresh the page.'
        })
        setProfileLoading(false) // CRITICAL: Set loading to false
      }
    }
  }
}, [])

  useEffect(() => {
    mountedRef.current = true
    let authSubscription = null

    const initialize = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (mountedRef.current) {
          setUser(session?.user ?? null)
          setAuthLoading(false)
          
          if (session?.user) {
            await loadProfile(session.user.id)
          } else {
            setProfileLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mountedRef.current) {
          setAuthLoading(false)
          setProfileLoading(false)
          setError({
            type: 'AUTH_INIT_FAILED',
            message: 'Unable to initialize authentication'
          })
        }
      }
    }

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        console.log('Auth state changed:', event)

        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setError(null)
          setProfileLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed, no need to reload profile
        }
      }
    )

    authSubscription = subscription

    return () => {
      mountedRef.current = false
      authSubscription?.unsubscribe()
    }
  }, [loadProfile])

  const signUp = async (email, password, username) => {
  try {
    setError(null)
    
    // Step 1: Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (signUpError) throw signUpError
    
    if (!data.user) {
      throw new Error('Signup failed: No user returned')
    }

    console.log('Auth user created:', data.user.id)

    // Step 2: Create user profile immediately
    try {
      console.log('Creating profile for:', data.user.id)
      
      const profileData = {
        id: data.user.id,
        email,
        username: username.trim() || null,
      }
      
      const response = await usersAPI.createUser(profileData)
      console.log('Profile created successfully:', response)
      
      // Step 3: IMMEDIATELY load the profile we just created
      if (mountedRef.current) {
        setProfile(response.user)  // Set it directly!
        setProfileLoading(false)
        setError(null)
      }
      
    } catch (profileError) {
      console.error('Profile creation error:', profileError)
      console.error('Profile error details:', {
        status: profileError.response?.status,
        code: profileError.code,
        message: profileError.message,
        data: profileError.response?.data
      })
      
      // Check if it's truly a duplicate (profile exists)
      if (profileError.response?.status === 409 || 
          profileError.response?.data?.code === 'user_already_exists') {
        console.log('Profile already exists - loading it...')
        
        // Profile exists, load it
        if (mountedRef.current) {
          await loadProfile(data.user.id)
        }
      } else {
        // Real error - but don't fail signup
        console.error('Failed to create profile, user will need to complete setup')
        setError({
          type: 'PROFILE_CREATE_FAILED',
          message: 'Account created but profile setup needed'
        })
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Signup error:', error)
    setError({
      type: 'SIGNUP_FAILED',
      message: error.message
    })
    return { data: null, error }
  }
}

  const signIn = async (email, password) => {
    try {
      setError(null)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) throw signInError
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      setError({
        type: 'SIGNIN_FAILED',
        message: error.message
      })
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError
      
      // Clear state (will be handled by onAuthStateChange too)
      setUser(null)
      setProfile(null)
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      setError({
        type: 'SIGNOUT_FAILED',
        message: error.message
      })
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error('No user logged in')
    }
    
    try {
      setError(null)
      setProfileLoading(true)
      
      const { user: updatedUser } = await usersAPI.updateUser(user.id, updates)
      
      if (mountedRef.current) {
        setProfile(updatedUser)
      }
      
      return { data: updatedUser, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      setError({
        type: 'PROFILE_UPDATE_FAILED',
        message: 'Failed to update profile'
      })
      return { data: null, error }
    } finally {
      if (mountedRef.current) {
        setProfileLoading(false)
      }
    }
  }

  const clearError = () => setError(null)

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}