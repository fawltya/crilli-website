import { NextRequest, NextResponse } from 'next/server'
import { isSubscribeRateLimited } from '@/lib/subscribeRateLimit'

function getSubscribeGroupIds(): string[] {
  const raw = process.env.SENDER_SUBSCRIBE_GROUP_IDS || process.env.SENDER_SUBSCRIBE_GROUP_ID
  if (raw) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return ['b2J7Zj']
}

export async function POST(request: NextRequest) {
  try {
    const { email, honeypot, timestamp } = await request.json()
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'

    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot:', { honeypot, clientIP })
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (await isSubscribeRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    // Basic timing check - if form submitted too quickly, might be a bot
    if (timestamp && Date.now() - timestamp < 1000) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Suspicious timing detected:', { clientIP, timeDiff: Date.now() - timestamp })
      }
      return NextResponse.json(
        { error: 'Please wait a moment before submitting.' },
        { status: 400 },
      )
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Additional bot detection patterns
    const suspiciousPatterns = [
      /test@test\.com/i,
      /admin@/i,
      /noreply@/i,
      /no-reply@/i,
      /spam@/i,
      /bot@/i,
      /fake@/i,
      /temp@/i,
      /temporary@/i,
      /example@/i,
      /sample@/i,
      /demo@/i,
      /dummy@/i,
    ]

    if (suspiciousPatterns.some((pattern) => pattern.test(email))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Suspicious email pattern detected:', { clientIP })
      }
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Check for disposable email domains (common bot pattern)
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org',
      'getnada.com',
      'maildrop.cc',
      'yopmail.com',
      'sharklasers.com',
    ]

    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (disposableDomains.includes(emailDomain)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Disposable email detected:', { clientIP })
      }
      return NextResponse.json({ error: 'Please use a permanent email address' }, { status: 400 })
    }

    const senderApiKey = process.env.SENDER_NET_API_KEY
    if (!senderApiKey) {
      console.error('SENDER_NET_API_KEY is not configured')
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
    }

    const groupIds = getSubscribeGroupIds()

    // Call Sender.net API
    const senderResponse = await fetch('https://api.sender.net/v2/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${senderApiKey}`,
      },
      body: JSON.stringify({
        email: email,
        groups: groupIds,
        trigger_automation: true, // Enable automation triggers
      }),
    })

    const senderData = await senderResponse.json()

    if (!senderResponse.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sender.net API error:', {
          status: senderResponse.status,
          statusText: senderResponse.statusText,
        })
      } else {
        console.error('Sender.net API error:', senderResponse.status, senderResponse.statusText)
      }

      // Handle specific Sender.net error cases
      if (senderData.message && Array.isArray(senderData.message)) {
        const errorMessage = senderData.message.join(', ')
        console.log('Error message array:', errorMessage)

        // Check for duplicate email error with more patterns
        const duplicatePatterns = [
          'already exists',
          'duplicate',
          'already subscribed',
          'email already',
          'subscriber already',
          'already in',
          'exists in',
        ]

        const isDuplicate = duplicatePatterns.some((pattern) =>
          errorMessage.toLowerCase().includes(pattern),
        )

        if (isDuplicate) {
          return NextResponse.json(
            {
              error: 'This email is already subscribed to our mailing list.',
              isDuplicate: true,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({ error: errorMessage }, { status: 400 })
      }

      // Handle other common error patterns
      if (senderData.error) {
        const errorText = senderData.error.toLowerCase()
        console.log('Error text:', errorText)

        const duplicatePatterns = [
          'already exists',
          'duplicate',
          'already subscribed',
          'email already',
          'subscriber already',
          'already in',
          'exists in',
        ]

        const isDuplicate = duplicatePatterns.some((pattern) => errorText.includes(pattern))

        if (isDuplicate) {
          return NextResponse.json(
            {
              error: 'This email is already subscribed to our mailing list.',
              isDuplicate: true,
            },
            { status: 400 },
          )
        }
      }

      // If it's a duplicate error, try to update the existing subscriber to add them to the group
      if (senderResponse.status === 400) {
        console.log('Attempting to update existing subscriber with group...')

        try {
          // First, get the subscriber to find their ID
          const getSubscriberResponse = await fetch(
            `https://api.sender.net/v2/subscribers?email=${encodeURIComponent(email)}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${senderApiKey}`,
              },
            },
          )

          if (getSubscriberResponse.ok) {
            const subscriberData = await getSubscriberResponse.json()

            if (subscriberData.data && subscriberData.data.length > 0) {
              const subscriberId = subscriberData.data[0].id

              // Update the subscriber to add them to the group
              const updateResponse = await fetch(
                `https://api.sender.net/v2/subscribers/${subscriberId}`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${senderApiKey}`,
                  },
                  body: JSON.stringify({
                    groups: groupIds,
                  }),
                },
              )

              if (updateResponse.ok) {
                return NextResponse.json(
                  {
                    success: true,
                    message: 'Successfully added to mailing list!',
                    isUpdate: true,
                  },
                  { status: 200 },
                )
              }
            }
          }
        } catch (updateError) {
          console.error('Error updating existing subscriber:', updateError)
        }
      }

      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed!',
        data: senderData.data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
