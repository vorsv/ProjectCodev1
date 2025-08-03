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
        // Check if user exists
        $check_query = "SELECT id FROM users WHERE username = :username OR email = :email";
        $check_stmt = $this->db->prepare($check_query);
        $check_stmt->bindParam(":username", $username);
        $check_stmt->bindParam(":email", $email);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            return false; // User already exists
        }

        // Create new user
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

    public function requireLogin() {
        if (!$this->isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit();
        }
    }

    public function getCurrentUser() {
        if ($this->isLoggedIn()) {
            return [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'role' => $_SESSION['role'],
                'full_name' => $_SESSION['full_name']
            ];
        }
        return null;
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