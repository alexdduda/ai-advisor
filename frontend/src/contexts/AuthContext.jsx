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
  const justSignedUp = useRef(false)
  const justUpdatedProfile = useRef(false)
  // Stores the user ID that was loaded during initialize(), so we can skip
  // the duplicate SIGNED_IN event Supabase fires on page load for an already-
  // logged-in session — without skipping a genuine fresh login.
  const initializedForUserId = useRef(null)

  const loadProfile = useCallback(async (userId) => {
    if (!mountedRef.current || loadingProfile.current) {
      console.log('Skipping loadProfile - already loading or unmounted')
      return
    }

    loadingProfile.current = true

    try {
      console.log('Loading profile for:', userId)

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
        setError(null)
      }
    } catch (err) {
      console.error('Error loading profile:', err)

      if (mountedRef.current) {
        if (err.message === 'Profile load timeout') {
          setError({
            type: 'PROFILE_LOAD_TIMEOUT',
            message: 'Profile load timed out. Please check your connection and refresh.',
          })
        } else if (err.response?.status === 404) {
          setProfile(null)
          if (!justSignedUp.current) {
            setError({
              type: 'PROFILE_NOT_FOUND',
              message: 'Profile not found. Please complete your profile setup.',
            })
          }
        } else {
          setError({
            type: 'PROFILE_LOAD_FAILED',
            message: 'Unable to load profile. Please refresh the page.',
          })
        }
      }
    } finally {
      loadingProfile.current = false
      console.log('loadProfile finished')
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
            // Record which user was pre-loaded so onAuthStateChange can
            // skip the redundant SIGNED_IN event Supabase fires right after.
            initializedForUserId.current = session.user.id
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mountedRef.current) {
          setError({
            type: 'AUTH_INIT_FAILED',
            message: 'Unable to initialize authentication',
          })
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
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
            // signUp() already created + set the profile; don't overwrite it.
            console.log('Skipping profile load - just signed up')
            justSignedUp.current = false
          } else if (justUpdatedProfile.current) {
            // updateProfile() already refreshed the profile; don't overwrite it.
            console.log('Skipping profile load - just updated profile')
            justUpdatedProfile.current = false
          } else if (initializedForUserId.current === session.user.id) {
            // This is the spurious SIGNED_IN Supabase fires right after
            // initialize() runs on page load. Profile is already loaded.
            // Clear the flag so future logins by this user DO reload the profile.
            console.log('Skipping profile load - already loaded during initialize()')
            initializedForUserId.current = null
          } else {
            // Genuine fresh login (or a new session after sign-out).
            console.log('Loading profile after fresh sign-in')
            await loadProfile(session.user.id)
          }
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setError(null)
          initializedForUserId.current = null
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

      if (!data.user) {
        throw new Error('Signup failed: no user returned')
      }

      // When email confirmation is disabled, Supabase returns a user with an
      // empty identities array instead of throwing an error for duplicate emails.
      // This is the only reliable way to detect "email already registered".
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('EMAIL_ALREADY_EXISTS')
      }

      console.log('Auth user created:', data.user.id)

      try {
        const profileData = {
          id: data.user.id,
          email,
          username: username?.trim() || null,
        }

        const response = await usersAPI.createUser(profileData)
        console.log('Profile created:', response)

        if (mountedRef.current && response.user) {
          setProfile(response.user)
          setError(null)
          justSignedUp.current = true
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError)

        if (
          profileError.response?.status === 409 ||
          profileError.response?.data?.code === 'user_already_exists'
        ) {
          console.log('Profile already exists, loading it...')
          await loadProfile(data.user.id)
        } else {
          setError({
            type: 'PROFILE_CREATE_FAILED',
            message: 'Account created but profile setup is needed.',
          })
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

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // onAuthStateChange SIGNED_IN will fire and call loadProfile.
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
        setTimeout(() => { justUpdatedProfile.current = false }, 1000)
      }

      return { data: updatedUser, error: null }
    } catch (err) {
      console.error('Profile update error:', err)
      setError({ type: 'PROFILE_UPDATE_FAILED', message: 'Failed to update profile' })
      return { data: null, error: err }
    }
  }

  // clearError is stable (useCallback) so components can safely put it in
  // useEffect dependency arrays without causing infinite loops.
  const clearError = useCallback(() => setError(null), [])

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

// ── Translate raw Supabase / network errors into readable user-facing strings ──
function friendlyAuthError(err) {
  const msg = err?.message || err?.error_description || ''
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