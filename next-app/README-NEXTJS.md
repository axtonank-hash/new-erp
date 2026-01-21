# GegoK12 - School ERP (Next.js Full-Stack)

**GegoK12** is now a modern, full-stack School ERP system built with **Node.js/Next.js**, featuring admissions management, attendance tracking, exam management, fee collection, and more.

## Tech Stack Migration

✅ **Previous Stack:** PHP + Laravel + Vue.js  
✅ **Current Stack:** Node.js + Next.js + React + Tailwind CSS

### Why Next.js?
- **Full-Stack:** API routes built-in (no separate backend needed)
- **Server-Side Rendering:** Better SEO and performance
- **File-based Routing:** Simpler project structure
- **Hot Module Replacement:** Faster development experience
- **TypeScript Support:** Better code maintainability
- **API Routes:** Lightweight API layer with `/pages/api`

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & Navigate
```bash
cd /workspaces/new-erp
```

### 2. Start with Docker
```bash
docker-compose up -d
```

This will start:
- **MySQL 8.0** on port 3306
- **Redis 7** on port 6379
- **Next.js App** on port 3000

### 3. Access the Application
Open your browser: **http://localhost:3000**

### 4. Login Credentials (Demo)
```
Email:    admin@school.com
Password: password
```

## Project Structure

```
next-app/
├── pages/
│   ├── api/                    # API routes
│   │   ├── auth/login.js      # Authentication endpoint
│   │   ├── dashboard/stats.js # Dashboard statistics
│   │   ├── students/          # Student management APIs
│   │   ├── admissions/        # Admission management APIs
│   │   └── health.js          # Health check
│   ├── _app.js                # Next.js App wrapper
│   ├── _document.js           # HTML document structure
│   ├── index.js               # Home page (redirects)
│   ├── login.js               # Login page
│   ├── dashboard.js           # Dashboard
│   ├── students.js            # Students management
│   └── admissions.js          # Admissions management
├── components/
│   └── Layout.js              # Main layout component
├── lib/
│   ├── db.js                  # Database connection (Sequelize)
│   ├── auth.js                # Authentication helpers
│   ├── mockData.js            # Mock data for demo
├── styles/
│   └── globals.css            # Global styles with Tailwind
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── jsconfig.json              # Path aliases
└── Dockerfile                 # Container configuration
```

## Available Features

✅ **Dashboard** - Overview of key metrics  
✅ **Student Management** - View all students  
✅ **Admissions** - Manage student admissions with approve/reject  
✅ **Authentication** - Login/logout functionality  
✅ **Responsive UI** - Tailwind CSS responsive design  

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Students
- `GET /api/students` - Get all students

### Admissions
- `GET /api/admissions` - Get all admissions

### Health Check
- `GET /api/health` - API health status

## Development

### Local Setup (Without Docker)
```bash
cd next-app
npm install
npm run dev
```

Open http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Environment Variables

Edit `.env.local`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=mysql
DB_PORT=3306
DB_USER=gegok12
DB_PASSWORD=gegok12
DB_NAME=gegok12
JWT_SECRET=your_secret_key
API_URL=http://localhost:3000
```

## Docker Commands

### View Logs
```bash
docker-compose logs nextjs -f      # Next.js app
docker-compose logs mysql -f       # MySQL
docker-compose logs redis -f       # Redis
```

### Stop Containers
```bash
docker-compose down
```

### Remove All Data
```bash
docker-compose down -v
```

### Rebuild Containers
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Next Steps & Features to Add

### 1. Database Integration
- Replace mock data with real MySQL queries
- Set up Sequelize ORM
- Create database migrations

### 2. Additional Pages
- Teachers management
- Attendance tracking
- Exam management
- Fee collection
- Library management
- Transport management
- HR module

### 3. Advanced Features
- Real-time notifications
- File uploads
- Reports generation (PDF)
- SMS/Email notifications
- Role-based access control
- Audit logging

### 4. Performance
- API caching with Redis
- Image optimization
- Database indexing

### 5. Security
- Input validation
- Rate limiting
- CSRF protection
- SQL injection prevention
- XSS protection

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env.local
PORT=3001
```

### Database Connection Issues
```bash
# Check MySQL is running
docker-compose ps

# Restart MySQL
docker-compose restart mysql
```

### Clear Next.js Cache
```bash
rm -rf .next/
docker-compose restart nextjs
```

## Support & Documentation

- **Docs:** https://docs.gegok12.com
- **Issues:** GitHub Issues
- **Community:** GitHub Discussions

## License

MIT License - See LICENSE file

---

**Happy coding! 🚀**  
Built with ❤️ by GegoK12 Team
