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

// Validate required fields
$required_fields = ['username', 'email', 'password', 'full_name'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: {$field}"]);
        exit();
    }
}

// Validate input
$username = trim($input['username']);
$email = trim($input['email']);
$password = $input['password'];
$full_name = trim($input['full_name']);

// Basic validation
if (strlen($username) < 3 || strlen($username) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'Username must be between 3 and 50 characters']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

$auth = new Auth($db);

if ($auth->register($username, $email, $password, $full_name)) {
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! You can now login.'
    ]);
} else {
    http_response_code(409);
    echo json_encode(['error' => 'Username or email already exists']);
}
?>