# Quick Start Guide - 15 Minutes Setup

This is a simplified version to get you running quickly. Follow these steps in order.

## Prerequisites (5 minutes)

### Windows Users:
1. Download XAMPP from https://www.apachefriends.org/
2. Install with default settings
3. Start XAMPP Control Panel
4. Click "Start" for Apache and MySQL

### Linux Users:
```bash
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-cli -y
sudo systemctl start apache2 mysql
```

## Database Setup (3 minutes)

1. Open http://localhost/phpmyadmin in your browser
2. Click "New" to create database
3. Name it "codeplatform"
4. Click "Create"
5. Click "Import" tab
6. Copy and paste the SQL from `DATABASE_SCHEMA.sql`
7. Click "Go"

## File Setup (5 minutes)

### Windows (XAMPP):
1. Go to `C:\xampp\htdocs\`
2. Create folder `codeplatform`
3. Copy all project files there

### Linux:
```bash
sudo mkdir /var/www/html/codeplatform
sudo cp -r * /var/www/html/codeplatform/
sudo chown -R www-data:www-data /var/www/html/codeplatform
```

## Configuration (2 minutes)

1. Edit `backend/config/database.php`
2. For XAMPP, use these settings:
```php
private $username = 'root';
private $password = '';  // Empty for XAMPP
```

3. Create test admin user by visiting:
   `http://localhost/codeplatform/backend/create_test_user.php`

## Test It!

1. Open: `http://localhost/codeplatform/frontend/pages/`
2. Login with: admin / admin123
3. Try creating and solving a problem!

## For LAN Access:

1. Find your IP: `ipconfig` (Windows) or `ip addr` (Linux)
2. Other devices can access: `http://YOUR_IP/codeplatform/frontend/pages/`

That's it! You now have a working offline testing platform.

## Need Help?

- Check `BEGINNER_SETUP_GUIDE.md` for detailed instructions
- Common issue: If login fails, check database connection
- Common issue: If can't access from other devices, check firewall settings