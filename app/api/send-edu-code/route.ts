import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { eduEmail, userId } = await req.json()

  if (!eduEmail?.endsWith('.edu')) {
    return NextResponse.json({ error: 'Must be a .edu email' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  // Save code to DB (upsert in case they retry)
  const { error: dbError } = await supabase.from('edu_verifications').upsert({
    user_id: userId,
    edu_email: eduEmail,
    code,
    expires_at: expiresAt.toISOString(),
    verified: false,
  }, { onConflict: 'user_id' })

  if (dbError) {
    return NextResponse.json({ error: 'Failed to save verification' }, { status: 500 })
  }

  // Also update the users table with the pending edu email
  await supabase.from('users').update({
    edu_email: eduEmail,
    edu_verified: false,
  }).eq('id', userId)

  console.log('RESEND_API_KEY prefix:', process.env.RESEND_API_KEY?.slice(0, 5))

  // Send email via Resend
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'myYapa <verify@myyapa.com>',
    to: eduEmail,
    subject: `${code} is your Yapa verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #111827; margin-bottom: 8px;">Verify your student email</h1>
        <p style="color: #6b7280; margin-bottom: 32px;">Enter this code in the Yapa app to confirm your .edu email.</p>
        <div style="background: #f5f0ff; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #9D00FF;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 8px;">— The myYapa team</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Resend full error:', JSON.stringify(emailError, null, 2))
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  console.log('Resend success:', emailData)

  return NextResponse.json({ success: true })
}
