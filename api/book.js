// Coffee Route booking "mini server".
//
// Vercel runs this file whenever the website sends a request to /api/book.
// It does three things:
//   1. Reads the booking details the form sent.
//   2. Checks they are complete and sensible.
//   3. Hands an email to Resend (resend.com), which delivers it to the owner.
//
// It needs two settings, saved in Vercel under Settings > Environment Variables:
//   RESEND_API_KEY    the secret key from your Resend account
//   BOOKING_TO_EMAIL  the inbox that should receive booking requests
// Optional:
//   BOOKING_FROM_EMAIL  the "from" address. Leave it unset until you own a domain.

const dns = require('dns').promises;

// What a properly written email address looks like: name@domain.ending
const EMAIL_SHAPE = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

// Ask the internet whether this domain has a mail server (an "MX record").
// "gmail.com" does. "asdf.asdf" does not, so nobody could ever reply to it.
// If the lookup itself is slow or broken we let the booking through, so a
// network hiccup never blocks a real customer.
async function domainTakesEmail(domain) {
  try {
    const slow = new Promise((_, reject) => setTimeout(() => reject({ code: 'TIMEOUT' }), 2500));
    const servers = await Promise.race([dns.resolveMx(domain), slow]);
    return servers.some(s => s.exchange && s.exchange !== '.');
  } catch (err) {
    return !['ENOTFOUND', 'ENODATA'].includes(err.code);
  }
}

const EVENT_TYPES = ['Wedding', 'Office or corporate', 'Market or festival', 'Private party', 'Something else'];
const GUEST_SIZES = ['Under 50', '50 to 100', '100 to 200', 'More than 200'];

// Turn anything into a trimmed string no longer than `max` characters.
function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

// Same, but also squashes line breaks, for fields that should be a single line.
function oneLine(value, max) {
  return clean(String(value == null ? '' : value).replace(/\s+/g, ' '), max);
}

// Make text safe to place inside the HTML email (so "<b>" shows as text, not bold).
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

module.exports = async function handler(req, res) {
  // Only accept form submissions (POST). Anything else is refused.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use POST.' });
  }

  // 1. Read the details. Vercel has already turned the JSON into an object.
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Spam trap: real people never tick the hidden box. Pretend it worked and stop.
  if (body.botcheck) return res.status(200).json({ ok: true });

  const booking = {
    name: oneLine(body.name, 100),
    email: oneLine(body.email, 200),
    phone: oneLine(body.phone, 40),
    date: oneLine(body.event_date, 10),
    type: oneLine(body.event_type, 40),
    guests: oneLine(body.guests, 40),
    location: oneLine(body.location, 200),
    message: clean(body.message, 2000),
  };

  // 2. Check them.
  const problems = [];
  if (!booking.name) problems.push('name');
  const emailLooksRight = EMAIL_SHAPE.test(booking.email) && !booking.email.includes('..');
  if (!emailLooksRight) problems.push('email');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) problems.push('event date');
  if (!booking.location) problems.push('location');
  if (!EVENT_TYPES.includes(booking.type)) booking.type = 'Something else';
  if (!GUEST_SIZES.includes(booking.guests)) booking.guests = 'Not given';
  if (problems.length) {
    return res.status(400).json({ ok: false, field: problems[0], error: 'Please check: ' + problems.join(', ') + '.' });
  }

  // The address is written correctly. Now check its domain can actually receive email.
  const domain = booking.email.split('@')[1].toLowerCase();
  if (!(await domainTakesEmail(domain))) {
    return res.status(400).json({ ok: false, field: 'email', error: `We couldn't find an email provider called "${domain}". Please check the part after the @.` });
  }

  // The settings must be present, otherwise we cannot send anything.
  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL || 'Coffee Route website <onboarding@resend.dev>';
  if (!key || !to) {
    console.error('Booking form is missing RESEND_API_KEY or BOOKING_TO_EMAIL.');
    return res.status(500).json({ ok: false, error: 'The booking form is not set up yet.' });
  }

  // 3. Build the email and hand it to Resend.
  const rows = [
    ['Name', booking.name],
    ['Email', booking.email],
    ['Phone', booking.phone || 'Not given'],
    ['Event date', booking.date],
    ['Type of event', booking.type],
    ['Guests', booking.guests],
    ['Location', booking.location],
    ['Message', booking.message || 'None'],
  ];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const html =
    '<h2 style="font-family:sans-serif;color:#263000">New booking request</h2>' +
    '<table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">' +
    rows.map(([label, value]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#707C4F;vertical-align:top">${label}</td>` +
      `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('') +
    '</table>' +
    '<p style="font-family:sans-serif;font-size:13px;color:#707C4F">Reply to this email to answer the customer directly.</p>';

  try {
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: booking.email, // pressing Reply goes to the customer
        subject: `Booking request: ${booking.type}, ${booking.date} (${booking.name})`,
        text,
        html,
      }),
    });
    if (!sent.ok) {
      console.error('Resend refused the email:', sent.status, await sent.text());
      return res.status(502).json({ ok: false, error: 'We could not send your request. Please try again.' });
    }
  } catch (err) {
    console.error('Could not reach Resend:', err);
    return res.status(502).json({ ok: false, error: 'We could not send your request. Please try again.' });
  }

  return res.status(200).json({ ok: true });
};
