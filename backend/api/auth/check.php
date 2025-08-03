<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';
require_once '../../includes/auth.php';

$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

if ($auth->isLoggedIn()) {
    echo json_encode([
        'authenticated' => true,
        'user' => $auth->getCurrentUser()
    ]);
} else {
    echo json_encode([
        'authenticated' => false
    ]);
}
?>