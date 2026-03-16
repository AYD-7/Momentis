# Momentis

A backend service built with Node.js and Express that handles the full event registration lifecycle — from browsing events to scanning tickets at the door.



## What it does

- **Browse and create events** with capacity limits, categories, and organiser info
- **Register attendees** for events — each registration generates a unique ticket with a QR code
- **Send confirmation emails** automatically after registration
- **Validate tickets at the gate** — once scanned, a ticket is marked as used and can't be used again
- **Prevent overbooking** stops event's registration when there are no availab
- **Restore slots** when someone cancels their registration
- **Admin panel** for viewing registrations, check-in stats, and ticket statuses per event


## Technology Stack

- **Node.js v18 or higher** (the project uses ES Modules — `"type": "module"`)
- **MongoDB** — local or Atlas. If using a local install, it needs to run as a replica set for transactions to work (see below)

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd event-registration-system
npm install
```

### 2. Configure your environment

```bash
cp .env.example .env
```

Open `.env` and at minimum set your `MONGO_URI`. Everything else has sensible defaults for local development.

```env
MONGO_URI=mongodb://localhost:27017/event_registration
PORT=3000
ADMIN_API_KEY=change-this-to-something-secret
```

### 3. Set up MongoDB as a replica set (required for transactions)

MongoDB transactions require a replica set — even for local development. This is a one-time setup.

**On macOS with Homebrew:**
```bash
# Find your mongod config file
brew services stop mongodb-community

# Edit /opt/homebrew/etc/mongod.conf and add:
# replication:
#   replSetName: "rs0"

brew services start mongodb-community

# Then initialise the replica set
mongosh
> rs.initiate()
```

**Using Docker (easier):**
```bash
docker run -d -p 27017:27017 --name mongo-rs \
  mongo:7 --replSet rs0

docker exec mongo-rs mongosh --eval "rs.initiate()"
```

**Using MongoDB Atlas:**
Atlas runs as a replica set by default — no extra setup needed. Just paste your connection string into `MONGO_URI`.

### 4. Seed some sample events

```bash
npm run seed
```

This creates three sample events (Tech Summit, Startup Pitch Night, Design Workshop) so you have something to work with immediately. It wipes the events collection first, so don't run it on a database with real data.

### 5. Start the server

```bash
# Development — restarts automatically when you change files
npm run dev

# Production
npm start
```

You should see something like:
```
╔════════════════════════════════════════════╗
║   🎟️  Event Registration System            ║
╠════════════════════════════════════════════╣
║   Server   →  http://localhost:3000         ║
║   Env      →  development                   ║
╚════════════════════════════════════════════╝
```

Hit `http://localhost:3000` in your browser or Postman to see a list of all endpoints.

---

## How to actually use this

Here's a realistic walkthrough of the full flow, from creating an event to scanning a ticket at the door.

### Step 1 — Create an event

This is an admin-only action. Pass your admin key in the header.

```
POST /api/events
Header: x-admin-key: supersecret-admin-key
Content-Type: application/json
```

```json
{
  "title": "Node.js Workshop: Build a REST API",
  "description": "A hands-on workshop where you build a production-ready API from scratch. Bring your laptop.",
  "date": "2025-09-20T10:00:00",
  "endDate": "2025-09-20T17:00:00",
  "location": {
    "venue": "Tech Hub Lagos",
    "address": "14 Bayo Kuku St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria"
  },
  "capacity": 50,
  "price": 0,
  "category": "Technology",
  "organizer": {
    "name": "DevCircle Africa",
    "email": "hello@devcircle.africa",
    "phone": "+234-800-000-0000"
  },
  "tags": ["nodejs", "api", "backend", "workshop"]
}
```

The response includes the event ID — copy it, you'll need it for registration.

### Step 2 — Check available events

Anyone can do this — no auth required.

```
GET /api/events
GET /api/events?category=Technology
GET /api/events?search=node
GET /api/events?page=1&limit=5
```

### Step 3 — Register an attendee

```
POST /api/registrations
Content-Type: application/json
```

```json
{
  "eventId": "<paste the event ID from step 1>",
  "attendee": {
    "firstName": "Amara",
    "lastName": "Okafor",
    "email": "amara@example.com",
    "phone": "+234-812-000-0000"
  },
  "notes": "I'm a complete beginner — is that okay?"
}
```

What happens behind the scenes:
1. The event's `availableSlots` is decremented atomically (prevents overbooking)
2. A registration record is created
3. A ticket is generated with a unique code like `AB12-CD34-EF56`
4. A QR code is generated that encodes the ticket validation URL
5. A confirmation email is sent to `amara@example.com`

In the response you'll get the ticket code, the QR code as a base64 image, and — if you're in development mode with Ethereal — an `emailPreviewUrl` you can open in your browser to see the email.

