# 🏡 MomentStay

**🌐 Live application:** [momentstay-vacation-booking-system.vercel.app](https://momentstay-vacation-booking-system.vercel.app)

**An Airbnb-inspired vacation rental marketplace — guests book unique accommodations and also list their properties as a host, all under one account.**

* **As a traveler (guest):** discover and book stays, manage your wishlist, reschedule or cancel reservations, view your trip history, and review stays.
* **As a host (property owner):** create, update and delete properties, manage bookings and payments, review guest feedback, and track performance through a dashboard.

## ✨ Features

### 👥 Guests

- Discover stays by browsing 15 categories (for example Beachfront, Luxury, Treehouse, Lakefront and Desert) or by searching a title, category, city, state or country. The home page also highlights curated "Best Picks".
- Pick dates on a calendar and see the total price instantly. The server calculates the final price and rejects overlapping bookings.
- Pay at checkout with a demo payment: UPI, card, net banking or pay at property. No card or UPI details are collected and no real money moves.
- Reschedule a booking: pay only the extra amount if the new stay costs more, or see the refund amount if it costs less.
- Cancel a booking with a confirmation and a demo refund message. Completed stays cannot be rescheduled or cancelled.
- Track every booking in the reservation list with a status (upcoming, staying now or completed), add it to your calendar (.ics file), and write a review after a completed stay.
- Review your full booking history, with payment details, on the trip journal page.
- Save favorite stays to a wishlist.
- Leave star rating and written review per property; submitting again updates your review.
- Read featured guest stories on the home page.

### 👤 Hosts

Hosts manage everything from the host dashboard (`/host`):

- **Overview:** earnings received, balance still due at the property, total and upcoming bookings, average rating, upcoming check-ins, guests currently staying and the latest reviews.
- **Properties:** every property with its bookings, earnings and rating; open, edit or jump to its reviews; list a new property.
- **Bookings:** which guest booked which property, dates, nights, total, payment status (paid, balance due or not recorded), payment method and reference. Filter by stay status, payment status or property, search by guest, and export the filtered list as CSV.
- **Payment actions:** confirm that the balance of a "pay at property" booking was received, or cancel a booking that has not finished.
- **Reviews:** all guest ratings and comments on the host's properties, filtered by property and rating, with a "New" badge for reviews from the last 7 days.
- Create and edit properties with up to 15 photos (images only, 5 MB each).
- Delete a property: not allowed while it has upcoming or ongoing bookings. Otherwise its photos, past bookings, reviews and wishlist entries are removed.
- A host cannot book or review their own property.

### 🔔 Notifications

- Notifications page lists every message (kept for 90 days).
- Guests are notified when a host cancels their booking (with the refund amount and a "Rebook" shortcut) and when a host confirms a payment.
- Hosts are notified about new bookings, rescheduled and cancelled bookings, and new or updated reviews.
- The bell checks for new notifications every minute and when the browser tab regains focus.

### 🛂 Access rules

- Visitors without an account can browse, search, and read property details and reviews.
- Booking, wishlist, reviews, trips, reservations, notifications, the host dashboard, and creating or editing properties need a login.
- A visitor who tries one of these actions is sent to the login page and returned to the same page afterwards.
- An expired login signs the user out automatically.

## 🛠️ Tech stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 18 | User interface |
| Redux Toolkit and Redux Persist | Global state; the login survives a page refresh |
| React Router 6 | Routing and protected routes |
| Material UI 6 | UI components and icons |
| React Date Range | Booking calendar |
| React Icons | Icons |
| Sass (SCSS) | Styling |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js and Express | REST API |
| MongoDB Atlas and Mongoose | Database |
| JSON Web Tokens | Authentication (7-day expiry) |
| bcryptjs | Password hashing |
| Multer | Multipart image upload (memory storage) |
| AWS SDK v3 (`@aws-sdk/client-s3`) | Upload and delete photos on AWS S3 |
| Cloudinary SDK | Upload and delete photos on Cloudinary |
| compression | Gzip responses |
| dotenv | Environment variables |

### Hosting and tooling

| Service | Purpose |
| --- | --- |
| Vercel | Frontend. `vercel.json` forwards `/api/*` to the backend and serves `index.html` for every other route |
| Render | Backend API (current deployment) |
| AWS EC2 with PM2 and Nginx | Alternative backend deployment, see [Deployment](#deployment) |
| AWS IAM | Least-privilege access control |
| MongoDB Atlas | Database (`dbName: MomentStay`) |
| AWS S3 or Cloudinary | Photo storage |
| Jenkins | Testing |

## 🧭 Architecture

```text
React client (Vercel)
      |  /api/*  rewrite (vercel.json)
      v
Express API (Render, or EC2 behind Nginx)
      |                         |
      v                         v
MongoDB Atlas        Image storage: AWS S3 or Cloudinary
```

1. The browser calls `/api/...` on the Vercel domain. Vercel forwards the request to the backend, so the client has no CORS problems and no hard-coded backend address.
2. Protected routes pass through the authentication middleware, which verifies the JWT before any handler runs.
3. The guest, host and owner of a booking, review or property are always taken from the token, never from the request body.
4. Edit and delete routes check ownership. Only a property's creator can edit or delete it, only the guest who made a booking can reschedule it, and the guest or the host can cancel it.
5. The host dashboard is built on the server from the logged-in user's own properties, so a host only sees bookings and reviews of their own listings.
6. Photos are uploaded through the API to the selected storage provider. MongoDB stores only the photo URLs.
7. The client keeps the user and token in Redux Persist, so a refresh does not log the user out.

### 🖼️ Image storage

All uploads go through `server/config/storage.js`. Each provider is one file in `server/config/storage/` with the same three functions (`upload`, `remove`, `owns`), so another provider can be added without changing the routes. Choose the provider with `STORAGE_PROVIDER`:

| Value | Service |
| --- | --- |
| `s3` | AWS S3 |
| `cloudinary` | Cloudinary |
| `local` | Server disk, for development only |

If `STORAGE_PROVIDER` is empty and AWS keys are present, S3 is used. If no storage is configured in production, uploads are refused with a clear message and the rest of the site keeps working. Photos stored with one provider can still be deleted after switching to another.

### 💸 Payment flow (demo)

- A booking is created with a `paymentMethod`. For UPI, card and net banking the booking is saved as paid, with a generated reference such as `MSP-XXXXXXXX-XXXX`.
- With "pay at property" the booking is saved as pending. The host later confirms the payment, which marks it as paid and notifies the guest.
- When a guest reschedules, the server compares the new total with the amount already paid. A higher total requires a payment method for the extra amount. A lower total produces a refund amount in the response.
- No payment provider is connected. Refunds are only messages.

## 🔧 Local setup

Requirements: Node.js 18 or newer, a MongoDB database, and an AWS S3 bucket or a Cloudinary account for photos.

### 1. Clone and install

```bash
git clone https://github.com/hema-code06/Momentstay_vacation_booking_system.git
cd Momentstay_vacation_booking_system

cd server && npm install
cd ../client && npm install
```

### 2. Environment files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`:

```env
PORT=3001
NODE_ENV=development
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret

# s3 | cloudinary | local
STORAGE_PROVIDER=cloudinary

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=your_bucket_name

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`client/.env`:

```env
REACT_APP_API_URL=/api
```

The `proxy` entry in `client/package.json` forwards `/api` requests from the development server to `http://localhost:3001`. If the variable is missing, the client falls back to `/api`.

### 3. Run

```bash
# Terminal 1: backend
cd server
npm run dev

# Terminal 2: frontend
cd client
npm start
```

Open http://localhost:3000. The server log should show `Image storage: ...` and `Connected to MongoDB`.

## 🚀 Deployment

### Frontend on Vercel

`client/vercel.json` forwards the API and keeps the single-page routes working:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<your-backend-domain>/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Set `REACT_APP_API_URL=/api` in the Vercel project settings. Vercel builds with `CI=true`, so ESLint warnings fail the build. Run `npm run build` locally before pushing.

### Backend on Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add the server environment variables listed above, including `NODE_ENV=production` and `STORAGE_PROVIDER`
- After a deploy, the log should show `Image storage: cloudinary` (or `s3`) and `Connected to MongoDB`
- When you add a dependency, commit `package.json` and `package-lock.json`

### ☁️ Backend on AWS EC2 (alternative)

1. Launch an EC2 instance and open ports 22 (SSH), 80 and 443 in its security group.
2. Install Node.js 18 or newer, clone the repository and run `cd server && npm install`.
3. Create `server/.env` with the production values.
4. Run the API under PM2 so it restarts after a crash or a reboot:

   ```bash
   pm2 start index.js --name momentstay
   pm2 save
   pm2 startup
   ```

5. Install Nginx and reverse-proxy requests to `localhost:3001`.
6. Issue a free Let's Encrypt certificate with Certbot so the API is served over HTTPS.
7. Point the `destination` in `client/vercel.json` at your HTTPS domain.

For S3, use a dedicated IAM user that can only upload to and delete from the one bucket.

The Render service can take up to a minute to wake up after a period of inactivity, so the first request after a pause may be slow.

## 🛡️ Security

- Passwords are hashed with bcrypt and are never returned by the API
- Login tokens are JWTs that expire after 7 days
- Every protected route verifies the token, and edit or delete routes also check ownership on the server
- Booking prices are calculated on the server, so the client cannot set its own price
- The public property and review endpoints return only the host's or reviewer's username and photo, never their email
- Uploads accept images only, with a 5 MB limit per file
- Search input is escaped before it is used as a regular expression
- Email addresses are trimmed and lowercased on registration and login

## ⏳ Known limitations

- Overlapping bookings are checked by the API before saving, not by a database constraint, so two simultaneous requests for the same dates could both succeed.
- Reviews are not limited to guests with a completed stay.
- Payments are a demo: no payment provider is connected, and refunds are only messages.

## 📈 Future improvements

- [ ] Map integration (Google Maps or Mapbox) for property locations
- [ ] Real-time chat between guests and hosts
- [ ] Email confirmations for bookings
- [ ] A real payment gateway (Stripe or Razorpay) in place of the demo payment
- [ ] Reviews only after a completed stay
- [ ] Database-level protection against double bookings
- [ ] Block dates that are already booked in the date picker
- [ ] Automatic photo resizing before upload
- [ ] Real-time notifications with WebSockets
- [ ] Automated unit and integration tests in the repository
- [ ] Refresh-token rotation for longer, safer sessions

---

*Built with ❤️ React · Redux · Node.js · Express · MongoDB · AWS (EC2, S3, IAM) · Cloudinary · PM2 · Nginx · Jenkins*


