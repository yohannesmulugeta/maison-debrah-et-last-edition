import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { onRequestPost } from '../functions/api/inquiries.ts'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

function setup({ mailStatus = 204, storageFails = false } = {}) {
  const rows = new Map()
  const calls = []
  const db = {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async run() {
              if (storageFails) throw new Error('database unavailable')
              if (sql.startsWith('INSERT')) {
                if (rows.has(params[0])) return { meta: { changes: 0 } }
                rows.set(params[0], { status: 'pending', kind: params[1], name: params[2] })
                return { meta: { changes: 1 } }
              }
              if (sql.startsWith('UPDATE')) rows.get(params[2]).status = params[0]
              return { meta: { changes: 1 } }
            },
            async first() { return { notification_status: rows.get(params[0])?.status } },
          }
        },
      }
    },
  }
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    if (String(url).includes('siteverify')) return Response.json({ success: true, hostname: 'maisondebrah-et.com' })
    return new Response(null, { status: mailStatus })
  }
  return { db, rows, calls }
}

function inquiry(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    kind: 'contact',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '',
    message: 'Please contact me about a table.',
    turnstileToken: 'test-token',
    ...overrides,
  }
}

async function submit(db, body) {
  return onRequestPost({
    request: new Request('https://maisondebrah-et.com/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://maisondebrah-et.com' },
      body: JSON.stringify(body),
    }),
    env: { INQUIRIES_DB: db, TURNSTILE_SECRET: 'test-secret', HOSTINGER_MAIL_TOKEN: 'test-token', HOSTINGER_MAILBOX_ID: 'mailbox-id' },
  })
}

test('saves an inquiry before notifying the correct mailbox', async () => {
  const { db, rows, calls } = setup()
  const input = inquiry()
  const response = await submit(db, input)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true, reference: input.id, notificationSent: true })
  assert.equal(rows.get(input.id).status, 'sent')
  assert.deepEqual(JSON.parse(calls[1].options.body).to, ['contact@maisondebrah-et.com'])
})

test('rejects invalid inquiries before storage or email', async () => {
  const { db, rows, calls } = setup()
  const response = await submit(db, inquiry({ email: '', phone: '', message: '' }))
  assert.equal(response.status, 400)
  assert.equal(rows.size, 0)
  assert.equal(calls.length, 0)
})

test('rejects an unknown inquiry type', async () => {
  const { db, calls } = setup()
  const response = await submit(db, inquiry({ kind: 'toString' }))
  assert.equal(response.status, 400)
  assert.equal(calls.length, 0)
})

test('does not claim receipt when storage fails', async () => {
  const { db, calls } = setup({ storageFails: true })
  const response = await submit(db, inquiry())
  assert.equal(response.status, 503)
  assert.equal(calls.length, 1)
})

test('reports delayed notification while retaining a saved product inquiry', async () => {
  const { db, rows, calls } = setup({ mailStatus: 502 })
  const input = inquiry({ kind: 'product' })
  const response = await submit(db, input)
  assert.deepEqual(await response.json(), { ok: true, reference: input.id, notificationSent: false })
  assert.equal(rows.get(input.id).status, 'failed')
  assert.deepEqual(JSON.parse(calls[1].options.body).to, ['sales@maisondebrah-et.com'])
})

test('repeated submission with the same reference does not notify twice', async () => {
  const { db, calls } = setup()
  const input = inquiry()
  await submit(db, input)
  const response = await submit(db, input)
  assert.equal((await response.json()).notificationSent, true)
  assert.equal(calls.filter((call) => call.url.includes('mail.hostinger.com')).length, 1)
})
