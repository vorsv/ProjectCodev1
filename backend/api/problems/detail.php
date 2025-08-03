<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';
require_once '../../includes/auth.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

$auth = new Auth($db);
$auth->requireLogin();

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Problem ID required']);
    exit();
}

$problem_id = (int)$_GET['id'];

try {
    $query = "SELECT p.*, pc.name as category_name 
              FROM problems p 
              LEFT JOIN problem_categories pc ON p.category_id = pc.id
              WHERE p.id = :id AND p.is_active = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $problem_id);
    $stmt->execute();
    
    $problem = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$problem) {
        http_response_code(404);
        echo json_encode(['error' => 'Problem not found']);
        exit();
    }
    
    // Get sample test cases
    $test_query = "SELECT input, expected_output FROM test_cases 
                   WHERE problem_id = :id AND is_sample = 1 
                   ORDER BY id LIMIT 3";
    
    $test_stmt = $db->prepare($test_query);
    $test_stmt->bindParam(':id', $problem_id);
    $test_stmt->execute();
    
    $sample_cases = $test_stmt->fetchAll(PDO::FETCH_ASSOC);
    $problem['sample_cases'] = $sample_cases;
    
    echo json_encode([
        'success' => true,
        'problem' => $problem
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch problem details']);
}
?>