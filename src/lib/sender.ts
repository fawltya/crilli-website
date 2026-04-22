import axios from 'axios'

const SENDER_API_URL = 'https://api.sender.net/v2'
const SENDER_API_TOKEN = process.env.SENDER_NET_API_KEY
const SENDER_CAMPAIGN_ID = process.env.SENDER_CAMPAIGN_ID || 'eg2AVD'
const SENDER_TEST_EMAIL = process.env.SENDER_TEST_EMAIL || ''

export interface SendEmailParams {
  recipientEmail: string
  attachments?: Record<string, string>
}

/**
 * Sends a transactional email via Sender API
 * @param params - Email parameters including recipient email and optional attachments
 * @returns Promise with the API response
 */
export async function sendTransactionalEmail({
  recipientEmail,
  attachments,
}: SendEmailParams): Promise<any> {
  if (!SENDER_API_TOKEN) {
    console.warn(
      '[Sender] SENDER_NET_API_KEY or SENDER_API_TOKEN not configured, skipping email send',
    )
    return { success: false, message: 'SENDER_API_TOKEN not configured' }
  }

  // Use test email in development if SENDER_USE_TEST_EMAIL is set
  const emailToUse =
    process.env.NODE_ENV === 'development' &&
    process.env.SENDER_USE_TEST_EMAIL === 'true' &&
    SENDER_TEST_EMAIL
      ? SENDER_TEST_EMAIL
      : recipientEmail

  const data = JSON.stringify({
    recipient_email: emailToUse,
    ...(attachments && Object.keys(attachments).length > 0 && { attachments }),
  })

  const config = {
    method: 'post',
    url: `${SENDER_API_URL}/message/${SENDER_CAMPAIGN_ID}/send`,
    headers: {
      Authorization: `Bearer ${SENDER_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: data,
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Sender] Sending email to: ${emailToUse}${emailToUse !== recipientEmail ? ` (original: redacted)` : ''}`,
      )
    }
    const response = await axios(config)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sender] Email sent successfully, status', response.status)
    }
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[Sender] Error sending email:', error.response?.status, error.response?.statusText)
      throw new Error(`Sender API error: ${error.response?.statusText || error.message}`)
    }
    throw error
  }
}
