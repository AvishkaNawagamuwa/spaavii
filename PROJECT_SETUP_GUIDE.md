# PPP Project Setup Guide

## 🚀 Project Overview
This is a **SPA Management System** built with:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MySQL
- **Authentication**: JWT

## 📋 Prerequisites

Before setting up the project, ensure you have:

### 1. Node.js & npm
- **Node.js** version 16 or higher
- **npm** (comes with Node.js)

```bash
# Check if installed
node --version
npm --version
```

### 2. MySQL Server
- **MySQL** version 8.0 or higher
- **MySQL Workbench** (optional, for GUI)

```bash
# Check if MySQL is running
mysql --version
```

### 3. Git
```bash
# Check if installed
git --version
```

## 🔧 Setup Instructions

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/AvishkaNawagamuwa/ppp.git

# Navigate to project directory
cd ppp
```

### Step 2: Database Setup

#### 2.1 Create MySQL Database
1. Start MySQL server
2. Open MySQL Workbench or use command line:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS lsa_spa_management;
USE lsa_spa_management;
```

#### 2.2 Import Database Schema
```bash
# Navigate to project root and run the schema file
mysql -u root -p lsa_spa_management < database/schema.sql

# Or if you prefer using the backend schema
mysql -u root -p lsa_spa_management < backend/schema.sql
```

#### 2.3 Configure Database Connection
Update the database configuration in `backend/config/database.js`:

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // Your MySQL username
  password: 'your_password', // Your MySQL password
  database: 'lsa_spa_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Step 3: Backend Setup

#### 3.1 Install Backend Dependencies
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

#### 3.2 Create Environment File
Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lsa_spa_management

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

#### 3.3 Create Uploads Directory
```bash
# Create uploads directory for file storage
mkdir uploads
mkdir uploads/documents
mkdir uploads/photos
```

### Step 4: Frontend Setup

#### 4.1 Install Frontend Dependencies
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### Step 5: Root Level Setup (Optional)
```bash
# Navigate back to root directory
cd ..

# Install root level dependencies (if any)
npm install
```

## 🚀 Running the Application

### Method 1: Run Both Services Separately

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev    # Development with nodemon
# OR
npm start      # Production mode
```

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev    # Starts Vite dev server
```

### Method 2: Using Concurrent Scripts (If Available)
```bash
# From root directory
npm run dev    # If configured to run both simultaneously
```

## 🌐 Access Points

After successful setup:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs (if configured)

## 🗂️ Project Structure

```
ppp/
├── frontend/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/           # Node.js Backend
│   ├── config/        # Database & other configs
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── services/      # Business logic
│   ├── uploads/       # File storage
│   └── package.json
├── database/          # Database schemas
└── package.json       # Root configuration
```

## 🔐 Default Login Credentials

The system may have default admin accounts. Check:
- Database seeding scripts in `backend/` folder
- Look for files like `create-demo-user.js` or similar

## 🛠️ Development Tools

### Backend Development
- **Nodemon**: Auto-restart on file changes
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **MySQL2**: Database driver
- **Multer**: File upload handling
- **JWT**: Authentication

### Frontend Development
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **TailwindCSS**: Styling
- **Chart.js**: Data visualization
- **React Icons**: Icon library

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```
**Solution**: Update MySQL credentials in `backend/config/database.js`

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution**: 
- Kill the process using the port
- Or change the port in `.env` file

#### 3. Module Not Found Errors
```
Error: Cannot find module 'some-package'
```
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Issues
**Solution**: Frontend URL should be added to CORS configuration in `backend/server.js`

#### 5. File Upload Issues
**Solution**: Ensure `uploads` directory exists with proper permissions

### Environment-Specific Commands

#### Windows (PowerShell)
```powershell
# Create directories
mkdir uploads, uploads\documents, uploads\photos

# Check running processes on port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <process_id> /F
```

#### macOS/Linux
```bash
# Create directories
mkdir -p uploads/{documents,photos}

# Check running processes on port
lsof -i :3001

# Kill process
kill -9 <process_id>
```

## 📚 Additional Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Node.js Documentation**: https://nodejs.org/docs/
- **React Documentation**: https://reactjs.org/docs/
- **Vite Documentation**: https://vitejs.dev/guide/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add license information if available]

---

**Note**: This is a SPA (Service Provider Authentication) management system for LSA (Local Service Authority) with features including spa registration, document management, payment processing, and admin dashboards.