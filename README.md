# 🛠️ Foodies — Admin Panel

A professional **Admin Dashboard** for managing the Foodies food delivery platform.  
Built with **React + Vite**, featuring real-time analytics, user management, food management, and order tracking.

---

## 📸 Screenshots

> Add your screenshots here after deployment

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.2.4 | Build Tool |
| React Router DOM | 6.30.2 | Client-side Routing |
| Axios | 1.13.2 | HTTP API Calls |
| Bootstrap | 5.3.8 | Styling & Layout |
| Bootstrap Icons | 1.13.1 | Icons |
| React Toastify | 11.0.5 | Toast Notifications |
| Recharts | 2.12.7 | Charts & Analytics |
| Context API | built-in | State Management |

---

## 📁 Folder Structure

```
adminpanel/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   ├── addimage.png
│   │   └── parsel.png
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx        # Collapsible left navigation
│   │   │   └── Sidebar.css
│   │   └── manubar/
│   │       └── Menubar.jsx        # Top bar with admin name & logout
│   ├── pages/
│   │   ├── Login/
│   │   │   └── AdminLogin.jsx     # Secure admin login page
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx      # Analytics, charts, stats
│   │   │   └── Dashboard.css
│   │   ├── AddFood/
│   │   │   ├── AddFood.jsx        # Add new food item
│   │   │   └── AddFood.css
│   │   ├── ListFood/
│   │   │   ├── ListFood.jsx       # View, search, delete foods
│   │   │   └── ListFood.css
│   │   ├── Order/
│   │   │   ├── Orders.jsx         # Manage all orders
│   │   │   └── Orders.css
│   │   └── Users/
│   │       ├── Users.jsx          # User management
│   │       └── Users.css
│   ├── services/
│   │   └── adminApi.js            # All API calls with auth headers
│   ├── util/
│   │   └── constants.js           # API base URL from env
│   ├── App.jsx                    # Protected routes + auth guard
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env                           # Environment variables (not committed)
├── index.html
├── package.json
├── vercel.json                    # Vercel SPA routing config
└── vite.config.js
```

---

## ✨ Features

### 🔐 Authentication
- Secure admin login with JWT
- Role-based access — only `ADMIN` role can access
- Auto-redirect to login if not authenticated
- Logout with token cleanup

### 📊 Dashboard Analytics
- **Stat Cards** — Total Revenue, Total Orders, Users, Food Items
- **Revenue Chart** — Area chart for last 15 days
- **Orders Chart** — Bar chart for last 15 days
- **Order Status Pie** — Dynamic pie chart from real data
- **Top Selling Foods** — Table with qty and revenue
- **Top Customers** — Most active customers
- **Recent Orders** — Last 10 orders

### 🍕 Food Management
- Add new food with image upload
- View all food items with search
- Delete food items
- Category management

### 📦 Order Management
- View all orders from all users
- Filter by status and payment
- Update order status (Preparing → Confirmed → Out for Delivery → Delivered)
- View full order details in modal
- Pagination

### 👥 User Management
- View all registered users
- Search and filter users
- View full user profile with login history
- Edit user details (name, email, phone, address)
- Block / Unblock users
- Reset user password
- Delete users

---

## ⚙️ Environment Variables

Create a `.env` file in the `adminpanel/` folder:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> ⚠️ Never commit `.env` to Git. Add it to `.gitignore`.

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend REST API base URL |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Backend running on port 8080
- An admin user in the database

### Steps

```bash
# 1. Navigate to adminpanel folder
cd adminpanel

# 2. Install dependencies
npm install

# 3. Create environment file
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env

# 4. Start development server
npm run dev -- --port 5174
```

App runs at **http://localhost:5174**

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5174) |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔑 First-Time Admin Setup

After starting the backend for the first time, an admin account is **automatically created** on startup.

Check the backend console for the admin credentials printed on first run.

---

## 🌐 API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Admin login → JWT token |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/foods` | Get all food items |
| POST | `/api/foods` | Add food (multipart) |
| DELETE | `/api/foods/:id` | Delete food |
| GET | `/api/orders/all` | Get all orders |
| PATCH | `/api/orders/status/:id` | Update order status |
| GET | `/api/users` | Get all users |
| GET | `/api/users/search?q=` | Search users |
| PUT | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/block` | Block user |
| PATCH | `/api/users/:id/unblock` | Unblock user |
| PATCH | `/api/users/:id/reset-password` | Reset password |
| DELETE | `/api/users/:id` | Delete user |

---

## 📊 Dashboard Charts

Charts are built with **Recharts** and use an `AutoChart` wrapper that measures real DOM width before rendering — ensuring charts display correctly in any layout.

Data is computed **client-side** from the orders API:
- Revenue and order counts grouped by day (last 15 days)
- Order status distribution from actual `orderStatus` field values
- Top foods ranked by quantity sold
- Top customers ranked by total spend

---

## 🚢 Deployment (Vercel)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "food delivery admin panel"
git remote add origin https://github.com/YOUR_USERNAME/fooddelivery-admin.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Step 3 — Add Environment Variables in Vercel
```
VITE_API_BASE_URL = https://your-backend.onrender.com/api
```

### Step 4 — Deploy ✅

The `vercel.json` handles SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🔗 Related Projects

| Project | Description |
|---------|-------------|
| Backend | Spring Boot REST API |
| Frontend | Customer-facing React app |

---

## 👨‍💻 Author

**Sourav Kadam**
BCA Final Year Project

---

## 📄 License

This project is for educational purposes.
