-- =====================================================
-- OFFLINE TESTING PLATFORM DATABASE SCHEMA
-- =====================================================
-- This schema supports a comprehensive offline testing platform
-- with user management, problem repository, code execution, and judging system

-- Users table for authentication and profile management
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'instructor', 'student') DEFAULT 'student',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    profile_picture VARCHAR(255) NULL,
    bio TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Problem categories for organization
CREATE TABLE problem_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems repository
CREATE TABLE problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description LONGTEXT NOT NULL,
    input_format TEXT NULL,
    output_format TEXT NULL,
    constraints TEXT NULL,
    category_id INT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
    time_limit INT DEFAULT 1000, -- milliseconds
    memory_limit INT DEFAULT 256, -- MB
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES problem_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Test cases for problems
CREATE TABLE test_cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    problem_id INT NOT NULL,
    input LONGTEXT NOT NULL,
    expected_output LONGTEXT NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE,
    weight INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Programming languages supported by the platform
CREATE TABLE languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,
    compile_command TEXT NULL,
    execute_command TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User submissions
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    language_id INT NOT NULL,
    source_code LONGTEXT NOT NULL,
    status ENUM('Pending', 'Running', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Internal Error') DEFAULT 'Pending',
    score INT DEFAULT 0,
    execution_time INT NULL, -- milliseconds
    memory_used INT NULL, -- KB
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    judged_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);

-- Test case results for each submission
CREATE TABLE submission_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    test_case_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error') DEFAULT 'Pending',
    execution_time INT NULL,
    memory_used INT NULL,
    output LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

-- User sessions for login management
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contests/competitions
CREATE TABLE contests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_participants INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Contest problems mapping
CREATE TABLE contest_problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    points INT DEFAULT 100,
    problem_order INT NOT NULL,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contest_problem (contest_id, problem_id)
);

-- Contest participants
CREATE TABLE contest_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contest_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contest_participant (contest_id, user_id)
);

-- System configuration
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit logs for security and debugging
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NULL,
    resource_id INT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- User performance indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Problem performance indexes
CREATE INDEX idx_problems_category ON problems(category_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_active ON problems(is_active);
CREATE INDEX idx_problems_slug ON problems(slug);

-- Submission performance indexes
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);

-- Test case performance indexes
CREATE INDEX idx_test_cases_problem ON test_cases(problem_id);
CREATE INDEX idx_test_cases_sample ON test_cases(is_sample);

-- Session performance indexes
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Contest performance indexes
CREATE INDEX idx_contests_active ON contests(is_active);
CREATE INDEX idx_contests_start_time ON contests(start_time);
CREATE INDEX idx_contests_end_time ON contests(end_time);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default programming languages
INSERT INTO languages (name, file_extension, compile_command, execute_command) VALUES
('C++', 'cpp', 'g++ -o {executable} {source} -std=c++17 -O2', './{executable}'),
('Python', 'py', NULL, 'python3 {source}'),
('Java', 'java', 'javac {source}', 'java {class}'),
('PHP', 'php', NULL, 'php {source}');

-- Insert default problem categories
INSERT INTO problem_categories (name, description) VALUES
('Arrays', 'Problems involving array manipulation and algorithms'),
('Strings', 'String processing and manipulation problems'),
('Dynamic Programming', 'Problems requiring dynamic programming solutions'),
('Graph Theory', 'Graph algorithms and traversal problems'),
('Mathematics', 'Mathematical and number theory problems'),
('Data Structures', 'Problems involving various data structures'),
('Sorting and Searching', 'Sorting algorithms and search techniques'),
('Greedy Algorithms', 'Problems solvable with greedy approach');

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_execution_time', '5000', 'Maximum execution time in milliseconds'),
('max_memory_usage', '512', 'Maximum memory usage in MB'),
('max_source_code_length', '65535', 'Maximum source code length in characters'),
('judge_queue_limit', '100', 'Maximum number of submissions in judge queue'),
('session_timeout', '7200', 'Session timeout in seconds'),
('max_submissions_per_minute', '10', 'Rate limiting for submissions');

-- Create default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@codeplatform.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    COUNT(DISTINCT s.problem_id) as problems_solved,
    COUNT(s.id) as total_submissions,
    COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) as accepted_submissions,
    ROUND((COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) * 100.0 / COUNT(s.id)), 2) as success_rate,
    SUM(CASE WHEN s.status = 'Accepted' THEN s.score ELSE 0 END) as total_score
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.username, u.full_name;

-- Problem statistics view
CREATE VIEW problem_stats AS
SELECT 
    p.id,
    p.title,
    p.difficulty,
    pc.name as category_name,
    COUNT(s.id) as total_submissions,
    COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) as accepted_submissions,
    COUNT(DISTINCT s.user_id) as unique_solvers,
    ROUND((COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) * 100.0 / COUNT(s.id)), 2) as acceptance_rate
FROM problems p
LEFT JOIN problem_categories pc ON p.category_id = pc.id
LEFT JOIN submissions s ON p.id = s.problem_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.title, p.difficulty, pc.name;