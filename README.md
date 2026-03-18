# Momentis
A simple Node.js and Express backend that lets people register for events, receive a ticket by email, and get checked in at the door using a QR code.

---

## What it does

- Create events with a title, date, location, and a capacity limit
- Anyone can register for an event with their name and email
- After registering, they get a confirmation email with their ticket code and a QR code
- The system prevents the same email from registering twice for the same event
- The system prevents overbooking — once the event is full, no more registrations go through
- Tickets can be validated (scanned) at the gate, and each ticket only works once
- If someone cancels, their slot is freed up for someone else
- An admin panel lets you see all registrations for an event, plus check-in stats

---

## Project structure

```

├── index.js                         ← entry point, wires everything together
├── config/
│   ├── db.config.js                      ← MongoDB connection
│   └── seed.config.js                    ← adds sample events to the database
├── models/
│   ├── event.model.js             ← what an event looks like in the database
│   ├── registration.model.js      ← stores each person's registration
│   └── ticket.model.js            ← the ticket generated after registration
├── controllers/
│   ├── event.controller.js        ← logic for listing, creating, updating events
│   ├── registration.controller.js ← the main registration flow
│   ├── ticket.controller.js       ← looking up and validating tickets
│   └── admin.controller.js        ← admin views
├── routes/
│   ├── event.routes.js
│   ├── registration.routes.js
│   ├── ticket.routes.js
│   └── admin.routes.js
├── middleware/
│   └── auth.middleware.js         ← blocks admin routes without the right key
└── utils/
    ├── email.util.js              ← sends the confirmation email
    └── ticket.util.js             ← generates ticket codes and QR codes
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

The only thing you must set is `MONGO_URI`. Everything else works fine with the defaults.
But to get the best result, set up your nodemailer. T for thanks.

```
MONGO_URI=mongodb://localhost:27017/momentis
```

If you're using MongoDB Atlas, paste your connection string there instead.

### 3. Add sample events to the database

```bash
npm run seed
```

This creates ten test events you can immediately register for. Run it once.
*By the time you are seeing this, I have done that already.*

### 4. Start the server

```bash
npm start
```

Visit `http://localhost:5000/summary` and you'll see a list of all available routes.

---

## How to use it

I didn't have the chance to create a client-side app for this, so you can only use API testing tools like Postman, ThunderClient, or Insomnia. 
---

### Step 1 — See what events are available

```
GET http://localhost:5000/api/events
```

Copy one of the event IDs from the response — you'll need it for registration.

---

### Step 2 — Register for an event

```
POST http://localhost:5000/api/registrations
Content-Type: application/json
```

```json
{
  "eventId": "PASTE_EVENT_ID_HERE",
  "firstName": "Oluwatobi",
  "lastName": "Adelabu",
  "email": "oluwatobiadelabu@example.com",
  "phone": "08012345678",
  "notes": "I'm thinking of migrating to fine arts"
}
```

**What happens:**
1. The system checks the event exists and has available slots
2. It checks the email hasn't already registered for this event
3. A registration record is saved
4. A ticket is generated with a unique code like `AB12-CD34-EF56`
5. A QR code is generated for that ticket
6. A confirmation email is sent

**The response looks like this:**
```json
{
  "success": true,
  "message": "Registration successful! Check your email for your ticket.",
  "data": {
    "registration": { ... },
    "ticket": {
      "ticketCode": "AB12-CD34-EF56",
      "status": "valid",
      "qrCode": "data:image/png;base64,..."
    },
    "slotsRemaining": 29,
    "emailPreviewUrl": "https://ethereal.email/message/..."
  }
}
```

The `emailPreviewUrl` is only present in development mode. Open it in the browser to see exactly what the email looks like.
*Having hiccups with this, check your email inbox to view*
---

### Step 3 — Look up the ticket

```
GET http://localhost:5000/api/tickets/AB12-CD34-EF56
```

