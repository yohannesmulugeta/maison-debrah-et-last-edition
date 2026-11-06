interface Env {
  INQUIRIES_DB: D1Database
  TURNSTILE_SECRET: string
  MAILER: Fetcher
}

type InquiryKind = 'contact' | 'catalogue' | 'consult' | 'product'
type Inquiry = {
  id: string
  kind: InquiryKind
  name: string
  email: string
  phone: string
  message: string
  turnstileToken: string
}

const recipients: Record<InquiryKind, string> = {
  contact: 'contact@maisondebrah-et.com',
  catalogue: 'sales@maisondebrah-et.com',
  consult: 'sales@maisondebrah-et.com',
  product: 'sales@maisondebrah-et.com',
}

const titles: Record<InquiryKind, string> = {
  contact: 'General inquiry',
  catalogue: 'Catalogue request',
  consult: 'Design consultation inquiry',
  product: 'Product inquiry',
}

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function parseInquiry(value: unknown): Inquiry | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const kind = input.kind
  const id = input.id
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  const turnstileToken = input.turnstileToken

  if (typeof kind !== 'string' || !Object.hasOwn(recipients, kind)) return null
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null
  if (!name || name.length > 150 || !message || message.length > 5000) return null
  if (!email && !phone) return null
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null
  if (phone.length > 50 || typeof turnstileToken !== 'string' || !turnstileToken || turnstileToken.length > 2048) return null
  return { id, kind: kind as InquiryKind, name, email, phone, message, turnstileToken }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.INQUIRIES_DB || !env.TURNSTILE_SECRET || !env.MAILER) {
    console.error('Inquiry service is not configured')
    return json({ error: 'Inquiry service is temporarily unavailable. Please email or WhatsApp us.' }, 503)
  }

  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin.' }, 403)
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Invalid request format.' }, 415)

  let input: Inquiry | null = null
  try {
    const body = await request.text()
    if (body.length > 20_000) return json({ error: 'Your inquiry is too long.' }, 413)
    input = parseInquiry(JSON.parse(body))
  } catch {
    return json({ error: 'Invalid inquiry. Please check the form.' }, 400)
  }
  if (!input) return json({ error: 'Please check your details and try again.' }, 400)

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: input.turnstileToken }),
      signal: AbortSignal.timeout(8000),
    })
    const result = await verification.json() as { success?: boolean; hostname?: string }
    if (!verification.ok || !result.success || result.hostname !== new URL(request.url).hostname) {
      return json({ error: 'Verification failed. Please try again.' }, 400)
    }
  } catch (error) {
    console.error('Inquiry verification failed', error)
    return json({ error: 'Verification is unavailable. Please try again later.' }, 503)
  }

  try {
    const inserted = await env.INQUIRIES_DB.prepare(
      'INSERT OR IGNORE INTO inquiries (id, kind, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(input.id, input.kind, input.name, input.email || null, input.phone || null, input.message).run()
    if (!inserted.meta.changes) {
      const previous = await env.INQUIRIES_DB.prepare(
        'SELECT notification_status FROM inquiries WHERE id = ?',
      ).bind(input.id).first<{ notification_status: string }>()
      return json({ ok: true, reference: input.id, notificationSent: previous?.notification_status === 'sent' })
    }
  } catch (error) {
    console.error('Inquiry storage failed', error)
    return json({ error: 'We could not save your inquiry. Please try again or contact us directly.' }, 503)
  }

  let notificationSent = false
  try {
    const body = [
      `Reference: ${input.id}`,
      `Type: ${titles[input.kind]}`,
      `Name: ${input.name}`,
      `Email: ${input.email || 'Not provided'}`,
      `Phone / WhatsApp: ${input.phone || 'Not provided'}`,
      '',
      input.message,
    ].join('\n')
    const response = await env.MAILER.fetch('https://mailer.internal/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: recipients[input.kind], subject: `Maison Debrah: ${titles[input.kind]} (${input.id.slice(0, 8)})`, text: body }),
      signal: AbortSignal.timeout(10_000),
    })
    const result = await response.json().catch(() => null) as { ok?: boolean } | null
    notificationSent = response.ok && result?.ok === true
    if (!notificationSent) console.error('Inquiry notification failed', response.status)
  } catch (error) {
    console.error('Inquiry notification failed', error)
  }

  try {
    await env.INQUIRIES_DB.prepare(
      "UPDATE inquiries SET notification_status = ?, notified_at = CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?",
    ).bind(notificationSent ? 'sent' : 'failed', notificationSent ? 'sent' : 'failed', input.id).run()
  } catch (error) {
    console.error('Inquiry notification status update failed', error)
  }

  return json({ ok: true, reference: input.id, notificationSent })
}
