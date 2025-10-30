# 🗄️ Database Setup Guide for PPP Project

## Overview
The PPP (SPA Management System) uses **MySQL** as its primary database. The database stores information about SPAs, therapists, payments, notifications, and administrative data.

**Database Name**: `lsa_spa_management`

---

## 📋 Prerequisites

### 1. Install MySQL
Download and install MySQL from the official website:
- **MySQL Server 8.0+** (Recommended)
- **MySQL Workbench** (Optional GUI tool)

### 2. Verify MySQL Installation
```bash
# Check MySQL version
mysql --version

# Check if MySQL service is running
# Windows
net start mysql

# macOS/Linux
sudo systemctl status mysql
# or
brew services list | grep mysql
```

---

## 🚀 Database Setup Methods

### Method 1: Using MySQL Command Line (Recommended)

#### Step 1: Access MySQL
```bash
# Login to MySQL (you'll be prompted for password)
mysql -u root -p

# Or if you have a specific user
mysql -u your_username -p
```

#### Step 2: Create Database
```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS lsa_spa_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE lsa_spa_management;

-- Verify database creation
SHOW DATABASES;
```

#### Step 3: Import Main Schema
```bash
# Exit MySQL first
exit;

# Import the main schema file
mysql -u root -p lsa_spa_management < database/schema.sql

# Or use the backend version
mysql -u root -p lsa_spa_management < backend/setup_database.sql
```

#### Step 4: Verify Tables Created
```bash
# Login back to MySQL
mysql -u root -p lsa_spa_management

# Check tables
SHOW TABLES;

# Check table structure (example)
DESCRIBE spas;
```

### Method 2: Using MySQL Workbench (GUI)

#### Step 1: Open MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Enter your credentials

#### Step 2: Create Database
```sql
CREATE DATABASE IF NOT EXISTS lsa_spa_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

#### Step 3: Import Schema
1. Right-click on `lsa_spa_management` database
2. Select "Import Schema"
3. Choose `database/schema.sql` file
4. Click "Import"

---

## 🏗️ Database Structure

### Main Tables Overview

| Table Name | Purpose | Key Relations |
|------------|---------|---------------|
| `spas` | Spa registration & details | Primary entity |
| `therapists` | Therapist management | Foreign key to `spas` |
| `admin_users` | System administrators | Standalone |
| `payments` | Payment tracking | Foreign key to `spas` |
| `notifications` | System notifications | References multiple tables |
| `working_history` | Therapist work records | Foreign key to `therapists` |

### Key Tables Detail

#### 1. SPAs Table
```sql
-- Main spa information
CREATE TABLE spas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    spa_br_number VARCHAR(50) UNIQUE NOT NULL,
    owner_email VARCHAR(255) UNIQUE NOT NULL,
    owner_nic VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    -- ... more fields
);
```

#### 2. Therapists Table
```sql
-- Therapist management
CREATE TABLE therapists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spa_id INT NOT NULL,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    nic VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'resigned', 'terminated') DEFAULT 'pending',
    FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE
);
```

---

## ⚙️ Configuration

### Update Database Connection

Edit `backend/config/database.js`:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',          // Your MySQL host
  user: 'root',              // Your MySQL username
  password: 'YOUR_PASSWORD', // Your MySQL password
  database: 'lsa_spa_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
```

### Create Environment File

Create `.env` file in `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lsa_spa_management
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
```

---

## 📊 Sample Data (Optional)

### Create Sample Admin User
```sql
USE lsa_spa_management;

-- Insert sample admin user
INSERT INTO admin_users (username, email, password_hash, role, full_name, status) 
VALUES (
    'admin',
    'admin@lsa.gov.lk',
    '$2b$10$example_hashed_password', -- Use bcrypt to hash password
    'admin_lsa',
    'System Administrator',
    'active'
);
```

### Create Sample SPA
```sql
-- Insert sample SPA
INSERT INTO spas (
    name, 
    spa_br_number, 
    spa_tel, 
    owner_fname, 
    owner_lname, 
    owner_email, 
    owner_nic, 
    address_line1, 
    status
) VALUES (
    'Sample Wellness Spa',
    'BR001234567',
    '+94712345678',
    'John',
    'Doe',
    'john.doe@spa.lk',
    '199012345678V',
    '123 Main Street, Colombo',
    'verified'
);
```

---

## 🧪 Test Database Connection

### From Backend Application
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Test connection
node -e "
const db = require('./config/database');
db.getConnection()
  .then(() => console.log('✅ Database connected successfully!'))
  .catch(err => console.error('❌ Database connection failed:', err));
"
```

### Direct MySQL Test
```sql
-- Login to MySQL
mysql -u root -p

-- Use database
USE lsa_spa_management;

-- Test queries
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'lsa_spa_management';

-- Show all tables
SHOW TABLES;

-- Test sample query
SELECT 'Database is working!' as status;
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. "Access denied for user 'root'@'localhost'"
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
exit;
```

#### 2. "Database doesn't exist"
```sql
-- Check if database exists
SHOW DATABASES LIKE 'lsa_spa_management';

-- Create if missing
CREATE DATABASE lsa_spa_management;
```

#### 3. "Table doesn't exist"
```bash
# Re-import schema
mysql -u root -p lsa_spa_management < database/schema.sql
```

#### 4. "Connection timeout"
```sql
-- Check MySQL configuration
SHOW VARIABLES LIKE 'wait_timeout';
SHOW VARIABLES LIKE 'max_connections';
```

#### 5. Character encoding issues
```sql
-- Check database charset
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'lsa_spa_management';

-- Fix if needed
ALTER DATABASE lsa_spa_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

---

## 🚀 Quick Setup Script

Create a setup script for automation:

### Windows PowerShell Script
```powershell
# setup-database.ps1
Write-Host "Setting up PPP Database..." -ForegroundColor Green

# Check if MySQL is running
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($mysqlService -eq $null) {
    Write-Host "❌ MySQL service not found. Please install MySQL first." -ForegroundColor Red
    exit 1
}

# Create database and import schema
Write-Host "Creating database and importing schema..." -ForegroundColor Yellow
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lsa_spa_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p lsa_spa_management < database\schema.sql

Write-Host "✅ Database setup completed!" -ForegroundColor Green
Write-Host "Don't forget to update backend/config/database.js with your credentials!" -ForegroundColor Cyan
```

### Bash Script (macOS/Linux)
```bash
#!/bin/bash
# setup-database.sh

echo "🚀 Setting up PPP Database..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Create database and import schema
echo "📊 Creating database and importing schema..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lsa_spa_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p lsa_spa_management < database/schema.sql

echo "✅ Database setup completed!"
echo "🔧 Don't forget to update backend/config/database.js with your credentials!"
```

---

## 📚 Additional Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **MySQL Workbench**: https://www.mysql.com/products/workbench/
- **Node.js MySQL2**: https://www.npmjs.com/package/mysql2

---

## 🔐 Security Notes

1. **Never commit database passwords** to version control
2. **Use environment variables** for sensitive configuration
3. **Create dedicated database users** instead of using root
4. **Enable SSL** for production databases
5. **Regular backups** are essential

### Create Dedicated Database User
```sql
-- Create dedicated user for the application
CREATE USER 'ppp_app'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON lsa_spa_management.* TO 'ppp_app'@'localhost';

-- Apply permissions
FLUSH PRIVILEGES;
```

---

**✅ Your database is now ready for the PPP application!**