### Step 4 — Check your email

In development, open the `emailPreviewUrl` from the response in your browser. You'll see a nicely formatted HTML email with the event details, ticket code, and QR code image.

In production (with real SMTP configured), the email lands in the attendee's inbox.

### Step 5 — Look up a ticket

The attendee can look up their ticket at any time using the code from their email.

```
GET /api/tickets/AB12-CD34-EF56
```

The response includes everything — event info, attendee details, ticket status, and the QR code image.

### Step 6 — Validate the ticket at the gate

When the attendee arrives, a gate scanner (or staff member) hits the validate endpoint. The QR code encodes this URL directly, so scanning the QR is the same as making this request.

```
POST /api/tickets/validate/AB12-CD34-EF56
Content-Type: application/json
```

```json
{
  "validatedBy": "Gate A - Staff: James"
}
```

**If the ticket is valid:** The ticket is marked as `used`, the timestamp is recorded, and the response confirms entry.

**If someone tries to scan it a second time:** The API returns a 409 with the timestamp of the original scan. Denied.

**If the ticket was cancelled:** 400, denied.

**If the event hasn't started yet:** 400, denied with the start time.

### Step 7 — Cancel a registration

If an attendee can't make it:

```
PATCH /api/registrations/<registration-id>/cancel
```

This marks the registration and ticket as cancelled, and adds the freed slot back to the event's available capacity — someone else can register.

### Step 8 — Check admin dashboard

While the event is running, you can monitor check-ins:

```
GET /api/admin/events/<event-id>/registrations
Header: x-admin-key: supersecret-admin-key
```

The response includes a `summary` object:
```json
{
  "summary": {
    "total": 50,
    "confirmed": 47,
    "cancelled": 3,
    "checkedIn": 31
  }
}
```

And each registration entry shows the attendee's ticket status (valid, used, etc.) so you can see exactly who's arrived and who hasn't.

---

## API reference

### Events

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/events` | Public | List published events |
| GET | `/api/events/:id` | Public | Get event by ID |
| POST | `/api/events` | Admin | Create a new event |
| PATCH | `/api/events/:id` | Admin | Update an event |

**Query params for GET /api/events:**
- `category` — one of: Technology, Business, Design, Music, Sports, Health, Education, Other
- `search` — partial match on event title
- `page` — page number (default: 1)
- `limit` — results per page (default: 10)

---

### Registrations

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/registrations` | Public | Register for an event |
| GET | `/api/registrations/:id` | Public | Get registration + ticket info |
| PATCH | `/api/registrations/:id/cancel` | Public | Cancel a registration |

---

### Tickets

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/tickets/:ticketCode` | Public | Fetch ticket details |
| POST | `/api/tickets/validate/:ticketCode` | Public | Validate (scan) a ticket |

---

### Admin (all require `x-admin-key` header)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/admin/events` | All events with registration stats |
| GET | `/api/admin/events/:eventId/registrations` | Registrant list for an event |
| GET | `/api/admin/tickets` | All tickets (filterable by status, event) |

**Query params for admin registrations:**
- `status` — "confirmed" or "cancelled"
- `page`, `limit`, `sortBy`, `order`

**Query params for admin tickets:**
- `status` — "valid", "used", "cancelled", or "expired"
- `eventId` — filter to a specific event

---

## Email configuration

### Development (default — no setup needed)

By default, if `EMAIL_USER` isn't set in `.env`, the app uses [Ethereal](https://ethereal.email/) — a fake SMTP service that catches emails without delivering them. After each registration, you'll see something like this in your console:

```
📧 Email preview (Ethereal): https://ethereal.email/message/abc123...
```

Open that URL in your browser to see exactly what the attendee would receive. The URL is also included in the API response under `emailPreviewUrl`.

### Production (real email)

Configure these in your `.env`:

```env
EMAIL_HOST=smtp.sendgrid.net   # or smtp.mailgun.org, smtp.brevo.com, etc.
EMAIL_PORT=587
EMAIL_SECURE=false             # true only for port 465
EMAIL_USER=apikey              # your SMTP username
EMAIL_PASS=your_api_key_here   # your SMTP password or API key
EMAIL_FROM="Your Events <noreply@yourdomain.com>"
```

**Provider quick-reference:**

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| SendGrid | `smtp.sendgrid.net` | 587 | Use "apikey" as user |
| Mailgun | `smtp.mailgun.org` | 587 | |
| Brevo (Sendinblue) | `smtp-relay.brevo.com` | 587 | |
| Gmail | `smtp.gmail.com` | 587 | Needs App Password, not your real password |
| Postmark | `smtp.postmarkapp.com` | 587 | |

---

## How overbooking prevention works

This comes up a lot so it's worth explaining clearly.

When someone registers, instead of doing:

