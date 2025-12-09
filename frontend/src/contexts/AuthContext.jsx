/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
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

  const loadProfile = async (userId) => {
    try {
      console.log('Loading profile for user ID:', userId)
      const { user: userProfile } = await usersAPI.getUser(userId)
      console.log('Profile loaded:', userProfile)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    signUp: async (email, password, username) => {
      console.log('Starting signup...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      console.log('Signup result:', { userId: data?.user?.id, error })
      
      if (!error && data.user) {
        // Create profile with the SAME ID as auth user
        try {
          console.log('Creating user profile with ID:', data.user.id)
          await usersAPI.createUser({
            id: data.user.id,
            email,
            username,
          })
          console.log('Profile created successfully')
        } catch (profileError) {
          console.error('Error creating profile:', profileError)
          
          // If it's a duplicate key error, the profile already exists - that's ok!
          if (profileError.response?.status === 500 && 
              profileError.response?.data?.detail?.includes('duplicate key')) {
            console.log('Profile already exists, continuing...')
          } else {
            // For other errors, still don't fail the signup
            console.error('Unexpected profile creation error')
          }
        }
      }
      
      return { data, error }
    },
    signIn: async (email, password) => {
      console.log('Signing in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('Sign in result:', { userId: data?.user?.id, error })
      return { data, error }
    },
    signOut: async () => {
      console.log('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
        // Force reload to clear everything
        window.location.href = '/'
      }
      return { error }
    },
    updateProfile: async (updates) => {
      if (!user) return
      const { user: updated } = await usersAPI.updateUser(user.id, updates)
      setProfile(updated)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}