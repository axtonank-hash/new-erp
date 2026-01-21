# GegoK12 - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Application
```bash
cd /workspaces/new-erp
docker-compose up -d
```

### Step 2: Wait for Services to Start
```bash
# Check status (wait ~15 seconds for all services to be healthy)
docker-compose ps

# Expected output:
# ✅ gegok12_mysql  - Healthy
# ✅ gegok12_redis  - Healthy  
# ✅ gegok12_nextjs - Up
```

### Step 3: Open in Browser
```
http://localhost:3000
```

---

## 🔐 Login Credentials

```
Email:    admin@school.com
Password: password
```

---

## 📱 Available Pages

| Page | URL | Features |
|------|-----|----------|
| **Home** | http://localhost:3000 | Redirects to dashboard or login |
| **Login** | http://localhost:3000/login | User authentication |
| **Dashboard** | http://localhost:3000/dashboard | Stats & quick access |
| **Students** | http://localhost:3000/students | Student list |
| **Admissions** | http://localhost:3000/admissions | Manage admissions |
| **Teachers** | http://localhost:3000/teachers | Coming soon |
| **Attendance** | http://localhost:3000/attendance | Coming soon |
| **Exams** | http://localhost:3000/exams | Coming soon |
| **Fees** | http://localhost:3000/fees | Coming soon |
| **Library** | http://localhost:3000/library | Coming soon |
| **Transport** | http://localhost:3000/transport | Coming soon |
| **HR** | http://localhost:3000/hr | Coming soon |

---

## 🔧 Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs    # Next.js app
docker-compose logs -f mysql     # Database
docker-compose logs -f redis     # Cache
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart nextjs
```

### Full Reset (Remove all data)
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📊 API Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"password"}'
```

### Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard/stats
```

### Students
```bash
curl http://localhost:3000/api/students
```

### Admissions
```bash
curl http://localhost:3000/api/admissions
```

---

## 📂 Project Structure

```
next-app/
├── pages/
│   ├── api/              # Backend API routes
│   ├── login.js          # Login page
│   ├── dashboard.js      # Dashboard
│   ├── students.js       # Students page
│   └── admissions.js     # Admissions page
├── components/
│   └── Layout.js         # Main layout with sidebar
├── lib/
│   ├── auth.js           # JWT helpers
│   ├── mockData.js       # Mock data
│   └── db.js             # Database config
├── styles/
│   └── globals.css       # Global Tailwind styles
└── Dockerfile            # Container config
```

---

## 🎯 Features Summary

### ✅ Working Now
- [x] User authentication (Login/Logout)
- [x] Dashboard with statistics
- [x] Student management (View)
- [x] Admission management (View, Approve, Reject)
- [x] Responsive UI with Tailwind CSS
- [x] API routes
- [x] JWT-based security

### 🚧 Coming Soon
- [ ] Teachers management
- [ ] Attendance tracking
- [ ] Exam management
- [ ] Fee collection
- [ ] Library management
- [ ] Transport management
- [ ] HR module
- [ ] Real database integration

---

## 🛠️ Development

### Local Setup (Without Docker)
```bash
cd next-app
npm install
npm run dev
```

Visit: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

---

## 📞 Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### MySQL connection error
```bash
# Restart MySQL container
docker-compose restart mysql

# Check logs
docker-compose logs mysql
```

### Next.js won't compile
```bash
# Clear cache and rebuild
rm -rf next-app/.next
docker-compose restart nextjs
```

### Module not found errors
```bash
# Reinstall dependencies
docker-compose exec nextjs npm install
docker-compose restart nextjs
```

---

## 📖 Tech Stack

- **Frontend:** React 18 + Next.js 14
- **Styling:** Tailwind CSS + Lucide Icons
- **Backend:** Next.js API Routes
- **Database:** MySQL 8.0 (ready for integration)
- **Cache:** Redis 7
- **Auth:** JWT
- **Containerization:** Docker & Docker Compose

---

## 🎓 Demo Account

```
Role:     Admin
Email:    admin@school.com
Password: password
```

---

## 📝 Notes

1. **Mock Data:** Currently using mock data for demonstration
2. **Database Ready:** MySQL and Redis containers are running but not yet integrated
3. **All Features Tested:** See TESTING-REPORT.md for full details
4. **Responsive:** Works on desktop, tablet, and mobile browsers

---

## 🚀 Next Steps

1. **Add more pages** for Teachers, Exams, Fees, etc.
2. **Integrate real database** (MySQL with Sequelize ORM)
3. **Add user roles** (Teacher, Student, Parent, Admin)
4. **Implement notifications** (SMS, Email)
5. **Add file uploads** for documents and photos
6. **Generate reports** (PDF export)
7. **Deploy** to production

---

**Happy coding! 🎉**
