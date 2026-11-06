const recipients = new Set(['contact@maisondebrah-et.com', 'sales@maisondebrah-et.com'])

export default {
  async fetch(request, env) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/send') {
      return Response.json({ ok: false }, { status: 404 })
    }

    let message
    try {
      message = await request.json()
    } catch {
      return Response.json({ ok: false }, { status: 400 })
    }

    if (!recipients.has(message?.to) || typeof message.subject !== 'string' ||
        !message.subject || message.subject.length > 200 ||
        typeof message.text !== 'string' || !message.text || message.text.length > 10000) {
      return Response.json({ ok: false }, { status: 400 })
    }

    try {
      const result = await env.EMAIL.send({
        from: 'website@maisondebrah-et.com',
        to: message.to,
        subject: message.subject,
        text: message.text,
      })
      const accepted = typeof result.messageId === 'string' && result.messageId.length > 0
      return Response.json({ ok: Boolean(accepted) }, { status: accepted ? 200 : 502 })
    } catch (error) {
      console.error('Cloudflare inquiry email failed', error)
      return Response.json({ ok: false }, { status: 502 })
    }
  },
}
