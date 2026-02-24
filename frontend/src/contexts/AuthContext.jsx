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
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const mountedRef           = useRef(true)
  const loadingProfile       = useRef(false)
  const justSignedUp         = useRef(false)
  const justUpdatedProfile   = useRef(false)
  // ID of the user whose profile is already in state.
  // Any SIGNED_IN event for the same user while a profile is loaded is a no-op.
  const loadedForUserId      = useRef(null)

  const loadProfile = useCallback(async (userId) => {
    if (!mountedRef.current) return

    // ── Guard 1: skip if we're already loading ───────────────────────────────
    if (loadingProfile.current) {
      console.log('Skipping loadProfile — already in progress')
      return
    }

    // ── Guard 2: skip if this user's profile is already in state ────────────
    // This is the key fix: Supabase fires SIGNED_IN on every tab focus via
    // _onVisibilityChanged → _recoverAndRefresh. We only reload if the
    // profile we have is for a *different* user (i.e. a genuine user switch).
    if (loadedForUserId.current === userId && profile !== null) {
      console.log('Skipping loadProfile — profile already loaded for this user')
      return
    }

    loadingProfile.current = true
    console.log('Loading profile for:', userId)

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 10000)
      )

      const { user: userProfile } = await Promise.race([
        usersAPI.getUser(userId),
        timeoutPromise,
      ])

      console.log('Profile loaded:', userProfile)

      if (mountedRef.current) {
        setProfile(userProfile)
        loadedForUserId.current = userId
        setError(null)
      }
    } catch (err) {
      console.error('Error loading profile:', err)

      if (mountedRef.current) {
        if (err.message === 'Profile load timeout') {
          // Don't set an error that blocks the UI if we already have a profile
          if (!profile) {
            setError({
              type: 'PROFILE_LOAD_TIMEOUT',
              message: 'Profile load timed out. Please check your connection and refresh.',
            })
          } else {
            console.warn('Profile reload timed out, keeping existing profile in state')
          }
        } else if (err.response?.status === 404) {
          setProfile(null)
          loadedForUserId.current = null
          if (!justSignedUp.current) {
            setError({
              type: 'PROFILE_NOT_FOUND',
              message: 'Profile not found. Please complete your profile setup.',
            })
          }
        } else {
          if (!profile) {
            setError({
              type: 'PROFILE_LOAD_FAILED',
              message: 'Unable to load profile. Please refresh the page.',
            })
          }
        }
      }
    } finally {
      loadingProfile.current = false
      console.log('loadProfile finished')
    }
  }, [profile]) // profile in deps so the "already loaded" check is current

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
            loadProfile(session.user.id) // non-blocking
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mountedRef.current) {
          setError({ type: 'AUTH_INIT_FAILED', message: 'Unable to initialize authentication' })
        }
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        console.log('Auth state changed:', event, session?.user?.id)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          if (justSignedUp.current) {
            console.log('Skipping profile load — just signed up')
            justSignedUp.current = false
            return
          }
          if (justUpdatedProfile.current) {
            console.log('Skipping profile load — just updated profile')
            justUpdatedProfile.current = false
            return
          }
          // Fire profile load in background — don't block auth state update
          loadProfile(session.user.id)
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setError(null)
          loadedForUserId.current = null
        }
      }
    )

    authSubscription = subscription

    return () => {
      mountedRef.current = false
      authSubscription?.unsubscribe()
    }
  }, [loadProfile])

  // ── signUp ────────────────────────────────────────────────────────────────
  const signUp = async (email, password, username) => {
    try {
      setError(null)
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError
      if (!data.user) throw new Error('Signup failed: no user returned')
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('EMAIL_ALREADY_EXISTS')
      }

      console.log('Auth user created:', data.user.id)

      try {
        const profileData = { id: data.user.id, email, username: username?.trim() || null }
        const response = await usersAPI.createUser(profileData)
        console.log('Profile created:', response)
        if (mountedRef.current && response.user) {
          setProfile(response.user)
          loadedForUserId.current = data.user.id
          setError(null)
          justSignedUp.current = true
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError)
        if (profileError.response?.status === 409 || profileError.response?.data?.code === 'user_already_exists') {
          console.log('Profile already exists, loading it...')
          await loadProfile(data.user.id)
        } else {
          setError({ type: 'PROFILE_CREATE_FAILED', message: 'Account created but profile setup is needed.' })
        }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Signup error:', err)
      const message = friendlyAuthError(err)
      setError({ type: 'SIGNUP_FAILED', message })
      return { data: null, error: { message } }
    }
  }

  // ── signIn ────────────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    try {
      setError(null)
      // Reset so the SIGNED_IN event triggers a real profile load for the new user
      loadedForUserId.current = null
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      const message = friendlyAuthError(err)
      setError({ type: 'SIGNIN_FAILED', message })
      return { data: null, error: { message } }
    }
  }

  // ── signOut ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
      setProfile(null)
      loadedForUserId.current = null
      return { error: null }
    } catch (err) {
      console.error('Sign out error:', err)
      setError({ type: 'SIGNOUT_FAILED', message: err.message })
      return { error: err }
    }
  }

  // ── updateProfile ─────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    try {
      setError(null)
      console.log('AuthContext.updateProfile: Sending updates:', JSON.stringify(updates, null, 2))
      const { user: updatedUser } = await usersAPI.updateUser(user.id, updates)
      console.log('AuthContext.updateProfile: Received:', JSON.stringify(updatedUser, null, 2))
      if (mountedRef.current) {
        justUpdatedProfile.current = true
        setProfile(updatedUser)
        loadedForUserId.current = user.id
        setTimeout(() => { justUpdatedProfile.current = false }, 1000)
      }
      return { data: updatedUser, error: null }
    } catch (err) {
      console.error('Profile update error:', err)
      setError({ type: 'PROFILE_UPDATE_FAILED', message: 'Failed to update profile' })
      return { data: null, error: err }
    }
  }

  const clearError = useCallback(() => setError(null), [])

  const value = { user, profile, loading, error, signUp, signIn, signOut, updateProfile, clearError }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Translate raw Supabase / network errors into readable strings ─────────────
function friendlyAuthError(err) {
  const msg  = err?.message || err?.error_description || ''
  const code = err?.code || ''

  if (msg === 'EMAIL_ALREADY_EXISTS' || msg.includes('User already registered') || msg.includes('already been registered'))
    return 'An account with this email already exists. Please sign in instead.'
  if (msg.includes('Invalid login credentials') || code === 'invalid_credentials')
    return 'Incorrect email or password. Please try again.'
  if (msg.includes('Email not confirmed'))
    return 'Please verify your email address before signing in.'
  if (msg.includes('Password should be at least'))
    return 'Password must be at least 8 characters long.'
  if (msg.includes('rate limit') || msg.includes('too many requests') || code === 'over_request_rate_limit')
    return 'Too many attempts. Please wait a few minutes and try again.'
  if (code === 'NETWORK_ERROR' || msg.includes('Unable to connect') || msg.includes('Network'))
    return 'Unable to connect. Please check your internet connection.'
  if (msg.includes('timeout'))
    return 'Request timed out. Please try again.'
  return msg || 'Something went wrong. Please try again.'
}
