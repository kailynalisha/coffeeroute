# Coffee Route

Website for **Coffee Route**, a mobile Colombian coffee Jeep in Charlotte, NC.
*Taste Colombia from the top. Inspired by Colombia.*

> 🚧 Work in progress, not launched yet.

## Structure

- `index.html`: the home page. It is a "descent": full-screen scenes, the logo as the star, and an altitude reading that falls from Nevado del Huila to Charlotte as you scroll.
- `book.html`: the booking page with the form. On Vercel its address is `/book`, which is a good link for an Instagram bio or a QR code.
- `styles.css`: the styles shared by both pages
- `assets/`: logos (transparent PNGs in cream and olive) and photos
- `api/book.js`: the booking "mini server". Vercel runs it when the form is submitted, and it emails the request to the owner through Resend.
- `vercel.json`: tells Vercel to use clean addresses (`/book` instead of `/book.html`)

Open `index.html` in a browser to preview the design. The booking form only works on Vercel, because it needs `api/book.js` to be running.

## How booking works

1. A visitor fills in the form on the booking page (`book.html`) and presses "Send request".
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

- [ ] Set up booking on Vercel and Resend (see "Setting up booking" above)
- [ ] Switch booking emails to the owner's inbox before launch
- [ ] Add the brand fonts if licensed (Tenacious and Hundrea).
- [ ] Write the About section: replace the bracketed placeholder text with Gabriela's story
- [ ] Add more real photos from Instagram

## Colors

The site uses a light palette sampled from the owner's printed menus, with the brand manual's darker tones for text.

| Name   | Hex       | Used for |
|--------|-----------|----------|
| Beige  | `#F7F2DE` | Page background |
| Cream  | `#FFFAE6` | Booking section and booking page |
| Green  | `#6B7A47` | Logo, buttons, footer |
| Olive  | `#424106` | Text |
| Sand   | `#D4CB8C` | Map slide |
