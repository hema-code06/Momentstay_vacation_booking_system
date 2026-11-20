# 🏡 MomentStay

🌐 **Live App:** [momentstay-vacation-booking-system.vercel.app](https://momentstay-vacation-booking-system.vercel.app/)

**An Airbnb-inspired vacation rental marketplace — book a stay, host your own property, all under one account.**

MomentStay lets any user switch seamlessly between two roles without switching accounts: **traveler**, searching and booking unique stays, and **host**, listing and managing their own space. No separate sign-up flow, no role selection screen — just one identity that can do both.

---

## 🚀 Features

### For Travelers — Search & Book
- Browse stays across 15 categories — Beachfront, Luxury, Treehouse, Lakefront, Arctic, Desert, Camping, Boat House, and more
- Full-text search by **title, category, city, province, or country** — with regex-safe input handling
- Curated "Best Picks" category shortcuts on the home page
- Date-range calendar with instant price calculation; overlapping bookings are rejected server-side
- Instant booking — total price is computed server-side (nights × listing rate); the client cannot override it
- Update or cancel a booking anytime
- Save stays to a personal wishlist (toggle add/remove)
- Leave a star rating and written review — allowed only after a **completed stay** (checkout date in the past), one review per listing per user
- View complete booking history (Trip Journal) in one place
- Past Experiences gallery with guest testimonials and photo galleries

### For Hosts — List & Manage
- List a stay for free — no separate host account required
- Set category, type, nightly price, amenities, and guest/bedroom/bed/bathroom counts
- Upload multiple photos directly to AWS S3 (images only, 10 MB limit per file)
- Edit listing details or swap/add/remove photos anytime; removed photos are deleted from S3 automatically
- Delete a listing anytime — all S3 photos are cleaned up on deletion
- View every reservation made on your listings
- Hosts cannot book their own property

### Security
- JWT-based authentication (7-day expiry) on every protected route
- Server-side ownership checks — only a listing's creator or a booking's customer/host can edit or cancel it (reviews have no edit/delete route)
- Booking price is calculated server-side from the listing's nightly rate and stay length — the client cannot set its own price
- Booking guest/host and listing owner are taken from the JWT, never from the request body
- Overlapping bookings on the same listing are rejected at the database level
- Email is lowercased and trimmed at registration and login — case-insensitive login is handled automatically
- Bcrypt password hashing; password is never returned in any API response
- S3 uploads validated for image MIME type and size (max 10 MB per file)
- AWS IAM user scoped to least-privilege S3 access
- EC2 security group restricted to required ports only (SSH, HTTP, HTTPS)
- HTTPS enforced end-to-end via an Nginx reverse proxy with a free Let's Encrypt SSL certificate

### General
- Fully responsive — built for both mobile and desktop
- SPA routing — all Vercel routes fall back to `index.html` so direct links and browser refresh always work
- Toast notifications for bookings, wishlist actions, and authentication feedback
- Unauthenticated visitors are redirected to `/login` when accessing any protected page

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Redux Toolkit + Redux Persist | Global state management & persistence across refreshes |
| React Router DOM v6 | Client-side routing |
| Sass (SCSS) | Custom styling |
| Material UI v6 | UI components |
| React Date Range | Interactive booking calendar |
| React Icons | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| Bcryptjs | Password hashing |
| Multer + Multer-S3 | Multipart image upload to AWS S3 (10 MB limit, images only) |
| AWS SDK v3 (`@aws-sdk/client-s3`) | S3 object management (upload, delete) |
| compression | Gzip response compression |
| dotenv | Environment variable loading |

### DevOps & Cloud
| Technology | Purpose |
|---|---|
| AWS EC2 | Backend server hosting |
| AWS S3 | Stay & profile photo storage |
| AWS IAM | Least-privilege access control |
| PM2 | Node.js process management, crash recovery & auto-restart on reboot |
| Nginx | Reverse proxy in front of the Node app, terminating HTTPS |
| Let's Encrypt (Certbot) | Free SSL certificate for the backend domain |
| Vercel | Frontend deployment, with `/api` rewrite proxying to EC2 and SPA fallback |
| MongoDB Atlas | Cloud database (dbName: `MomentStay`) |
| Insomnia | API testing & endpoint verification |

---

## 🗺️ REST API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register a new user (multipart: `username`, `email`, `password`, `profileImage`) |
| `POST` | `/api/auth/login` | — | Login and receive JWT + user object |

### Properties
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/properties` | — | Get all listings (optional `?category=` filter) |
| `GET` | `/api/properties/search/:search` | — | Search listings by title, category, city, province, or country (`all` returns every listing) |
| `GET` | `/api/properties/:listingId` | — | Get a single listing by ID |
| `POST` | `/api/properties/create` | ✅ | Create a new listing (multipart: fields + `listingPhotos[]`) |
| `PUT` | `/api/properties/:listingId` | ✅ (owner only) | Update listing — fields, existing photo URLs, and/or new photos |
| `DELETE` | `/api/properties/:listingId` | ✅ (owner only) | Delete listing and its S3 photos |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings/create` | ✅ | Create a booking (`listingId`, `startDate`, `endDate`); price computed server-side |
| `GET` | `/api/bookings/:id` | ✅ (customer or host) | Get a single booking |
| `PUT` | `/api/bookings/update/:id` | ✅ (customer or host) | Reschedule a booking with new dates |
| `DELETE` | `/api/bookings/delete/:id` | ✅ (customer or host) | Cancel and remove a booking |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/:userId/trips` | ✅ (self only) | Get all bookings made by the user (Trip Journal) |
| `GET` | `/api/users/:userId/properties` | ✅ (self only) | Get all listings created by the user |
| `GET` | `/api/users/:userId/reservations` | ✅ (self only) | Get all bookings where user is host or customer |
| `PATCH` | `/api/users/:userId/:listingId` | ✅ (self only) | Toggle a listing in/out of the user's wishlist |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reviews/create` | ✅ | Submit a review (`listingId`, `rating` 1–5, `comment`); requires a completed stay |
| `GET` | `/api/reviews/listing/:listingId` | — | Get all reviews for a listing, plus average rating and total count |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Health check — returns `{ status: "success", message: "Server is running 🚀" }` |

---

## 🧭 System Architecture

MomentStay follows a standard three-tier architecture, with image storage offloaded to S3 to keep the API stateless and the database lightweight.

```
┌─────────────────────┐        HTTPS / REST         ┌──────────────────────────────┐
│                      │ ───────────────────────────▶│  Nginx (reverse proxy, SSL)   │
│   React Client       │                              │            │                  │
│   (Vercel)            │◀─────────────────────────── │            ▼                  │
│                      │        JSON responses        │  Express API (PM2, port 3001) │
└──────────┬───────────┘                              │      (AWS EC2)                │
           │                                           └─────────────┬────────────────┘
           │ Redux Persist                                           │
           │ (client-side cache)                                     │ Mongoose
           ▼                                                         ▼
   ┌───────────────┐                                         ┌───────────────────┐
   │  Browser       │                                         │  MongoDB Atlas      │
   │  localStorage  │                                         │  (Users, Listings,  │
   └───────────────┘                                         │   Bookings, Reviews) │
                                                                └───────────────────┘
                                                                         ▲
                                                                         │
                                                                ┌───────────────────┐
                                                                │  AWS S3              │
                                                                │  (listing & profile  │
                                                                │   photos)             │
                                                                └───────────────────┘
```

**Request flow, end to end:**
1. The client sends a request to `/api/...` on Vercel; Vercel's `vercel.json` rewrite forwards it over HTTPS to the EC2 backend. All other routes fall back to `index.html` so the React SPA handles them.
2. Nginx on EC2 terminates SSL and reverse-proxies the request to the Express app running on `localhost:3001`, managed by PM2.
3. Auth middleware verifies the JWT (from the `Authorization` header) before the route handler runs; requests without a valid token are rejected before touching the database.
4. For write actions on a listing or booking, the API checks that the token's user actually owns the resource being modified — not just that they're logged in. Creating a review additionally requires proof of a completed stay, and a user may leave only one review per listing.
5. Booking creation and updates recompute the total price server-side from the listing's stored nightly rate and the requested stay length, and reject date ranges that overlap an existing booking on the same listing.
6. Photo uploads go straight from the client, through Multer-S3 on the server, into an S3 bucket; MongoDB stores only the resulting URLs, never the image data itself. Deleted or replaced photos are removed from S3 using `Promise.allSettled` so a stale S3 file never blocks a database write.
7. The client caches the logged-in user and their token via Redux Persist, so a page refresh doesn't require logging in again.
8. PM2 keeps the Node process alive and automatically restarts it on crash or server reboot, so the API stays available 24/7.

### How authentication works
- On login, the server issues a JWT (7-day expiry) signed with a server-side secret — the client never sees or stores the secret itself.
- Every state-changing request (creating a listing, booking a stay, editing a wishlist, submitting a review, etc.) requires that token in an `Authorization: Bearer <token>` header.
- Ownership is enforced server-side on every edit/delete route — a user can only modify listings and bookings that belong to them, regardless of what the client sends.
- The booking's guest and host, and a listing's owner, are always derived from the authenticated user's token, not from client-supplied fields.
- Emails are normalised to lowercase on register and login — `User@example.com` and `user@example.com` resolve to the same account.
- Passwords are hashed with bcrypt before storage; the hash is never included in any API response, including the user's own.

---

## 🔧 Local Setup

### Prerequisites
- Node.js ≥ 18 & npm
- MongoDB Atlas account (or local MongoDB)
- AWS account with an S3 bucket and IAM credentials

### 1. Clone the repository
```bash
git clone https://github.com/hema-code06/Momentstay_vacation_booking_system.git
cd Momentstay_vacation_booking_system
```

### 2. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Environment setup

Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**
```env
PORT=3001
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_s3_bucket_name
```

**`client/.env`** — for local development, point directly at the running server:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

> **Note:** In production on Vercel, `REACT_APP_API_URL=/api` works because `vercel.json` proxies `/api/*` to the EC2 backend. For local development without a proxy, set it to the full server URL above.

### 4. Run the application locally
```bash
# Terminal 1 — Backend
cd server
npm run dev        # uses nodemon for auto-reload

# Terminal 2 — Frontend
cd client
npm start
```

Open **http://localhost:3000**

---

## ☁️ Production Deployment

### Backend (AWS EC2)
1. SSH into the EC2 instance and pull the latest code (`git pull`).
2. Install dependencies (`cd server && npm install`).
3. Create `server/.env` with your production values.
4. Start the app under **PM2** so it stays alive and restarts on crash or reboot:
   ```bash
   cd server
   pm2 start index.js --name momentstay
   pm2 save
   pm2 startup
   ```
5. Install **Nginx** and configure it as a reverse proxy forwarding requests to `localhost:3001`.
6. Use **Certbot** to issue a free Let's Encrypt SSL certificate for the backend's domain, so the API is served over HTTPS.
7. Open ports 80 and 443 in the EC2 security group.

### Frontend (Vercel)
The React app is deployed on Vercel. `client/vercel.json` does two things:
- Proxies all `/api/*` requests to the EC2 backend
- Falls back every other route to `index.html` so direct links and browser refreshes work correctly

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<your-ec2-domain>/api/:path*" },
    { "source": "/(.*)",       "destination": "/index.html" }
  ]
}
```

Set the following environment variable in your Vercel project settings:

```
REACT_APP_API_URL=/api
```

---

## 🔮 Future Improvements

- [ ] Map integration (Google Maps / Mapbox) for stay locations
- [ ] Real-time chat between travelers and hosts
- [ ] Email notifications for booking confirmations
- [ ] Payment gateway integration (Stripe / Razorpay)
- [ ] AI-based stay recommendations
- [ ] Refresh-token rotation for longer, safer sessions
- [ ] Edit/delete support for submitted reviews

---

*Built with ❤️ using React · Node.js · Express · MongoDB · AWS (EC2, S3, IAM) · PM2 · Nginx · Vercel*

