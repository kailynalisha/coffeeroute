# Coffee Route

Website for **Coffee Route**, a mobile Colombian coffee Jeep in Charlotte, NC.
*Taste Colombia from the top. Inspired by Colombia.*

> 🚧 Work in progress, not launched yet.

## Structure

- `index.html`: the whole site (HTML, CSS and JS in one file). The page is a "descent": full-screen scenes, the logo as the star, and an altitude reading that falls from Nevado del Huila to Charlotte as you scroll.
- `assets/`: logos (transparent PNGs in cream and olive) and photos from the brand manual
- `api/book.js`: the booking "mini server". Vercel runs it when the form is submitted, and it emails the request to the owner through Resend.

Open `index.html` in a browser to preview the design. The booking form only works on Vercel, because it needs `api/book.js` to be running.

## How booking works

1. A visitor fills in the form in the Events section and presses "Send request".
2. The page sends the details to `/api/book`.
3. `api/book.js` checks the details, then asks Resend to email them to the owner.
4. The visitor sees a thank-you message. Replying to the email goes straight to the visitor.

## Setting up booking (one time)

**1. Put the site on Vercel**
- Sign in at vercel.com with GitHub.
- Add New > Project, then import `kailynalisha/coffeeroute`. Keep the default settings and press Deploy.

**2. Get a Resend key**
- Sign up at resend.com **using the email address that should receive bookings**. Without a domain, Resend only delivers to that address.
- Go to API Keys > Create API Key. Copy the key (it starts with `re_`). It is shown once.

**3. Give Vercel the settings**
- In the Vercel project: Settings > Environment Variables. Add:
  - `RESEND_API_KEY`: the key from step 2
  - `BOOKING_TO_EMAIL`: the same email address you signed up to Resend with
- Then Deployments > the latest one > "..." > Redeploy, so the settings take effect.

**4. Test it**
- Open the live site, fill in the form, and check the inbox (and the spam folder the first time).

Never put the Resend key in this repo. It belongs only in Vercel's settings.

**Later, when the owner has a domain:** verify the domain in Resend, set `BOOKING_FROM_EMAIL` to something like `Coffee Route <bookings@yourdomain.com>`, and set `BOOKING_TO_EMAIL` to any inbox she likes.

## Still to do before launch

- [ ] Confirm menu items and prices (current ones come from the A-frame sign mockup)
- [ ] Add real weekly stops and hours ("Find the Jeep" section)
- [ ] Set up booking on Vercel and Resend (see "Setting up booking" above)
- [ ] Switch booking emails to the owner's inbox before launch
- [ ] Add brand fonts if licensed (Tenacious and Hundrea). Archivo is standing in for headlines.
- [ ] Write the About section: replace the bracketed placeholder text with Gabriela's story
- [ ] Add more real photos from Instagram

## Brand colors

| Name   | Hex       |
|--------|-----------|
| Forest | `#263000` |
| Olive  | `#424106` |
| Sage   | `#707C4F` |
| Sand   | `#D4CB8C` |
| Cream  | `#FFFBE6` |
| Bean   | `#6D4930` |
