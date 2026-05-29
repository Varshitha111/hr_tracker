# 🎯 SIMS – Smart Interview Management System

A full-stack web application for HR recruiters to manage candidates, schedule interviews, track status, and record feedback.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | ASP.NET Core 8 Web API |
| Database | SQL Server / Azure SQL |
| Auth | JWT Bearer Tokens |
| ORM | Entity Framework Core 8 |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (Express is free)

---

### 1. Backend Setup

```bash
cd backend

# Restore packages
dotnet restore

# Update connection string in appsettings.json
# Default: "Server=localhost;Database=SIMSDB;Trusted_Connection=True;TrustServerCertificate=True;"

# Run the API (auto-creates DB and seeds data)
dotnet run
```

Backend runs at: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

**Default login credentials (auto-seeded):**
- Email: `admin@sims.com`
- Password: `Admin@123`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
sims/
├── backend/
│   ├── Controllers/    # API endpoints
│   ├── Services/       # Business logic
│   ├── Repositories/   # Data access layer
│   ├── Models/         # Entity models
│   ├── DTOs/           # Data transfer objects
│   ├── Data/           # DbContext + Seeder
│   ├── appsettings.json
│   └── Program.cs
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Layout, UI components
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # Login, Dashboard, Candidates, Interviews, Feedback
│   │   └── services/   # Axios API layer
│   ├── index.html
│   └── vite.config.js
│
└── database/
    └── setup.sql       # Manual SQL setup (optional)
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT token |

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidates` | List all candidates |
| GET | `/api/candidates/{id}` | Get candidate by ID |
| POST | `/api/candidates` | Add new candidate (multipart/form-data) |
| PUT | `/api/candidates/{id}` | Update candidate |
| DELETE | `/api/candidates/{id}` | Delete candidate |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interviews` | List all interviews |
| POST | `/api/interviews` | Schedule interview |
| PUT | `/api/interviews/{id}` | Update interview |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | List all feedback |
| POST | `/api/feedback` | Submit feedback |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Option 1: Vercel CLI
npx vercel --prod

# Option 2: Connect GitHub repo to vercel.com
# Set environment variable: VITE_API_URL=https://your-api.azurewebsites.net/api
```

### Backend → Azure App Service

```bash
cd backend
dotnet publish -c Release -o ./publish

# Using Azure CLI:
az webapp deploy --resource-group MyRG --name my-sims-api --src-path ./publish
```

**Azure App Service Configuration:**
- Add Application Setting: `ConnectionStrings__DefaultConnection` → your Azure SQL connection string
- Add Application Setting: `Jwt__Key` → a secure random key

### Database → Azure SQL

```bash
# Update appsettings.json with Azure SQL connection string:
# "Server=your-server.database.windows.net;Database=SIMSDB;User Id=your-user;Password=your-pass;TrustServerCertificate=True;"

# EF Core will auto-create tables on first run
```

---

## 🔒 Security Notes

- Passwords are hashed using **BCrypt**
- All APIs (except `/api/auth/login`) require a valid **JWT Bearer token**
- CORS is configured to allow only your frontend domains
- Change the JWT key in production (`appsettings.json` → `Jwt:Key`)

---

## ✨ Features

- ✅ JWT Authentication with protected routes
- ✅ Dashboard with live statistics
- ✅ Candidate CRUD with resume upload
- ✅ Interview scheduling (Online/Offline)
- ✅ Interview feedback with ratings
- ✅ Status tracking across all modules
- ✅ Search and filter on all tables
- ✅ Responsive design (mobile-friendly)
- ✅ Auto-seeds demo data on first run
- ✅ Swagger API documentation

---

## 🐛 Troubleshooting

**"Cannot connect to database"**  
→ Check SQL Server is running. Update connection string in `appsettings.json`.

**"CORS error" in browser**  
→ Ensure frontend URL is in the CORS policy in `Program.cs`.

**"401 Unauthorized"**  
→ JWT token expired. Log out and log back in.
