# MomentStay — Airbnb-Inspired Vacation Booking Platform

> An online marketplace that connects travelers with people who want to share their unique stays — where travelers discover and book unique stays or list their own. Everything in one account.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | [momentstay-vacation-booking-system.vercel.app](https://momentstay-vacation-booking-system.vercel.app/) |
| Backend API | AWS EC2 (Node.js + Express + PM2 + Nginx) |
| Image Storage | AWS S3 |
| Database | MongoDB Atlas |

---

## 📌 About MomentStay

MomentStay is a full-stack vacation rental marketplace — inspired by how Airbnb connects travelers with people who want to share their spaces.

Just like Airbnb, MomentStay works in two ways:

- **As a Traveler** — Search stays by destination or category, pick your dates on an interactive calendar, and book instantly. Leave ratings and reviews after your stay to help future travelers.
- **As a Stay Owner** — Anyone can add their own stay for free. Set your nightly rate, amenities, availability, and upload photos. 

The key difference from Airbnb: **MomentStay uses a single account for both**. The same credentials let you book a stay and add your own — no role switching, no separate accounts needed.

---

## 🚀 Features

### For Travelers — Search & Book
- Browse stays across 16+ unique categories (Beachfront, Luxury, Treehouse, Lakefront, Arctic, Desert, Camping, Boat House, and more)
- Full-text and category-based search powered by MongoDB regex queries
- Interactive date range calendar for real-time availability checking
- Book stays with date selection and automatic total price calculation
- Update or cancel existing bookings anytime
- Save your favorite stays to a personal wishlist, synced across sessions with Redux Persist
- Submit ratings and reviews after your stay to help the community
- View your complete booking history (trip list)

### For Stay Owners — Add & Manage
- Any user can add their own stay — no separate account needed
- Set stay type, nightly price, amenities, category, and guest/bedroom/bed/bathroom counts with multi-photo upload directly to AWS S3
- Edit your stay — add new extra details and photos or modify existing ones.
- Delete your stay anytime
- View all reservations made on your stays

### Authentication & Trust
- Register with a profile photo upload to AWS S3
- JWT-based authentication with `bcryptjs` password hashing

### General
- Fully responsive design — mobile and desktop
- Toast notifications for bookings, wishlist actions, and authentication feedback

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | UI framework |
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
| AWS SDK | S3 integration & `DeleteObjectCommand` |

### DevOps & Cloud
| Technology | Purpose |
|------------|---------|
| AWS EC2 | Backend server hosting |
| AWS S3 | Stay & profile photo storage |
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

## 🔐 Security

- JWT tokens for all authenticated routes
- Bcrypt password hashing (salted)
- AWS IAM user with minimum required S3 permissions
- Environment variables never committed to GitHub
- EC2 Security Group — only required ports open

---

## 🔮 Future Improvements

- [ ] Map integration (Google Maps / Mapbox) for stay location
- [ ] Real-time chat between travelers and stay owners
- [ ] Email notifications for booking confirmations
- [ ] Advanced filters (price range, amenities, guest count)
- [ ] Payment gateway integration (Stripe / Razorpay)
- [ ] AI-based stay recommendations

---

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub — it motivates me to keep building!

---

*Built with ❤️ using React · Node.js · Express · MongoDB · AWS*
