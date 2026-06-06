# MomentStay — Airbnb-Inspired Vacation Booking Platform

MomentStay is a production-deployed, full-stack web application for booking short and long-term homestays. Every registered user gets a **single account** that works for both guest and host actions — the same credentials let you browse and book properties, and also list and manage your own properties. No role switching or separate accounts needed.

Users can browse 16+ property categories, use an interactive calendar to check availability, book stays, and leave reviews. The same user can also create listings, upload property photos to AWS S3, set pricing, and track reservations on their properties.

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
- Browse and search properties by 16+ categories (Beachfront, Luxury, Treehouse, Lakefront, Arctic, Desert, Camping, Boat House, and more)
- Full-text and category-based search with MongoDB regex queries
- Interactive date range calendar for real-time booking availability
- Book properties with date selection and automatic total price calculation
- Update or cancel bookings
- Add properties to a personal wishlist (Redux-persisted)
- Leave ratings and reviews on stays
- View full booking history (trip list)

### Property Management (same user account)
- Any user can also list their own property — no separate host account needed
- Create listings with multi-photo upload directly to AWS S3
- Edit existing properties — add new photos, remove old ones (auto-deleted from S3 via `DeleteObjectCommand`)
- Delete properties with automatic S3 cleanup of all associated images
- Set property type, price, amenities, category, guest/bedroom/bed/bathroom counts
- View all reservations made on your listed properties

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

## 📸 Property Categories

MomentStay supports 16+ property categories:

`All` `Luxury` `Arctic` `Beachfront` `Windmills` `Yurt` `Lakefront` `Bubble Tent` `Amazing Pools` `Boat House` `Camping` `OW Bungalow` `Desert` `Light House` `Barns` `Treehouse`

---

## 🔮 Future Improvements

- [ ] Map integration (Google Maps / Mapbox) for property location
- [ ] Email notifications for booking confirmations
- [ ] Advanced filters (price range, amenities, guest count)
- [ ] Payment gateway integration (Stripe / Razorpay)
- [ ] AI-based property recommendations

---

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub — it motivates me to keep building!

---

*Built with ❤️ using React · Node.js · Express · MongoDB · AWS*
