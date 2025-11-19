# 🚗 TravelEase Server

This is the **backend server** for the **TravelEase** vehicle rental and sharing platform.  
It provides secure APIs for managing vehicles, handling bookings, verifying users with Firebase Authentication, and interacting with MongoDB.

---

## 🛠️ Technologies Used

- **Node.js** + **Express.js** — Backend framework  
- **MongoDB** — Database for vehicles & bookings  
- **Firebase Admin SDK** — Secure token verification  
- **dotenv** — Environment variable management  
- **CORS** — Cross-origin resource sharing  
- **ObjectId (MongoDB)** — Resource validation  

---

## 🔐 Authentication & Security

This server uses:

- **Firebase ID Token Verification** (`verifyFirebaseToken` middleware)  
- **Owner Authorization Middleware** (`verifyOwner`)  
- Prevents unauthorized access to sensitive routes such as:
  - Viewing protected vehicle details  
  - Managing bookings  
  - Adding, updating, or deleting resources  

---

## 📁 API Endpoints Overview

### 🚘 Cars (Vehicles)
| Method | Route | Description |
|--------|--------|-------------|
| GET | `/cars` | Get all vehicles |
| GET | `/latestVehicle` | Get latest 6 vehicles |
| GET | `/viewDetails/:id` | Get vehicle details (protected) |
| POST | `/cars` | Add a new vehicle (protected) |
| PUT | `/cars/:id` | Update a vehicle (protected + owner only) |
| DELETE | `/cars/:id` | Delete a vehicle (protected) |
| GET | `/updateVehicle/:id` | Get vehicle for editing (protected) |

---

### 📅 Bookings
| Method | Route | Description |
|--------|--------|-------------|
| POST | `/bookings` | Book a vehicle (protected) |
| GET | `/bookings` | Get all bookings (protected) |
| GET | `/my-bookings/:email` | Get bookings for a user (protected + same user) |
| DELETE | `/bookings/:id` | Cancel booking (protected) |

---

### 👤 User-Specific Data
| Method | Route | Description |
|--------|--------|-------------|
| GET | `/my-vehicle/:email` | Get vehicles listed by the logged-in user |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DB_USER=yourMongoUser
DB_PASS=yourMongoPassword

# Base64-encoded Firebase private key
FIREBASE_SERVICE_KEY=your_base64_encoded_service_key

```

## Installation

1️⃣ Clone the repository
```
git clone https://github.com/yourusername/travelease-server.git
cd travelease-server
```
2️⃣ Install all dependencies
```
npm install
```
3️⃣ Create a .env file

Add all required environment variables:

```
PORT=5000
DB_USER=yourMongoUser
DB_PASS=yourMongoPassword
FIREBASE_SERVICE_KEY=your_base64_encoded_service_key
```

4️⃣ Start the local development server
```
npm start
```

If you're using nodemon:
```
npm run dev
```

5️⃣ Verify the server is running

Open your browser and navigate to:
```
http://localhost:5000/
```

You should see:
```
Server is running
```

