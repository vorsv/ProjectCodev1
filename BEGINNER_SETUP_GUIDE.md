# Complete Beginner's Guide to Offline Testing Platform

## Table of Contents
1. [Prerequisites Installation](#prerequisites-installation)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Setup](#frontend-setup)
6. [Local Testing](#local-testing)
7. [LAN Network Setup](#lan-network-setup)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites Installation

### Step 1.1: Install XAMPP (Windows/Mac/Linux)

**For Windows:**
1. Download XAMPP from https://www.apachefriends.org/
2. Run the installer as Administrator
3. Select components: Apache, MySQL, PHP, phpMyAdmin
4. Install to default location (C:\xampp)
5. Start XAMPP Control Panel

**For Linux (Ubuntu/Debian):**
```bash
# Update system
sudo apt update

# Install Apache, MySQL, PHP
sudo apt install apache2 mysql-server php php-mysql php-cli php-mbstring php-xml libapache2-mod-php -y

# Install phpMyAdmin (optional but recommended)
sudo apt install phpmyadmin -y
```

**For macOS:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PHP, MySQL, Apache
brew install php mysql httpd
```

### Step 1.2: Install Programming Language Compilers

**Windows (using XAMPP):**
1. Download and install MinGW-w64 for C++
2. Download Python from python.org
3. Download OpenJDK from adoptium.net
4. Add all to system PATH

**Linux:**
```bash
# Install compilers
sudo apt install g++ python3 python3-pip openjdk-11-jdk -y

# Verify installations
g++ --version
python3 --version
java --version
```

**macOS:**
```bash
# Install Xcode command line tools
xcode-select --install

# Install Python and Java
brew install python openjdk@11
```

### Step 1.3: Install Text Editor/IDE
- **VS Code** (Recommended): Download from https://code.visualstudio.com/
- **Sublime Text**: Alternative option
- **PHPStorm**: Professional IDE (paid)

---

## 2. Project Setup

### Step 2.1: Create Project Directory

**Windows:**
```cmd
# Open Command Prompt as Administrator
cd C:\xampp\htdocs
mkdir codeplatform
cd codeplatform
```

**Linux/macOS:**
```bash
# Create project in web server directory
sudo mkdir /var/www/html/codeplatform
cd /var/www/html/codeplatform
sudo chown -R $USER:$USER .
```

### Step 2.2: Create Project Structure
```
codeplatform/
├── backend/
│   ├── config/
│   ├── includes/
│   ├── api/
│   ├── judge/
│   └── uploads/
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── pages/
│   └── components/
├── database/
├── scripts/
└── docs/
```

Create these directories:
```bash
mkdir -p backend/{config,includes,api,judge,uploads}
mkdir -p frontend/{assets/{css,js,images},pages,components}
mkdir -p database scripts docs
```

---

## 3. Database Configuration

### Step 3.1: Start Database Server

**XAMPP (Windows):**
1. Open XAMPP Control Panel
2. Click "Start" next to Apache
3. Click "Start" next to MySQL
4. Click "Admin" next to MySQL (opens phpMyAdmin)

**Linux:**
```bash
sudo systemctl start apache2
sudo systemctl start mysql
```

### Step 3.2: Create Database

**Using phpMyAdmin:**
1. Open http://localhost/phpmyadmin
2. Click "New" to create database
3. Name it "codeplatform"
4. Click "Create"

**Using Command Line:**
```bash
mysql -u root -p
CREATE DATABASE codeplatform;
CREATE USER 'codeplatform'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON codeplatform.* TO 'codeplatform'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3.3: Import Database Schema
1. Copy the DATABASE_SCHEMA.sql content
2. In phpMyAdmin, select "codeplatform" database
3. Click "Import" tab
4. Paste the SQL content or upload file
5. Click "Go"

---

## 4. Backend Implementation

### Step 4.1: Database Configuration File

Create `backend/config/database.php`:
```php
<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'codeplatform';
    private $username = 'codeplatform';  // or 'root' for XAMPP
    private $password = 'your_password'; // empty for XAMPP
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
            );
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
```

### Step 4.2: Authentication System

Create `backend/includes/auth.php`:
```php
<?php
session_start();

class Auth {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function login($username, $password) {
        $query = "SELECT id, username, password_hash, role, full_name 
                  FROM users WHERE username = :username AND is_active = 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($password, $row['password_hash'])) {
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['username'] = $row['username'];
                $_SESSION['role'] = $row['role'];
                $_SESSION['full_name'] = $row['full_name'];
                
                $this->updateLastLogin($row['id']);
                return true;
            }
        }
        return false;
    }

    public function register($username, $email, $password, $full_name) {
        $check_query = "SELECT id FROM users WHERE username = :username OR email = :email";
        $check_stmt = $this->db->prepare($check_query);
        $check_stmt->bindParam(":username", $username);
        $check_stmt->bindParam(":email", $email);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            return false;
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $query = "INSERT INTO users (username, email, password_hash, full_name) 
                  VALUES (:username, :email, :password_hash, :full_name)";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":full_name", $full_name);

        return $stmt->execute();
    }

    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }

    private function updateLastLogin($user_id) {
        $query = "UPDATE users SET last_login = NOW() WHERE id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
    }

    public function logout() {
        session_destroy();
        return true;
    }
}
?>
```

### Step 4.3: API Endpoints

Create `backend/api/auth/login.php`:
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';
require_once '../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

if ($auth->login($input['username'], $input['password'])) {
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role'],
            'full_name' => $_SESSION['full_name']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
?>
```

### Step 4.4: Code Judge Engine

Create `backend/judge/judge.php`:
```php
<?php
class Judge {
    private $db;
    private $temp_dir;
    private $max_execution_time = 5; // seconds
    private $max_memory = 512; // MB

    public function __construct($database) {
        $this->db = $database;
        $this->temp_dir = sys_get_temp_dir();
    }

    public function judgeSubmission($submission_id) {
        // Get submission details
        $query = "SELECT s.*, l.name as language_name, l.file_extension, 
                         l.compile_command, l.execute_command, p.time_limit, p.memory_limit
                  FROM submissions s 
                  JOIN languages l ON s.language_id = l.id
                  JOIN problems p ON s.problem_id = p.id
                  WHERE s.id = :submission_id";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":submission_id", $submission_id);
        $stmt->execute();
        
        $submission = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$submission) return false;

        $this->updateSubmissionStatus($submission_id, 'Running');

        $test_cases = $this->getTestCases($submission['problem_id']);
        $work_dir = $this->temp_dir . '/submission_' . $submission_id;
        mkdir($work_dir, 0777, true);

        try {
            $source_file = $work_dir . '/solution.' . $submission['file_extension'];
            file_put_contents($source_file, $submission['source_code']);

            // Compile if necessary
            if ($submission['compile_command']) {
                $compile_result = $this->compile($submission, $source_file, $work_dir);
                if (!$compile_result['success']) {
                    $this->updateSubmissionStatus($submission_id, 'Compilation Error');
                    return false;
                }
            }

            // Execute test cases
            $total_score = 0;
            $all_passed = true;

            foreach ($test_cases as $test_case) {
                $result = $this->executeTestCase($submission, $test_case, $work_dir);
                
                if ($result['status'] === 'Accepted') {
                    $total_score += $test_case['weight'];
                } else {
                    $all_passed = false;
                }

                $this->saveTestCaseResult($submission_id, $test_case['id'], $result);
            }

            $final_status = $all_passed ? 'Accepted' : 'Wrong Answer';
            $this->updateSubmissionScore($submission_id, $final_status, $total_score);

        } catch (Exception $e) {
            $this->updateSubmissionStatus($submission_id, 'Internal Error');
        } finally {
            $this->cleanup($work_dir);
        }

        return true;
    }

    private function compile($submission, $source_file, $work_dir) {
        $executable = $work_dir . '/solution';
        $compile_command = str_replace(
            ['{source}', '{executable}'],
            [$source_file, $executable],
            $submission['compile_command']
        );

        $output = [];
        $return_code = 0;
        exec($compile_command . ' 2>&1', $output, $return_code);

        return [
            'success' => $return_code === 0,
            'output' => implode("\n", $output)
        ];
    }

    private function executeTestCase($submission, $test_case, $work_dir) {
        $input_file = $work_dir . '/input.txt';
        $output_file = $work_dir . '/output.txt';
        
        file_put_contents($input_file, $test_case['input']);

        if ($submission['compile_command']) {
            $executable = $work_dir . '/solution';
            $execute_command = str_replace('{executable}', $executable, $submission['execute_command']);
        } else {
            $source_file = $work_dir . '/solution.' . $submission['file_extension'];
            $execute_command = str_replace('{source}', $source_file, $submission['execute_command']);
        }

        $full_command = "timeout {$this->max_execution_time}s {$execute_command} < {$input_file} > {$output_file} 2>&1";
        
        $start_time = microtime(true);
        $return_code = 0;
        exec($full_command, $output, $return_code);
        $execution_time = (microtime(true) - $start_time) * 1000;

        if ($return_code === 124) {
            return [
                'status' => 'Time Limit Exceeded',
                'execution_time' => $this->max_execution_time * 1000,
                'output' => ''
            ];
        } elseif ($return_code !== 0) {
            return [
                'status' => 'Runtime Error',
                'execution_time' => $execution_time,
                'output' => file_exists($output_file) ? file_get_contents($output_file) : ''
            ];
        }

        $actual_output = file_exists($output_file) ? trim(file_get_contents($output_file)) : '';
        $expected_output = trim($test_case['expected_output']);

        $status = ($actual_output === $expected_output) ? 'Accepted' : 'Wrong Answer';

        return [
            'status' => $status,
            'execution_time' => $execution_time,
            'output' => $actual_output
        ];
    }

    private function getTestCases($problem_id) {
        $query = "SELECT * FROM test_cases WHERE problem_id = :problem_id ORDER BY id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":problem_id", $problem_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function updateSubmissionStatus($submission_id, $status) {
        $query = "UPDATE submissions SET status = :status, judged_at = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $submission_id);
        $stmt->execute();
    }

    private function updateSubmissionScore($submission_id, $status, $score) {
        $query = "UPDATE submissions SET status = :status, score = :score, judged_at = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":score", $score);
        $stmt->bindParam(":id", $submission_id);
        $stmt->execute();
    }

    private function saveTestCaseResult($submission_id, $test_case_id, $result) {
        $query = "INSERT INTO submission_results (submission_id, test_case_id, status, execution_time, output) 
                  VALUES (:submission_id, :test_case_id, :status, :execution_time, :output)";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":submission_id", $submission_id);
        $stmt->bindParam(":test_case_id", $test_case_id);
        $stmt->bindParam(":status", $result['status']);
        $stmt->bindParam(":execution_time", $result['execution_time']);
        $stmt->bindParam(":output", $result['output']);
        $stmt->execute();
    }

    private function cleanup($work_dir) {
        if (is_dir($work_dir)) {
            $files = glob($work_dir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) unlink($file);
            }
            rmdir($work_dir);
        }
    }
}
?>
```

---

## 5. Frontend Setup

### Step 5.1: Create Main HTML Page

Create `frontend/pages/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Platform - Offline Testing System</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div id="app">
        <!-- Login Form -->
        <div id="login-container" class="container">
            <div class="login-form">
                <h1>Code Platform</h1>
                <form id="login-form">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="#" id="show-register">Register</a></p>
            </div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard-container" class="container" style="display: none;">
            <header class="header">
                <h1>Code Platform</h1>
                <nav>
                    <a href="#" data-tab="problems">Problems</a>
                    <a href="#" data-tab="submissions">Submissions</a>
                    <a href="#" data-tab="leaderboard">Leaderboard</a>
                    <a href="#" id="logout">Logout</a>
                </nav>
            </header>

            <main class="main-content">
                <!-- Problems Tab -->
                <div id="problems-tab" class="tab-content">
                    <h2>Problem Repository</h2>
                    <div id="problems-list"></div>
                </div>

                <!-- Code Editor -->
                <div id="code-editor" class="editor-container" style="display: none;">
                    <div class="editor-header">
                        <h3 id="problem-title"></h3>
                        <select id="language-select">
                            <option value="1">C++</option>
                            <option value="2">Python</option>
                            <option value="3">Java</option>
                            <option value="4">PHP</option>
                        </select>
                    </div>
                    <div class="editor-body">
                        <div class="problem-description" id="problem-description"></div>
                        <div class="code-area">
                            <textarea id="code-textarea" placeholder="Write your code here..."></textarea>
                            <button id="submit-code">Submit Solution</button>
                        </div>
                    </div>
                    <div id="submission-result"></div>
                </div>
            </main>
        </div>
    </div>

    <script src="../assets/js/app.js"></script>
</body>
</html>
```

### Step 5.2: Create CSS Styles

Create `frontend/assets/css/style.css`:
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Login Form */
.login-form {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    max-width: 400px;
    margin: 100px auto;
    text-align: center;
}

.login-form h1 {
    color: #333;
    margin-bottom: 30px;
    font-size: 2.5em;
}

.login-form input {
    width: 100%;
    padding: 15px;
    margin: 10px 0;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.login-form button {
    width: 100%;
    padding: 15px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
}

.login-form button:hover {
    background: #5a6fd8;
}

/* Dashboard */
#dashboard-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    min-height: 90vh;
}

.header {
    background: #333;
    color: white;
    padding: 20px;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header nav a {
    color: white;
    text-decoration: none;
    margin: 0 15px;
    padding: 10px 15px;
    border-radius: 5px;
    transition: background 0.3s;
}

.header nav a:hover {
    background: rgba(255,255,255,0.1);
}

.main-content {
    padding: 30px;
}

/* Problems List */
.problem-item {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin: 15px 0;
    cursor: pointer;
    transition: all 0.3s;
}

.problem-item:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.problem-title {
    font-size: 1.3em;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
}

.problem-meta {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
}

.difficulty {
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8em;
    font-weight: bold;
}

.difficulty.easy { background: #d4edda; color: #155724; }
.difficulty.medium { background: #fff3cd; color: #856404; }
.difficulty.hard { background: #f8d7da; color: #721c24; }

/* Code Editor */
.editor-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    overflow: hidden;
}

.editor-header {
    background: #333;
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.editor-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 600px;
}

.problem-description {
    padding: 20px;
    border-right: 1px solid #ddd;
    overflow-y: auto;
    background: #f8f9fa;
}

.code-area {
    padding: 20px;
    display: flex;
    flex-direction: column;
}

#code-textarea {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    resize: none;
    margin-bottom: 15px;
}

#submit-code {
    padding: 12px 25px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    align-self: flex-start;
}

#submit-code:hover {
    background: #218838;
}

/* Submission Results */
#submission-result {
    padding: 20px;
    border-top: 1px solid #ddd;
}

.result {
    padding: 15px;
    border-radius: 5px;
    margin: 10px 0;
}

.result.success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.result.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

/* Responsive Design */
@media (max-width: 768px) {
    .editor-body {
        grid-template-columns: 1fr;
        height: auto;
    }
    
    .problem-description {
        border-right: none;
        border-bottom: 1px solid #ddd;
        max-height: 300px;
    }
    
    .header {
        flex-direction: column;
        gap: 15px;
    }
}

/* Alerts */
.alert {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
}

.alert-success { background: #28a745; }
.alert-error { background: #dc3545; }

@keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

/* Loading Animation */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

### Step 5.3: Create JavaScript Application

Create `frontend/assets/js/app.js`:
```javascript
class CodePlatform {
    constructor() {
        this.apiBase = '/codeplatform/backend/api';
        this.currentUser = null;
        this.currentProblem = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.login(formData.get('username'), formData.get('password'));
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab(e.target.dataset.tab);
            });
        });

        // Code submission
        const submitBtn = document.getElementById('submit-code');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitCode();
            });
        }
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBase}/auth/check.php`);
            const data = await response.json();
            
            if (data.authenticated) {
                this.currentUser = data.user;
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLogin();
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.showDashboard();
                this.showSuccess('Login successful!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        }
    }

    async logout() {
        try {
            await fetch(`${this.apiBase}/auth/logout.php`, { method: 'POST' });
            this.currentUser = null;
            this.showLogin();
            this.showSuccess('Logged out successfully!');
        } catch (error) {
            this.showError('Logout failed');
        }
    }

    showLogin() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        this.loadProblems();
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Load tab content
        switch(tabName) {
            case 'problems':
                this.loadProblems();
                break;
            case 'submissions':
                this.loadSubmissions();
                break;
            case 'leaderboard':
                this.loadLeaderboard();
                break;
        }
    }

    async loadProblems() {
        try {
            const response = await fetch(`${this.apiBase}/problems/list.php`);
            const data = await response.json();
            
            if (data.success) {
                this.displayProblems(data.problems);
            }
        } catch (error) {
            console.error('Failed to load problems:', error);
        }
    }

    displayProblems(problems) {
        const problemsList = document.getElementById('problems-list');
        if (!problemsList) return;

        problemsList.innerHTML = problems.map(problem => `
            <div class="problem-item" onclick="app.openProblem(${problem.id})">
                <div class="problem-title">${problem.title}</div>
                <div class="problem-meta">
                    <span class="difficulty ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                    <span class="category">${problem.category_name || 'General'}</span>
                </div>
                <div class="problem-description">${problem.description.substring(0, 150)}...</div>
            </div>
        `).join('');
    }

    async openProblem(problemId) {
        try {
            const response = await fetch(`${this.apiBase}/problems/detail.php?id=${problemId}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentProblem = data.problem;
                this.showCodeEditor();
            }
        } catch (error) {
            this.showError('Failed to load problem details');
        }
    }

    showCodeEditor() {
        if (!this.currentProblem) return;

        // Hide problems list
        document.getElementById('problems-tab').style.display = 'none';
        
        // Show code editor
        const editor = document.getElementById('code-editor');
        editor.style.display = 'block';

        // Set problem details
        document.getElementById('problem-title').textContent = this.currentProblem.title;
        document.getElementById('problem-description').innerHTML = `
            <h3>${this.currentProblem.title}</h3>
            <div class="problem-meta">
                <span class="difficulty ${this.currentProblem.difficulty.toLowerCase()}">${this.currentProblem.difficulty}</span>
                <span>Time Limit: ${this.currentProblem.time_limit}ms</span>
                <span>Memory Limit: ${this.currentProblem.memory_limit}MB</span>
            </div>
            <div class="problem-text">${this.currentProblem.description}</div>
            ${this.currentProblem.input_format ? `<h4>Input Format:</h4><p>${this.currentProblem.input_format}</p>` : ''}
            ${this.currentProblem.output_format ? `<h4>Output Format:</h4><p>${this.currentProblem.output_format}</p>` : ''}
            ${this.currentProblem.constraints ? `<h4>Constraints:</h4><p>${this.currentProblem.constraints}</p>` : ''}
        `;

        // Load code template
        this.loadCodeTemplate();
    }

    loadCodeTemplate() {
        const languageSelect = document.getElementById('language-select');
        const codeTextarea = document.getElementById('code-textarea');
        
        const templates = {
            '1': `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
            '2': `# Your Python solution here
def solve():
    pass

if __name__ == "__main__":
    solve()`,
            '3': `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}`,
            '4': `<?php
// Your PHP solution here

?>`
        };

        languageSelect.addEventListener('change', () => {
            const template = templates[languageSelect.value];
            if (template && codeTextarea.value.trim() === '') {
                codeTextarea.value = template;
            }
        });

        // Set initial template
        codeTextarea.value = templates['1'];
    }

    async submitCode() {
        if (!this.currentProblem) return;

        const languageId = document.getElementById('language-select').value;
        const sourceCode = document.getElementById('code-textarea').value;

        if (!sourceCode.trim()) {
            this.showError('Please write some code before submitting');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/submissions/submit.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problem_id: this.currentProblem.id,
                    language_id: languageId,
                    source_code: sourceCode
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Code submitted successfully!');
                this.pollSubmissionStatus(data.submission_id);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Submission failed: ' + error.message);
        }
    }

    async pollSubmissionStatus(submissionId) {
        const resultContainer = document.getElementById('submission-result');
        resultContainer.innerHTML = '<div class="loading"></div> Judging your submission...';

        const pollInterval = 2000; // 2 seconds
        const maxPolls = 30; // 1 minute max
        let polls = 0;

        const poll = async () => {
            try {
                const response = await fetch(`${this.apiBase}/submissions/status.php?id=${submissionId}`);
                const data = await response.json();

                if (data.status !== 'Pending' && data.status !== 'Running') {
                    this.displaySubmissionResult(data);
                    return;
                }

                polls++;
                if (polls < maxPolls) {
                    setTimeout(poll, pollInterval);
                } else {
                    resultContainer.innerHTML = '<div class="result error">Submission taking too long to judge</div>';
                }
            } catch (error) {
                console.error('Error polling submission status:', error);
                resultContainer.innerHTML = '<div class="result error">Error checking submission status</div>';
            }
        };

        poll();
    }

    displaySubmissionResult(submission) {
        const resultContainer = document.getElementById('submission-result');
        const statusClass = submission.status === 'Accepted' ? 'success' : 'error';
        
        resultContainer.innerHTML = `
            <div class="result ${statusClass}">
                <h3>Submission Result</h3>
                <p><strong>Status:</strong> ${submission.status}</p>
                <p><strong>Score:</strong> ${submission.score || 0}</p>
                <p><strong>Execution Time:</strong> ${submission.execution_time || 0}ms</p>
                <p><strong>Memory Used:</strong> ${submission.memory_used || 0}KB</p>
                ${submission.status !== 'Accepted' ? `<p><strong>Details:</strong> ${submission.error_message || 'Check your solution'}</p>` : ''}
            </div>
        `;
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => alert.remove(), 5000);
    }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CodePlatform();
});
```

---

## 6. Local Testing

### Step 6.1: Start Services

**XAMPP (Windows):**
1. Open XAMPP Control Panel
2. Start Apache and MySQL services
3. Verify green status indicators

**Linux:**
```bash
sudo systemctl start apache2
sudo systemctl start mysql
sudo systemctl status apache2
sudo systemctl status mysql
```

### Step 6.2: Test Database Connection

Create `backend/test_db.php`:
```php
<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Database connection successful!<br>";
    
    // Test query
    $query = "SELECT COUNT(*) as count FROM users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Users in database: " . $result['count'];
} else {
    echo "Database connection failed!";
}
?>
```

Visit: `http://localhost/codeplatform/backend/test_db.php`

### Step 6.3: Create Test User

Create `backend/create_test_user.php`:
```php
<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// Create admin user
$username = 'admin';
$email = 'admin@test.com';
$password = 'admin123';
$full_name = 'System Administrator';
$role = 'admin';

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$query = "INSERT INTO users (username, email, password_hash, full_name, role) 
          VALUES (:username, :email, :password_hash, :full_name, :role)";

$stmt = $db->prepare($query);
$stmt->bindParam(":username", $username);
$stmt->bindParam(":email", $email);
$stmt->bindParam(":password_hash", $password_hash);
$stmt->bindParam(":full_name", $full_name);
$stmt->bindParam(":role", $role);

if ($stmt->execute()) {
    echo "Admin user created successfully!<br>";
    echo "Username: admin<br>";
    echo "Password: admin123";
} else {
    echo "Failed to create admin user";
}
?>
```

### Step 6.4: Test Frontend

1. Open browser and go to: `http://localhost/codeplatform/frontend/pages/`
2. Try logging in with admin/admin123
3. Test problem browsing and code submission

---

## 7. LAN Network Setup

### Step 7.1: Find Your IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Linux/macOS:**
```bash
ip addr show
# or
ifconfig
```

### Step 7.2: Configure Firewall

**Windows:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Add Apache HTTP Server
4. Enable for both Private and Public networks

**Linux:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Step 7.3: Configure Apache for LAN Access

Edit Apache configuration:

**XAMPP (Windows):**
Edit `C:\xampp\apache\conf\httpd.conf`:
```apache
# Find and modify
Listen 80
# Add your IP
Listen 192.168.1.100:80

# Allow access from LAN
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

**Linux:**
Edit `/etc/apache2/sites-available/codeplatform.conf`:
```apache
<VirtualHost *:80>
    ServerName codeplatform.local
    ServerAlias 192.168.1.100
    DocumentRoot /var/www/html/codeplatform/frontend
    
    <Directory /var/www/html/codeplatform>
        AllowOverride All
        Require ip 192.168.1
        Require ip 127.0.0.1
        Require local
    </Directory>
</VirtualHost>
```

### Step 7.4: Test LAN Access

1. Restart Apache service
2. From another device on the same network, open browser
3. Go to: `http://192.168.1.100/codeplatform/frontend/pages/`
4. Test login and functionality

### Step 7.5: Create Network Shortcut

Create a simple landing page at `frontend/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Code Platform - Network Access</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .btn { display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Code Platform</h1>
        <p>Welcome to the Offline Testing Platform</p>
        <a href="pages/" class="btn">Enter Platform</a>
        <a href="../backend/test_db.php" class="btn">Test Database</a>
        <p><strong>Server IP:</strong> <?php echo $_SERVER['SERVER_ADDR']; ?></p>
        <p><strong>Access URL:</strong> http://<?php echo $_SERVER['HTTP_HOST']; ?>/codeplatform/</p>
    </div>
</body>
</html>
```

---

## 8. Troubleshooting

### Common Issues and Solutions

#### 8.1: Database Connection Failed
**Problem:** "Connection error: SQLSTATE[HY000] [1045] Access denied"
**Solution:**
```bash
# Reset MySQL password
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

#### 8.2: Apache Won't Start
**Problem:** Port 80 already in use
**Solution:**
```bash
# Find what's using port 80
netstat -tulpn | grep :80
# Kill the process or change Apache port
```

#### 8.3: Code Execution Fails
**Problem:** Compiler not found
**Solution:**
```bash
# Install missing compilers
sudo apt install g++ python3 openjdk-11-jdk
# Add to PATH if necessary
export PATH=$PATH:/usr/bin
```

#### 8.4: Permission Denied Errors
**Problem:** Web server can't write files
**Solution:**
```bash
sudo chown -R www-data:www-data /var/www/html/codeplatform
sudo chmod -R 755 /var/www/html/codeplatform
sudo chmod -R 777 /var/www/html/codeplatform/backend/uploads
```

#### 8.5: LAN Access Denied
**Problem:** Can't access from other devices
**Solution:**
1. Check firewall settings
2. Verify Apache configuration allows LAN access
3. Test with: `telnet 192.168.1.100 80`

### Performance Optimization

#### 8.6: Improve Database Performance
```sql
-- Add indexes for better performance
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
```

#### 8.7: Enable PHP OpCache
Edit `php.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
```

### Security Hardening

#### 8.8: Secure File Permissions
```bash
# Set secure permissions
find /var/www/html/codeplatform -type f -exec chmod 644 {} \;
find /var/www/html/codeplatform -type d -exec chmod 755 {} \;
chmod 600 /var/www/html/codeplatform/backend/config/database.php
```

#### 8.9: Enable HTTPS (Optional)
```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/codeplatform.key \
    -out /etc/ssl/certs/codeplatform.crt

# Configure Apache SSL
sudo a2enmod ssl
sudo a2ensite default-ssl
```

---

## Next Steps

1. **Add More Problems:** Create additional problems in the database
2. **Enhance Security:** Implement rate limiting and input validation
3. **Add Features:** Contest mode, team competitions, detailed analytics
4. **Mobile App:** Create mobile interface for better accessibility
5. **Backup System:** Implement automated database backups
6. **Monitoring:** Add system monitoring and logging

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Check Apache and MySQL error logs
4. Test each component individually
5. Ensure proper file permissions

This guide provides a complete foundation for your offline testing platform. Start with the basic setup and gradually add more features as needed.