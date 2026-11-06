import { useEffect, useRef, useState } from 'react'

type InquiryKind = 'contact' | 'catalogue' | 'consult' | 'product'
type InquiryDetails = { kind: InquiryKind; name: string; email: string; phone: string; message: string; source?: 'business' }
type Submission = { notificationSent: boolean }
type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
  reset: (id: string) => void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SITE_KEY = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? '1x00000000000000000000AA'
  : '0x4AAAAAAF1aaJwB45sP8Kap'
const CAN_SUBMIT = import.meta.env.BASE_URL === '/'
let scriptPromise: Promise<void> | null = null

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Verification could not load'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function useInquirySubmission() {
  const widgetElement = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const requestId = useRef<string | null>(null)
  const [token, setToken] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [submission, setSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    if (!CAN_SUBMIT) return
    let cancelled = false
    loadTurnstile().then(() => {
      if (cancelled || !widgetElement.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(widgetElement.current, {
        sitekey: SITE_KEY,
        callback: (value: string) => { setToken(value); setError('') },
        'expired-callback': () => setToken(''),
        'error-callback': () => setError('Verification failed to load. Please refresh or contact us directly.'),
      })
    }).catch(() => {
      if (!cancelled) setError('Verification failed to load. Please refresh or contact us directly.')
    })
    return () => {
      cancelled = true
      if (widgetId.current) window.turnstile?.remove(widgetId.current)
      widgetId.current = null
    }
  }, [])

  async function submit(details: InquiryDetails) {
    if (!token || pending || submission) {
      if (!token) setError('Please complete the verification first.')
      return false
    }
    setPending(true)
    setError('')
    requestId.current ??= crypto.randomUUID()
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, id: requestId.current, turnstileToken: token }),
      })
      const result = await response.json().catch(() => null) as { ok?: boolean; reference?: string; notificationSent?: boolean; error?: string } | null
      if (!response.ok || !result?.ok || !result.reference) throw new Error(result?.error || 'We could not send your inquiry. Please try again or contact us directly.')
      const notificationSent = result.notificationSent === true
      setSubmission({ notificationSent })
      return notificationSent
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not send your inquiry. Please try again.')
      if (widgetId.current) window.turnstile?.reset(widgetId.current)
      setToken('')
      return false
    } finally {
      setPending(false)
    }
  }

  return {
    canSubmit: CAN_SUBMIT,
    pending,
    complete: Boolean(submission),
    sent: submission?.notificationSent === true,
    submit,
    verification: CAN_SUBMIT ? <div ref={widgetElement} className="inquiry-verification" aria-label="Spam protection verification" /> : null,
    feedback: <>
      {error && <p className="inquiry-feedback error" role="alert">{error}</p>}
      {submission && (submission.notificationSent
        ? <p className="inquiry-feedback success" role="status">Your inquiry has been sent to our showroom team.</p>
        : <p className="inquiry-feedback error" role="alert">We could not confirm delivery to our showroom team. Please contact us directly by WhatsApp or email.</p>)}
    </>,
  }
}
