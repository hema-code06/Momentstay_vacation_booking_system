# MomentStay — Airbnb-Inspired Vacation Booking Platform

> MomentStay is a full-stack web application for booking unique short-term stays. Every registered user gets a **single account** that works for both guest and host actions — the same credentials let you browse and book stays, and also add and manage your own stays. No role switching or separate accounts needed.

> Users can explore 16+ stay categories, use an interactive calendar to check availability, book stays, and leave ratings and reviews. The same user can also add their own stay, upload photos with details, set pricing, and track reservations.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | [momentstay-vacation-booking-system.vercel.app](https://momentstay-vacation-booking-system.vercel.app/) |
| Backend API | AWS EC2 (Node.js + Express + PM2 + Nginx) |
| Image Storage | AWS S3 |
| Database | MongoDB Atlas |

---

## 🚀 Features

### Booking & Search (any logged-in user)
- Browse and search stays by 16+ categories (Beachfront, Luxury, Treehouse, Lakefront, Arctic, Desert, Camping, Boat House, and more)
- Full-text and category-based search with MongoDB regex queries
- Interactive date range calendar for real-time booking availability
- Book stays with date selection and automatic total price calculation
- Update or cancel bookings
- Save your favorite stays to a personal wishlist (Redux-persisted)
- Leave ratings and reviews on stays
- View full booking history (trip list)

### Add & Manage Your Stay (same account)
- Any user can also add their own property — no separate host account needed
- Add your stay with multi-photo upload directly to AWS S3
- Edit existing stays — add new photos, remove old ones (auto-deleted from S3 via `DeleteObjectCommand`)
- Delete stays with automatic S3 cleanup of all associated images
- Set stay type, price, amenities, category, guest/bedroom/bed/bathroom counts
- View all reservations made on your added stays

### Authentication
- Register with profile image upload to AWS S3
- JWT-based authentication with `bcryptjs` password hashing
- Persisted login state using Redux Persist
- Protected routes for all user-specific pages

### General Features
- Response compression for faster API delivery
- Request logging middleware (method, URL, response time)
- Global error handling middleware
- Fully responsive design — mobile and desktop
- Toast notifications for bookings, wishlist actions, and authentication feedback

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | UI framework |
| Redux Toolkit + Redux Persist | Global state management & persistence |
| React Router DOM v6 | Client-side routing |
| Sass (SCSS) | Custom styling |
| Material UI v6 | UI components |
| React Date Range | Interactive booking calendar |
| React Icons | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (`jsonwebtoken`) | Authentication tokens |
| Bcryptjs | Password hashing |
| Multer + Multer-S3 | Multipart file upload to AWS S3 |
| AWS SDK v3 (`@aws-sdk/client-s3`) | S3 integration & `DeleteObjectCommand` |

### DevOps & Cloud
| Technology | Purpose |
|------------|---------|
| AWS EC2 | Backend server hosting |
| AWS S3 | Image storage and delivery |
| AWS IAM | Least-privilege access control |
| PM2 | Node.js process management & auto-restart |
| Nginx | Reverse proxy server |
| Vercel | Frontend deployment |
| MongoDB Atlas | Cloud database |

---

## 🔧 Local Setup

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- AWS account (S3 bucket + IAM user)

### 1. Clone the Repository
```bash
git clone https://github.com/hema-code06/Momentstay_vacation_booking_system.git
cd Momentstay_vacation_booking_system
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd client
npm install
```

### 4. Environment Setup

**Backend — `server/.env`:**
**Frontend — `client/.env`:**

### 5. Run the Application
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm start
```

Open: [http://localhost:3000](http://localhost:3000)

---

## 📸 Stay Categories

MomentStay supports 16+ stay categories:

`All` `Luxury` `Arctic` `Beachfront` `Windmills` `Yurt` `Lakefront` `Bubble Tent` `Amazing Pools` `Boat House` `Camping` `OW Bungalow` `Desert` `Light House` `Barns` `Treehouse`

---

## 🔮 Future Improvements

- [ ] Map integration (Google Maps / Mapbox) for stay location
- [ ] Email notifications for booking confirmations
- [ ] Advanced filters (price range, amenities, guest count)
- [ ] Payment gateway integration (Stripe / Razorpay)
- [ ] AI-based stay recommendations

---

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub — it motivates me to keep building!

---

*Built with ❤️ using React · Node.js · Express · MongoDB · AWS*