Returns the ticket details including the QR code, event info, and current status.

---

### Step 4 — Validate (scan) the ticket at the gate

This is what a QR scanner app would call when someone arrives. The QR code encodes this URL directly, so scanning it automatically hits this endpoint.

```
POST http://localhost:5000/api/tickets/validate/AB12-CD34-EF56
Content-Type: application/json
```
*Additional Info*
In Postman add this to the body:
```json
{
  "scannedBy": "Admin Oluwatobi"
}

**If the ticket is valid:**
```json
{
  "success": true,
  "message": "Welcome, Oluwatobi Adelabu!",
  "data": { "attendeeName": "Oluwatobi Adelabu", "event": "...", "usedAt": "..." }
}
```

**If someone tries to scan it again:**
```json
{
  "success": false,
  "message": "This ticket was already used on 15/03/2026, 10:34:22 AM. Entry denied."
}
```

---

### Step 5 — Cancel a registration

```
PATCH http://localhost:5000/api/registrations/REGISTRATION_ID/cancel
```

This marks the registration as cancelled, invalidates the ticket, and adds the slot back to the event so someone else can register.

---

### Admin routes

All admin routes need this header:

```
x-admin-key: admin123
```

**See all events with registration counts:**
```
GET http://localhost:5000/api/admin/events
Header: x-admin-key: admin123
```

**See everyone registered for a specific event:**
```
GET http://localhost:5000/api/admin/events/EVENT_ID/registrations
Header: x-admin-key: admin123
```

The response includes a summary like:
```json
{
  "summary": {
    "totalRegistrations": 25,
    "confirmed": 23,
    "cancelled": 2,
    "checkedIn": 18
  }
}
```

---

### Creating an event (admin)

```
POST http://localhost:5000/api/events
Header: x-admin-key: admin123
Content-Type: application/json
```

```json
{
  "title": "JavaScript for Beginners",
  "description": "Learn the basics of JavaScript in one afternoon.",
  "date": "2025-11-01T14:00:00",
  "location": "CcHub, Yaba, Lagos",
  "capacity": 40,
  "price": 0,
  "organizer": "DevCircle Africa",
  "organizerEmail": "hello@devcircle.africa"
}



```
### All API endpoints

- GET - `/api/events` - Doesn't require admin - List all events -
- GET - `/api/events/:id` - Doesn't require admin - Get one event -
- POST - `/api/events` - Requires Admin - Create an event -
- PATCH - `/api/events/:id` - Requires Admin - Update an event -
- POST - `/api/registrations` - Doesn't require admin - Register for an event -
- GET - `/api/registrations/:id` - Doesn't require admin - View a registration -
- PATCH - `/api/registrations/:id/cancel` - Doesn't require admin - Cancel a registration -
- GET - `/api/tickets/:ticketCode` - Doesn't require admin - Look up a ticket -
- POST - `/api/tickets/validate/:ticketCode` - Doesn't require admin - Validate a ticket at the gate -
- GET - `/api/admin/events` - Requires Admin - All events with stats -
- GET - `/api/admin/events/:id/registrations` - Requires Admin - Registrations for an event -

---

## Packages used (!important)

 `express` - The web framework — handles routing and HTTP 
 `mongoose` - Connects to MongoDB and defines data schemas 
 `nodemailer` - Sends emails (or uses Ethereal for fake emails in dev) 
 `qrcode` - Generates QR code images from text 
 `dotenv` - Loads the `.env` file into `process.env` 
 `nodemon` - Restarts the server automatically when changes are made (dev dependency) 



## Common issues

**"Cannot use require statement"**
This project uses ESM (`import`).

**Email preview URL not showing up**
Check your terminal — it's printed there when using Ethereal. It's also in the API response under `emailPreviewUrl`. 
<!-- According to the YouTube video -->

**Admin routes returning 401**
Add the header `x-admin-key: admin123` to your request in Postman or Thunder Client.

---
