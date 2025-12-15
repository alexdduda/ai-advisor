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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const mountedRef = useRef(true)
  const loadingProfile = useRef(false)
  const justSignedUp = useRef(false)  // Track if we just completed signup

  const loadProfile = useCallback(async (userId) => {
  if (!mountedRef.current || loadingProfile.current) {
    console.log('Skipping loadProfile - already loading or unmounted')
    return
  }
  
  loadingProfile.current = true
  
  try {
    console.log('Loading profile for:', userId)
    
    // Add timeout to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile load timeout')), 10000)
    )
    
    const profilePromise = usersAPI.getUser(userId)
    
    const { user: userProfile } = await Promise.race([profilePromise, timeoutPromise])
    console.log('Profile loaded:', userProfile)
    
    if (mountedRef.current) {
      setProfile(userProfile)
      setError(null)
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    
    if (mountedRef.current) {
      if (error.message === 'Profile load timeout') {
        setError({
          type: 'PROFILE_LOAD_TIMEOUT',
          message: 'Profile load timed out. Please check your connection and refresh.'
        })
      } else if (error.response?.status === 404) {
        setProfile(null)
        // Don't set error if we're in the middle of signing up
        if (!justSignedUp.current) {
          setError({
            type: 'PROFILE_NOT_FOUND',
            message: 'Profile not found. Please complete your profile setup.'
          })
        }
      } else {
        setError({
          type: 'PROFILE_LOAD_FAILED',
          message: 'Unable to load profile. Please refresh the page.'
        })
      }
    }
  } finally {
    loadingProfile.current = false
    console.log('loadProfile finished - ref reset')
  }
}, [])

  useEffect(() => {
    mountedRef.current = true
    let authSubscription = null

    const initialize = async () => {
    try {
      console.log('Initializing auth...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      console.log('Initial session:', session?.user?.id)
      
      if (mountedRef.current) {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      if (mountedRef.current) {
        setError({
          type: 'AUTH_INIT_FAILED',
          message: 'Unable to initialize authentication'
        })
      }
    } finally {
      // Always set loading to false, regardless of success or failure
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        console.log('Auth state changed:', event)

        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          // Skip profile load if we just signed up (already loaded in signUp function)
          if (justSignedUp.current) {
            console.log('Skipping profile load - just signed up')
            justSignedUp.current = false
          } else {
            await loadProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setError(null)
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
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (signUpError) throw signUpError
      
      if (!data.user) {
        throw new Error('Signup failed: No user returned')
      }

      console.log('Auth user created:', data.user.id)

      try {
        console.log('Creating profile for:', data.user.id)
        
        const profileData = {
          id: data.user.id,
          email,
          username: username.trim() || null,
        }
        
        const response = await usersAPI.createUser(profileData)
        console.log('Profile created successfully:', response)
        
        if (mountedRef.current && response.user) {
          setProfile(response.user)
          setError(null)  // Clear any previous errors
          justSignedUp.current = true
        }
        
      } catch (profileError) {
        console.error('Profile creation error:', profileError)
        
        if (profileError.response?.status === 409 || 
            profileError.response?.data?.code === 'user_already_exists') {
          console.log('Profile already exists, loading it...')
          await loadProfile(data.user.id)
        } else {
          console.error('Failed to create profile')
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