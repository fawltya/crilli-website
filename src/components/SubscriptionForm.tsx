'use client'

import { useState } from 'react'
import { Button } from './ui/button'

export default function SubscriptionForm() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('') // Honeypot field for bot detection
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [formStartTime] = useState(() => Date.now()) // Set timestamp when component mounts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    // Check honeypot - if filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          honeypot, // Send honeypot value for server-side validation
          timestamp: formStartTime, // Add timestamp for rate limiting
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        if (data.isUpdate) {
          setMessage(
            'Successfully added to our mailing list! Thank you for your continued interest.',
          )
        } else {
          setMessage('Successfully subscribed! Thank you for joining our mailing list.')
        }
        setEmail('')
      } else {
        setIsSuccess(false)

        // Handle duplicate email case more gracefully
        if (data.isDuplicate) {
          setMessage(
            'This email is already subscribed to our mailing list. Thank you for your interest!',
          )
        } else {
          setMessage(data.error || 'Something went wrong. Please try again.')
        }
      }
    } catch (_error) {
      setIsSuccess(false)
      setMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-row justify-end w-full">
        {/* Honeypot field - hidden from users but bots often fill it */}
        <div style={{ display: 'none' }}>
          <label htmlFor="website">Website (leave blank)</label>
          <input
            id="website"
            name="website"
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="w-full">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoComplete="email"
            className="uppercase w-full px-4 py-2 text-sm bg-crilli-800 border border-crilli-600  text-crilli-50 placeholder-crilli-400 focus:outline-none focus:ring-2 focus:ring-crilli-500 focus:border-transparent"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting}
          className="ml-2 fit-content uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            isSuccess
              ? 'bg-green-900/20 text-green-300 border border-green-700'
              : 'bg-red-900/20 text-red-300 border border-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
