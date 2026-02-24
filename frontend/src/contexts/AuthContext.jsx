/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { usersAPI } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null)
  const [profile, setProfile]                 = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  // True only for brand-new signups — keeps App.jsx on ProfileSetup
  // even though a minimal profile already exists in the DB.
  // Cleared by completeOnboarding() when the user finishes or skips.
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const mountedRef         = useRef(true)
  const loadingProfile     = useRef(false)
  const justSignedUp       = useRef(false)
  const justUpdatedProfile = useRef(false)
  const loadedForUserId    = useRef(null)

  const loadProfile = useCallback(async (userId) => {
    if (!mountedRef.current) return

    if (loadingProfile.current) {
      console.log('Skipping loadProfile — already in progress')
      return
    }

    if (loadedForUserId.current === userId && profile !== null) {
      console.log('Skipping loadProfile — profile already loaded for this user')
      return
    }

    loadingProfile.current = true
    console.log('Loading profile for:', userId)

    try {
      // 15 s timeout — generous enough for cold-start backends
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 15000)
      )

      const { user: userProfile } = await Promise.race([
        usersAPI.getUser(userId),
        timeoutPromise,
      ])

      if (mountedRef.current) {
        setProfile(userProfile)
        loadedForUserId.current = userId
        setError(null)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      if (mountedRef.current) {
        if (err.message === 'Profile load timeout') {
          if (!profile) {
            setError({ type: 'PROFILE_LOAD_TIMEOUT', message: 'Profile load timed out. Please check your connection and refresh.' })
          }
        } else if (err.response?.status === 404) {
          setProfile(null)
          loadedForUserId.current = null
          if (!justSignedUp.current) {
            setError({ type: 'PROFILE_NOT_FOUND', message: 'Profile not found.' })
          }
        } else {
          if (!profile) {
            setError({ type: 'PROFILE_LOAD_FAILED', message: 'Unable to load profile. Please refresh.' })
          }
        }
      }
    } finally {
      loadingProfile.current = false
      console.log('loadProfile finished')
    }
  }, [profile])

  useEffect(() => {
    mountedRef.current = true
    let authSubscription = null

    const initialize = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (mountedRef.current) {
          setUser(session?.user ?? null)
          if (session?.user) await loadProfile(session.user.id)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mountedRef.current) setError({ type: 'AUTH_INIT_FAILED', message: 'Unable to initialize authentication' })
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
            return
          }
          if (justUpdatedProfile.current) {
            console.log('Skipping profile load — just updated profile')
            justUpdatedProfile.current = false
            return
          }
          await loadProfile(session.user.id)
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setError(null)
          setNeedsOnboarding(false)
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

  // ── signUp ──────────────────────────────────────────────────────────────
  const signUp = async (email, password, username) => {
    try {
      setError(null)

      // CRITICAL: must be set BEFORE supabase.auth.signUp() is called.
      // Supabase fires the SIGNED_IN auth event synchronously *inside* the
      // signUp call — before it returns. If justSignedUp isn't already true
      // by then, the onAuthStateChange handler will call loadProfile() and
      // get a 404 (profile doesn't exist yet), setting PROFILE_NOT_FOUND.
      justSignedUp.current = true

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError
      if (!data.user) throw new Error('Signup failed: no user returned')
      if (data.user.identities && data.user.identities.length === 0) throw new Error('EMAIL_ALREADY_EXISTS')

      try {
        await usersAPI.createUser({ id: data.user.id, email, username: username?.trim() || null })
        console.log('Minimal profile record created')
      } catch (profileError) {
        // 409 = row already exists (e.g. re-signup after email confirm) — fine
        // 5xx = backend cold start or transient error — ProfileSetup will
        //       retry via updateUser when the user submits the form
        const status = profileError.response?.status
        const code   = profileError.response?.data?.code
        if (status !== 409 && code !== 'user_already_exists') {
          console.error('Profile creation error:', profileError)
          // Don't throw — user auth succeeded, let them reach ProfileSetup
          // which will call updateUser (upsert) when they fill out the form.
        }
      }

      if (mountedRef.current) {
        setUser(data.user)
        loadedForUserId.current = data.user.id
        justSignedUp.current = false
        setNeedsOnboarding(true)
      }

      return { data, error: null }
    } catch (err) {
      console.error('Signup error:', err)
      justSignedUp.current = false
      setError({ type: 'SIGNUP_FAILED', message: friendlyAuthError(err) })
      return { data: null, error: { message: friendlyAuthError(err) } }
    }
  }

  // ── signIn ──────────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    try {
      setError(null)
      loadedForUserId.current = null
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      setError({ type: 'SIGNIN_FAILED', message: friendlyAuthError(err) })
      return { data: null, error: { message: friendlyAuthError(err) } }
    }
  }

  // ── signOut ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
      setProfile(null)
      setNeedsOnboarding(false)
      loadedForUserId.current = null
      return { error: null }
    } catch (err) {
      setError({ type: 'SIGNOUT_FAILED', message: err.message })
      return { error: err }
    }
  }

  // ── updateProfile ────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    try {
      setError(null)
      const { user: updatedUser } = await usersAPI.updateUser(user.id, updates)
      if (mountedRef.current) {
        justUpdatedProfile.current = true
        setProfile(updatedUser)
        loadedForUserId.current = user.id
        setTimeout(() => { justUpdatedProfile.current = false }, 1000)
      }
      return { data: updatedUser, error: null }
    } catch (err) {
      setError({ type: 'PROFILE_UPDATE_FAILED', message: 'Failed to update profile' })
      return { data: null, error: err }
    }
  }

  // ── completeOnboarding ───────────────────────────────────────────────────
  // Called by ProfileSetup when the user finishes or skips.
  // Fetches the latest profile from DB then clears needsOnboarding,
  // which causes App.jsx to switch to Dashboard.
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return
    // Reset the guard so loadProfile will actually run
    loadedForUserId.current = null
    loadingProfile.current = false
    await loadProfile(user.id)
    // Clear onboarding flag AFTER profile is loaded so App.jsx doesn't
    // flash a Loading screen between needsOnboarding=false and profile being set.
    if (mountedRef.current) setNeedsOnboarding(false)
  }, [user?.id, loadProfile])

  const clearError = useCallback(() => setError(null), [])

  const value = { user, profile, loading, error, needsOnboarding, signUp, signIn, signOut, updateProfile, completeOnboarding, clearError }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

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