```js
// ❌ This has a race condition
const event = await Event.findById(eventId);
if (event.availableSlots > 0) {
  event.availableSlots -= 1;
  await event.save();
  // ... create registration
}
```

We do this in a single atomic operation:

```js
// ✅ This is race-condition safe
const event = await Event.findOneAndUpdate(
  { _id: eventId, availableSlots: { $gt: 0 } },  // condition
  { $inc: { availableSlots: -1 } },               // update
  { new: true }
);
```

The check and the decrement happen at the same time in the database. If two requests arrive simultaneously for the last available slot, MongoDB guarantees that only one of them will match the `$gt: 0` condition and decrement. The other gets `null` back and we return a "fully booked" response.

---

## Response format

Every endpoint returns the same JSON shape:

```json
// Success
{
  "success": true,
  "message": "Registration confirmed!",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "This event is fully booked.",
  "errors": ["field: message"]   // only on validation failures
}
```

---

## Packages you'll need for common next features

Here are the packages to install when you're ready to build on top of this, with a quick note on what each one does and why you'd use it.

### Authentication & Security

```bash
# JWT-based authentication — for user accounts, protected registrations
npm install jsonwebtoken bcryptjs

# Helmet — sets sensible HTTP security headers with one line
npm install helmet

# Rate limiting — prevent abuse and brute-force attacks
npm install express-rate-limit

# CORS — allow your frontend to talk to this API from a different origin
npm install cors
```

### Payments

```bash
# Stripe — the standard for accepting card payments
# You'd use this to charge for paid events before confirming registration
npm install stripe
```

### File uploads

```bash
# Multer — handles multipart/form-data for file uploads
# Use this if you want admins to upload event banner images
npm install multer

# AWS S3 — store uploaded files in the cloud instead of on the server
npm install @aws-sdk/client-s3

# Cloudinary — simpler alternative to S3 for image uploads/transformation
npm install cloudinary
```

### Scheduling & Background jobs

```bash
# node-cron — run scheduled tasks (e.g. send reminder emails 24h before an event)
npm install node-cron

# Bull — a proper job queue backed by Redis, for heavier background work
# like sending thousands of reminder emails without blocking the server
npm install bull
npm install ioredis  # Redis client, required by Bull
```

### Caching

```bash
# ioredis — Redis client for caching frequently-read data like event listings
npm install ioredis
```

### Testing

```bash
# Jest + Supertest — the standard combo for testing Express APIs
npm install --save-dev jest supertest @jest/globals

# Mongodb-memory-server — spins up a real in-memory MongoDB for tests
# so you don't need a running database to run your test suite
npm install --save-dev mongodb-memory-server
```

### PDF generation (e.g. printable tickets)

```bash
# PDFKit — generate PDF files in Node.js
# You could use this to produce a printable ticket PDF as an email attachment
npm install pdfkit
```

### Websockets (real-time check-in dashboard)

```bash
# Socket.io — if you want a live check-in board that updates as people scan in
npm install socket.io
```

### API documentation

```bash
# Swagger UI + JSDoc annotation-based docs
npm install swagger-ui-express swagger-jsdoc
```

### Logging

```bash
# Winston — structured logging that's better than console.log for production
npm install winston

# Or Pino — faster and lighter than Winston
npm install pino pino-http
```

---

## Upgrading the admin authentication

The current admin auth is an API key check — simple and fine to start with. When you're ready for proper user authentication:

1. Install: `npm install jsonwebtoken bcryptjs`
2. Create a `user.model.js` with hashed passwords
3. Create an `auth.routes.js` with `/login` and `/register`
4. Replace `auth.middleware.js` with a JWT verification middleware
5. Add role-based access (admin, organizer, attendee) as needed

---

## Frequently asked questions

**Why do I get a transaction error on local MongoDB?**
Local MongoDB needs to run as a replica set for sessions/transactions to work. See the setup instructions above — it's a one-time config change. Alternatively, you can switch to MongoDB Atlas which supports transactions out of the box.

**The email isn't sending in development — is that normal?**
Yes. With no `EMAIL_USER` set, emails go to Ethereal (a fake inbox). Check the console for the preview URL after registering, or look for `emailPreviewUrl` in the API response.

**Can someone register multiple times with different emails?**
Yes — the uniqueness check is per email+event combination. If you want to limit registrations by phone number or IP address, you'd need to add additional indexes and checks.

**Where is the QR code stored?**
In the `Ticket` document as a base64-encoded PNG string in the `qrCodeData` field. For high-volume systems, you'd want to upload the image to S3 or Cloudinary and store a URL instead to avoid storing large blobs in MongoDB.

**What happens if I delete an event?**
There's no delete endpoint currently — only status updates. Setting an event to `cancelled` is the intended way to deactivate it. This preserves registration history, which you almost certainly want to keep.

---

## License

MIT — do whatever you want with it.
