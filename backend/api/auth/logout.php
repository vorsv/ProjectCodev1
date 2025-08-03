<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';
require_once '../../includes/auth.php';

$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

if ($auth->logout()) {
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Logout failed'
    ]);
}
?>