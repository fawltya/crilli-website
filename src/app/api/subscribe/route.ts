import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (for production, consider Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email, honeypot, timestamp, recaptchaToken } = await request.json()
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot:', { email, honeypot, clientIP })
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Rate limiting - max 3 requests per IP per 15 minutes
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 3

    const rateLimitKey = `rate_limit_${clientIP}`
    const rateLimitData = rateLimitMap.get(rateLimitKey)

    if (rateLimitData) {
      if (now < rateLimitData.resetTime) {
        if (rateLimitData.count >= maxRequests) {
          console.log('Rate limit exceeded:', { clientIP, email })
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 },
          )
        }
        rateLimitData.count++
      } else {
        // Reset the window
        rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + windowMs })
      }
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + windowMs })
    }

    // Basic timing check - if form submitted too quickly, might be a bot
    if (timestamp && Date.now() - timestamp < 2000) {
      console.log('Suspicious timing detected:', {
        email,
        clientIP,
        timeDiff: Date.now() - timestamp,
      })
      return NextResponse.json(
        { error: 'Please wait a moment before submitting.' },
        { status: 400 },
      )
    }

    // Validate reCAPTCHA token
    if (recaptchaToken) {
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
      if (recaptchaSecret) {
        try {
          const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${recaptchaSecret}&response=${recaptchaToken}&remoteip=${clientIP}`,
          })

          const recaptchaData = await recaptchaResponse.json()

          if (!recaptchaData.success) {
            console.log('reCAPTCHA validation failed:', { email, clientIP, recaptchaData })
            return NextResponse.json(
              { error: 'reCAPTCHA verification failed. Please try again.' },
              { status: 400 },
            )
          }
        } catch (recaptchaError) {
          console.error('reCAPTCHA verification error:', recaptchaError)
          return NextResponse.json(
            { error: 'reCAPTCHA verification failed. Please try again.' },
            { status: 400 },
          )
        }
      }
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
      console.log('Suspicious email pattern detected:', { email, clientIP })
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
      console.log('Disposable email detected:', { email, clientIP })
      return NextResponse.json({ error: 'Please use a permanent email address' }, { status: 400 })
    }

    const senderApiKey = process.env.SENDER_NET_API_KEY
    if (!senderApiKey) {
      console.error('SENDER_NET_API_KEY is not configured')
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
    }

    // Call Sender.net API
    const senderResponse = await fetch('https://api.sender.net/v2/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${senderApiKey}`,
      },
      body: JSON.stringify({
        email: email,
        groups: ['b2J7Zj'], // Add to specific group
        trigger_automation: true, // Enable automation triggers
      }),
    })

    const senderData = await senderResponse.json()

    if (!senderResponse.ok) {
      console.error('Sender.net API error:', {
        status: senderResponse.status,
        statusText: senderResponse.statusText,
        data: senderData,
      })

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
                    groups: ['b2J7Zj'], // Add to specific group
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

      // Log the full response for debugging
      console.log('Full Sender.net response:', JSON.stringify(senderData, null, 2))

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
