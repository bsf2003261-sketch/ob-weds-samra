# Obaid & Samra - Wedding Invitation Website

A restrained, editorial digital invitation for **Obaid Ur Rehman & Samra Younas**
(Mehndi 29 Oct, Baarat 30 Oct, Walima 31 Oct 2026), using warm white, charcoal and champagne details.

Mobile-first and responsive, with a live countdown (Pakistan Standard Time),
event cards, Google Maps directions, and a "Save Our Wedding Dates" calendar file.
There is no database, login or RSVP form, by design.

---

## 1. Run it on your laptop

1. **Windows:** double-click **`start.bat`**
   **Mac / Linux:** run `./start.sh` in a terminal

That is all. If Node.js (the one thing the site needs) is missing, the launcher installs it
for you (Windows: click **Yes** if asked for permission), then opens the invitation in your
browser and starts the site. If automatic install is not possible on your PC, it tells you to
install "LTS" from https://nodejs.org and double-click the file again.

A window opens and prints your links:

```
On this laptop:               http://localhost:3000
Other devices (same Wi-Fi):   http://192.168.1.25:3000
```

Keep that window open while people are viewing the invitation.

## 2. Open it on other devices with a simple link

**Same Wi-Fi (family at home):**
Send the *"Other devices"* link. Any phone, tablet or laptop on the same Wi-Fi can open it.
If Windows asks about the firewall the first time, click **Allow access**.

**Anyone, anywhere, while your laptop is on:**
Keep the server running, then in a second window run a free tunnel:

- Cloudflare: `cloudflared tunnel --url http://localhost:3000`
- ngrok: `ngrok http 3000`

They print a public `https://...` link you can send on WhatsApp. It stops working when you
close the window or turn off the laptop, and free links change each time.

**A permanent link (laptop can be off): deploy to Vercel**
The site is plain static files and already includes a `vercel.json`, so no settings are needed.
Everything works there, including the countdown and the calendar download.

*Option A, one click (Windows):*
Double-click **`deploy-vercel.bat`**. It opens a Vercel sign-in page (a free account is fine),
then publishes the site and prints your live link, like `https://obaid-samra-wedding.vercel.app`.

*Option A, by hand (any computer):*
1. Open a terminal in this project folder (the one containing `vercel.json`).
2. Run `npx vercel login` and sign in.
3. Run `npx vercel --prod --scope shahzaib-cfeb` and press Enter to accept the defaults. If it complains about the
   project name, use lowercase letters only, e.g. `obaid-samra-wedding`.

*Option B, through GitHub:*
1. Upload this folder to a new GitHub repository.
2. On https://vercel.com/new choose **Import** for that repository, leave every setting as it is, and click **Deploy**.

*After editing `public/js/config.js`* (for example, once the Mehndi time and venue are confirmed),
run `deploy-vercel.bat` again (or `npx vercel --prod --scope shahzaib-cfeb`), or push the change to GitHub (Option B). The live link stays the same.

Other free hosts work too (Netlify Drop, Cloudflare Pages, GitHub Pages): upload the **`public`** folder.

## 3. Edit the details

Everything lives in one file: **`public/js/config.js`**. Open it in Notepad, edit, save, refresh the page.

- Names, headings, invitation wording
- For each event: date, time, venue, address
- Unknown details are `null`, and the site then shows "To be announced" instead of guessing

**When the Mehndi time and venue are confirmed**, change the Mehndi entry to something like:

```js
time: '7:00 PM',
venueName: 'Venue Name',
address: 'Street, City, Pakistan',
countdownAt: '2026-10-29T19:00:00+05:00',
countdownBasis: 'start',
startsAt: '2026-10-29T19:00:00+05:00',
```

(use the real values). The venue block and "Get Directions" button appear automatically.

## 4. How the countdown works

- Always uses Pakistan Standard Time (`+05:00`), so it is correct on any device in any country.
- Counts down to the **next** event and moves on automatically.
- The **Mehndi** countdown uses midnight on 29 October as a clearly identified fallback because its time is unconfirmed.
- The **Baarat** countdown targets the confirmed **11:00 AM departure**, not a ceremony start.
- The **Walima** counts to its confirmed **2:00 PM**.
- Once all countdown targets have passed, it shows: *"Three beautiful days, countless precious memories. Thank you for celebrating with us."*
- When the Mehndi time is confirmed, update its `countdownAt` and `countdownBasis` in `public/js/config.js`; the calendar keeps unknown details unspecified.

## 5. Check that everything works

```
node test/logic.test.js
```

Runs 12 checks on dates, weekdays, countdown transitions, timezone safety and the calendar file.

## Project layout

```
deploy-vercel.bat      one-click publish to Vercel (Windows)
vercel.json            deploy settings for Vercel (serves the public folder)
server.js              tiny local web server (no dependencies)
start.bat / start.sh   one-click launchers
public/
  index.html           page shell + reusable line-art (arches, botanicals)
  css/style.css        design system (warm white, charcoal, champagne, muted neutrals)
  js/config.js         ALL wedding details (edit this)
  js/logic.js          date, countdown and calendar logic
  js/app.js            components: Hero, Countdown, Couple, Events, Venues, Invitation, Final
test/logic.test.js     automated checks
```

## Notes

- Fonts (Cormorant Garamond, Inter and Amiri for the Arabic Basmala) load from Google Fonts
  when online and fall back to system serif fonts offline.
- Directions use a Google Maps *search* for the venue name and address. No GPS coordinates are
  invented; please check the pin lands in the right place.
- Animations are gentle and switch off for visitors who prefer reduced motion.
