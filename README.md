# 🏡 MomentStay — Vacation Booking Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://momentstay-vacation-booking-system.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-AWS%20EC2-orange)](https://aws.amazon.com/ec2/)

**MomentStay** is a full-stack platform for **booking and hosting rental homes**, offering secure property management, interactive reservations, and user reviews. Guests can easily find and book stays, while hosts manage listings with photos, categories, and real-time updates.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | (https://momentstay-vacation-booking-system.vercel.app/) |
| Backend API | AWS EC2 (Node.js + Express + PM2 + Nginx) |
| Image Storage | AWS S3  |
| Database | MongoDB Atlas |

---

## 📌 Project Overview

- Built a full-stack web application for **booking short and long-term homestays** with **advanced search, filters, and interactive calendar functionality**.
- Developed **host-side features** including secure authentication, property management (add, edit, update), image uploads via **AWS S3**, and Redux-Mongoose integration.
- Integrated **user ratings and feedback** to improve user experience and maintain **real-time, dynamic property listings**.
- **Deployed backend on AWS EC2** with Nginx as a reverse proxy and PM2 for process management, ensuring 24/7 uptime.
- **Stored and served all property and profile images via AWS S3** with IAM-based access control and public bucket policy.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Redux | State management |
| Sass (SCSS) | Styling |
| Material UI | Component library |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB + Mongoose | Database |
| JWT + Bcrypt | Authentication & security |
| Multer + Multer-S3 | File upload to AWS S3 |
| AWS SDK v3 | S3 integration |

### DevOps & Cloud
| Technology | Purpose |
|---|---|
| AWS EC2 (t3.micro) | Backend server hosting |
| AWS S3 | Image storage and delivery |
| AWS IAM | Access control and security |
| PM2 | Node.js process management |
| Nginx | Reverse proxy server |
| Vercel | Frontend deployment |
| MongoDB Atlas | Cloud database |

---

## 🚀 Features

### Guest Features
- Browse and search rental homes by location, category, price, and amenities.
- Use **interactive calendar** for booking availability.
- Leave ratings and reviews for stays.
- Manage personal bookings and view booking history.
- Add properties to wishlist.

### Host Features
- Add, edit, and manage property listings with photos uploaded to **AWS S3**.
- Set property pricing, availability, and categories.
- Manage guest feedback and monitor property performance.
- Role-based dashboard for property and booking management.

### General Features
- Secure user authentication with **JWT and Bcrypt**.
- Profile image upload stored in **AWS S3**.
- Real-time updates for bookings and property listings.
- Fully responsive design for mobile and desktop devices.

---

### What was implemented:
- **EC2 Instance**
- **S3 Bucket**
- **IAM User** 
- **Multer-S3**
- **DeleteObjectCommand** 
- **PM2 auto-startup**
- **Nginx reverse proxy**
- **Vercel rewrites**

---

## 🔧 Local Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/hema-code06/Momentstay_vacation_booking_system.git
cd Momentstay_vacation_booking_system
```

### 2️⃣ Install Client Dependencies
```bash
cd client
npm install
```

### 3️⃣ Install Server Dependencies
```bash
cd server
npm install
```

### 4️⃣ Environment Setup

**Backend — `server/.env`:**

**Frontend — `client/.env`:**

### 5️⃣ Run the Application

```bash
# Terminal 1 — Backend
cd server
node index.js
```

```bash
# Terminal 2 — Frontend
cd client
npm start
```

Open the app: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security

- JWT tokens for authenticated routes
- Bcrypt password hashing
- AWS IAM user with minimum required S3 permissions
- Environment variables never committed to GitHub
- EC2 Security Group — only required ports configured

---
