import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { onRequestPost } from '../functions/api/inquiries.ts'
import { isValidPhone } from '../src/phone.ts'
import mailerWorker from '../workers/inquiry-mailer.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

function setup({ mailStatus = 200, storageFails = false } = {}) {
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
  const mailer = {
    async fetch(url, options) {
      calls.push({ url: String(url), options })
      return Response.json({ ok: mailStatus === 200 }, { status: mailStatus })
    },
  }
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    if (String(url).includes('siteverify')) return Response.json({ success: true, hostname: 'maisondebrah-et.com' })
    throw new Error('Unexpected external request')
  }
  return { db, mailer, rows, calls }
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

async function submit(db, body, mailer) {
  return onRequestPost({
    request: new Request('https://maisondebrah-et.com/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://maisondebrah-et.com' },
      body: JSON.stringify(body),
    }),
    env: { INQUIRIES_DB: db, TURNSTILE_SECRET: 'test-secret', MAILER: mailer },
  })
}

test('saves an inquiry before notifying the correct mailbox', async () => {
  const { db, mailer, rows, calls } = setup()
  const input = inquiry()
  const response = await submit(db, input, mailer)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true, reference: input.id, notificationSent: true })
  assert.equal(rows.get(input.id).status, 'sent')
  assert.equal(JSON.parse(calls[1].options.body).to, 'contact@maisondebrah-et.com')
})

test('rejects invalid inquiries before storage or email', async () => {
  const { db, mailer, rows, calls } = setup()
  const response = await submit(db, inquiry({ email: '', phone: '', message: '' }), mailer)
  assert.equal(response.status, 400)
  assert.equal(rows.size, 0)
  assert.equal(calls.length, 0)
})

test('accepts formatted phone numbers and rejects text or incomplete numbers', () => {
  for (const phone of ['0911238324', '+251 91 123 8324', '+1 202 555 0123']) assert.equal(isValidPhone(phone), true, phone)
  for (const phone of ['D9yd9yz9yz', '091ABC8324', '123', '251+911238324', '']) assert.equal(isValidPhone(phone), false, phone)
})

test('rejects an invalid phone even when an email address is provided', async () => {
  const { db, mailer, rows, calls } = setup()
  const response = await submit(db, inquiry({ phone: 'D9yd9yz9yz' }), mailer)
  assert.equal(response.status, 400)
  assert.equal(rows.size, 0)
  assert.equal(calls.length, 0)
})

test('rejects an unknown inquiry type', async () => {
  const { db, mailer, calls } = setup()
  const response = await submit(db, inquiry({ kind: 'toString' }), mailer)
  assert.equal(response.status, 400)
  assert.equal(calls.length, 0)
})

test('does not claim receipt when storage fails', async () => {
  const { db, mailer, calls } = setup({ storageFails: true })
  const response = await submit(db, inquiry(), mailer)
  assert.equal(response.status, 503)
  assert.equal(calls.length, 1)
})

test('reports delayed notification while retaining a saved product inquiry', async () => {
  const { db, mailer, rows, calls } = setup({ mailStatus: 502 })
  const input = inquiry({ kind: 'product' })
  const response = await submit(db, input, mailer)
  assert.deepEqual(await response.json(), { ok: true, reference: input.id, notificationSent: false })
  assert.equal(rows.get(input.id).status, 'failed')
  assert.equal(JSON.parse(calls[1].options.body).to, 'sales@maisondebrah-et.com')
})

test('repeated submission with the same reference does not notify twice', async () => {
  const { db, mailer, calls } = setup()
  const input = inquiry()
  await submit(db, input, mailer)
  const response = await submit(db, input, mailer)
  assert.equal((await response.json()).notificationSent, true)
  assert.equal(calls.filter((call) => call.url.includes('mailer.internal')).length, 1)
})

test('mailer accepts only the two showroom addresses', async () => {
  const sent = []
  const env = { EMAIL: { async send(message) { sent.push(message); return { messageId: 'test-message-id' } } } }
  const body = { to: 'sales@maisondebrah-et.com', subject: 'Test inquiry', text: 'Please call me.' }
  const accepted = await mailerWorker.fetch(new Request('https://mailer.internal/send', { method: 'POST', body: JSON.stringify(body) }), env)
  assert.equal(accepted.status, 200)
  assert.equal(sent[0].from, 'website@maisondebrah-et.com')
  const rejected = await mailerWorker.fetch(new Request('https://mailer.internal/send', { method: 'POST', body: JSON.stringify({ ...body, to: 'other@example.com' }) }), env)
  assert.equal(rejected.status, 400)
  assert.equal(sent.length, 1)
})
