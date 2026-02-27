import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Symboulos] Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth helpers ─────────────────────────────────────────────────────────────

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

/**
 * Sign in with email + password.
 *
 * After a successful Supabase auth call we check whether the user has confirmed
 * their email address. If Supabase has email confirmation enabled (recommended)
 * it will reject unconfirmed users automatically. This explicit check is a
 * belt-and-suspenders guard for cases where the Supabase setting is toggled off
 * or the user somehow slips through.
 *
 * NOTE: If you have NOT enabled "Confirm email" in your Supabase project
 * (Auth → Settings → Email → Confirm email) then `email_confirmed_at` will
 * always be set and this check is a no-op.  Enable that setting in the
 * Supabase dashboard to prevent unverified accounts from accessing the app.
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { data, error }

  // If we got a session back, double-check the user has confirmed their email.
  // `email_confirmed_at` is null/undefined for unconfirmed accounts.
  if (data?.user && !data.user.email_confirmed_at) {
    // Sign them back out so they don't land in a half-authenticated state.
    await supabase.auth.signOut()
    return {
      data: null,
      error: {
        message:
          'Please verify your email address before signing in. ' +
          'Check your inbox for a confirmation link.',
      },
    }
  }

  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}