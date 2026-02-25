import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, edu_verified, preferred_campuses')
        .eq('id', session.user.id)
        .single()

      if (!existingUser) {
        // New user — create row
        const emailPrefix = session.user.email?.split('@')[0]
          ?.toLowerCase()
          ?.replace(/[^a-z0-9_.]/g, '')
          ?.slice(0, 20) || 'user'

        await supabase.from('users').upsert({
          id: session.user.id,
          display_name: session.user.user_metadata?.full_name || emailPrefix,
          username: emailPrefix,
          personal_email: session.user.email,
          edu_verified: false,
          review_count: 0,
          rewards_balance: 0,
        }, { onConflict: 'id', ignoreDuplicates: true })

        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }

      // Returning user — check if they've done onboarding
      const hasOnboarded = existingUser.preferred_campuses?.length > 0
      if (!hasOnboarded) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }

      return NextResponse.redirect(new URL('/map', requestUrl.origin))
    }
  }

  // Error — go back to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
