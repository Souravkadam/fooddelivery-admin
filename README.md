# Foodies — Admin Panel

Professional admin dashboard for managing the Foodies food delivery platform. Built with React + Vite featuring analytics, user management, food management, and order tracking.

---

## Tech Stack

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

## Project Structure

```
adminpanel/
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
│   │   │   └── AdminLogin.jsx     # Admin login with JWT auth
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx      # Analytics, charts, stats
│   │   │   └── Dashboard.css
│   │   ├── AddFood/
│   │   │   ├── AddFood.jsx        # Add food with 50+ category options
│   │   │   └── AddFood.css
│   │   ├── ListFood/
│   │   │   ├── ListFood.jsx       # View, search, delete foods
│   │   │   └── ListFood.css
│   │   ├── Order/
│   │   │   ├── Orders.jsx         # Manage all orders + status update
│   │   │   └── Orders.css
│   │   └── Users/
│   │       ├── Users.jsx          # User management
│   │       └── Users.css
│   ├── services/
│   │   └── adminApi.js            # All API calls with auth headers
│   ├── util/
│   │   └── constants.js           # API base URL from env
│   ├── App.jsx                    # Protected routes + auth guard
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── .npmrc                         # legacy-peer-deps for Recharts + React 19
├── vercel.json
└── vite.config.js
```

---

## Features

### Authentication
- Admin login with JWT
- Role-based access — only ADMIN role allowed
- Auto-redirect to login if not authenticated
- Logout with token cleanup

### Dashboard Analytics
- Stat cards — Total Revenue, Orders, Users, Food Items
- Revenue area chart — last 15 days
- Orders bar chart — last 15 days
- Order status pie chart — dynamic from real data
- Order count trend chart
- Top selling foods table
- Top customers table
- Recent 10 orders

### Food Management
- Add new food with image upload
- 50+ categories organized in groups
- View all food items with search
- Delete food items

### Order Management
- View all orders from all users
- Filter by status and payment
- Update order status (Preparing → Confirmed → Out for Delivery → Delivered)
- View full order details
- Pagination

### User Management
- View all registered users
- Search and filter users
- View full profile with login history
- Edit user details
- Block / Unblock users
- Reset password
- Delete users

---

## Local Setup

### Prerequisites
- Node.js 18+
- Backend running on port 8080
- Admin account in MongoDB (auto-created on first backend startup)

### Steps

```bash
cd adminpanel
npm install
npm run dev -- --port 5174
```

App runs at **http://localhost:5174**

### Required Environment Variables

Set these in your deployment platform (Vercel) or locally before running:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend REST API base URL |

For local development, create a `.env` file (never commit it):
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev -- --port 5174` | Start dev server on port 5174 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Admin Account

An admin account is automatically created on first backend startup via `AdminSeeder.java`.

To grant admin access to an existing MongoDB user, set their `role` field to `ADMIN` in the database.

---

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Admin login → JWT token |
| GET | `/api/foods` | Get all food items |
| POST | `/api/foods` | Add food (multipart/form-data) |
| DELETE | `/api/foods/:id` | Delete food |
| GET | `/api/orders/all` | Get all orders |
| PATCH | `/api/orders/status/:id` | Update order status |
| GET | `/api/users` | Get all users |
| PUT | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/block` | Block user |
| PATCH | `/api/users/:id/unblock` | Unblock user |
| DELETE | `/api/users/:id` | Delete user |

---

## Dashboard Charts

Charts are built with Recharts using an `AutoChart` wrapper that measures real DOM width — ensures charts render correctly in any layout including sidebar-collapsed state.

Data is computed client-side from the orders API:
- Revenue and order counts grouped by day (last 15 days)
- Order status distribution from actual `orderStatus` values
- Top foods ranked by quantity sold
- Top customers ranked by total spend

---

## Deployment (Vercel)

1. Push code to GitHub
2. Go to vercel.com → New Project → Import repo
3. Framework: Vite | Build: `npm run build` | Output: `dist`
4. Add environment variable in Vercel dashboard:
   - `VITE_API_BASE_URL` → your Render backend URL + `/api`
5. Deploy

The `vercel.json` handles SPA routing. The `.npmrc` file handles Recharts peer dependency with React 19.

---

## Related Projects

| Project | Description |
|---------|-------------|
| Backend | Spring Boot REST API |
| Frontend | Customer-facing React app |

---

## Author

Sourav Kadam — BCA Final Year Project

---

## License

This project is for educational purposes.
