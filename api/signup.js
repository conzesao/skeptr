// Vercel Serverless Function — receives a signup and notifies you via Resend.
// Uses your existing Resend account. No extra service needed.
//
// Required environment variables (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   your Resend API key (re_...)
//   SIGNUP_TO        where signup notifications should land, e.g. you@yourdomain.com
//   SIGNUP_FROM      a verified Resend sender, e.g. "Skeptr <hello@yourdomain.com>"
//
// Until you have a verified domain in Resend you can use onboarding@resend.dev as SIGNUP_FROM
// (Resend's shared test sender) — it only delivers to your own account email, which is fine for testing.

export default async function handler(req, res) {
  // Basic CORS so the page can call this even from a preview domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, variant, pay } = req.body || {};

    // minimal validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.SIGNUP_TO;
    const from = process.env.SIGNUP_FROM || 'onboarding@resend.dev';

    if (!apiKey || !to) {
      return res.status(500).json({ error: 'Server not configured' });
    }

    const subject = `New Skeptr signup — variant ${variant || '?'}`;
    const text =
      `New early-access signup\n\n` +
      `Email:   ${email}\n` +
      `Variant: ${variant || '-'}\n` +
      `Pay:     ${pay || '(not answered yet)'}\n` +
      `Time:    ${new Date().toISOString()}\n`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text, reply_to: email }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: 'Resend failed', detail });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
}

