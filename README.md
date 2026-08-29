# 🏡 MomentStay

**An Airbnb-inspired vacation rental marketplace — book a stay, host your own property, all under one account.**

MomentStay lets any user switch seamlessly between two roles without switching accounts: **traveler**, searching and booking unique stays, and **host**, listing and managing their own space. No separate sign-up flow, no role selection screen — just one identity that can do both.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | [momentstay-vacation-booking-system.vercel.app](https://momentstay-vacation-booking-system.vercel.app) |
| **Backend API** | AWS EC2 (Node.js + Express, via PM2 + Nginx) |
| **Image Storage** | AWS S3 |
| **Database** | MongoDB Atlas |

---

## 🚀 Features

### For Travelers — Search & Book
- Browse stays across 16+ categories — Beachfront, Luxury, Treehouse, Lakefront, Arctic, Desert, Camping, Boat House, and more
- Category-based search
- Interactive date-range calendar for availability and pricing
- Instant booking with automatic total-price calculation
- Update or cancel a booking anytime
- Save stays to a personal wishlist
- Leave a rating and review after a stay
- View complete booking history in one place

### For Hosts — List & Manage
- List a stay for free — no separate host account required
- Set category, type, nightly price, amenities, and guest/bedroom/bed/bathroom counts
- Upload multiple photos directly to AWS S3
- Edit listing details or photos anytime
- Delete a listing anytime
- View every reservation made on your listings

### Security
- JWT-based authentication on every protected route
- Server-side ownership checks — only a listing's host or a booking's guest can edit or cancel it
- Bcrypt password hashing
- AWS IAM user scoped to least-privilege S3 access
- EC2 security group restricted to required ports only

### General
- Fully responsive — built for both mobile and desktop
- Toast notifications for bookings, wishlist actions, and authentication feedback

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Redux Toolkit + Redux Persist | Global state management & persistence |
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
| Multer + Multer-S3 | Multipart file upload to AWS S3 |
| AWS SDK | S3 integration |

### DevOps & Cloud
| Technology | Purpose |
|---|---|
| AWS EC2 | Backend server hosting |
| AWS S3 | Stay & profile photo storage |
| AWS IAM | Least-privilege access control |
| PM2 | Node.js process management & auto-restart |
| Nginx | Reverse proxy |
| Vercel | Frontend deployment |
| MongoDB Atlas | Cloud database |
| Insomnia | API testing & endpoint verification |

---


## 🧭 System Architecture

MomentStay follows a standard three-tier architecture, with image storage offloaded to S3 to keep the API stateless and the database lightweight.

```
┌─────────────────────┐        HTTPS / REST         ┌──────────────────────┐
│                      │ ───────────────────────────▶│                      │
│   React Client       │                              │   Express API         │
│   (Vercel)            │◀─────────────────────────── │   (AWS EC2 + PM2)      │
│                      │        JSON responses        │                      │
└──────────┬───────────┘                              └─────────┬────────────┘
           │                                                     │
           │ Redux Persist                                       │ Mongoose
           │ (client-side cache)                                 │
           ▼                                                     ▼
   ┌───────────────┐                                     ┌───────────────────┐
   │  Browser       │                                     │  MongoDB Atlas      │
   │  localStorage  │                                     │  (Users, Listings,  │
   └───────────────┘                                     │   Bookings)          │
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
1. The client sends a request to the Express API, attaching a JWT in the `Authorization` header for any action that requires login.
2. Auth middleware verifies the token before the route handler runs; requests without a valid token are rejected before touching the database.
3. For write actions on a listing or booking, the API checks that the token's user actually owns the resource being modified — not just that they're logged in.
4. Photo uploads go straight from the client, through Multer-S3 on the server, into an S3 bucket; MongoDB stores only the resulting URLs, never the image data itself.
5. The client caches the logged-in user and their token via Redux Persist, so a page refresh doesn't require logging in again.

### How authentication works
- On login, the server issues a JWT (7-day expiry) signed with a server-side secret — the client never sees or stores the secret itself.
- Every state-changing request (creating a listing, booking a stay, editing a wishlist, etc.) requires that token in an `Authorization: Bearer <token>` header.
- Ownership is enforced server-side on every edit/delete route — a user can only modify listings and bookings that belong to them, regardless of what the client sends.
- Passwords are hashed with bcrypt before storage; the hash is never included in any API response, including the user's own.

---

## 🔧 Local Setup

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- AWS account (S3 bucket + IAM user)

### 1. Clone the repository
```bash
git clone https://github.com/hema-code06/Momentstay_vacation_booking_system.git
cd Momentstay_vacation_booking_system
```

### 2. Install server dependencies
```bash
cd server
npm install
```

### 3. Install client dependencies
```bash
cd client
npm install
```

### 4. Environment setup

**`server/.env`**
```
MONGO_URL=
JWT_SECRET=
PORT=3001
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
```

**`client/.env`**
```
REACT_APP_API_URL=
```

### 5. Run the application
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm start
```

Open **http://localhost:3000**

---

## 🔮 Future Improvements

- [ ] Map integration (Google Maps / Mapbox) for stay locations
- [ ] Real-time chat between travelers and hosts
- [ ] Email notifications for booking confirmations
- [ ] Advanced filters (price range, amenities, guest count)
- [ ] Payment gateway integration (Stripe / Razorpay)
- [ ] AI-based stay recommendations
- [ ] Refresh-token rotation for longer, safer sessions

---

Built with ❤️ using React · Node.js · Express · MongoDB · AWS (EC2, S3, IAM)
