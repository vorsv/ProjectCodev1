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

try {
    $query = "SELECT p.id, p.title, p.difficulty, p.time_limit, p.memory_limit, 
                     p.description, pc.name as category_name,
                     COUNT(s.id) as total_submissions,
                     COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) as accepted_submissions
              FROM problems p 
              LEFT JOIN problem_categories pc ON p.category_id = pc.id
              LEFT JOIN submissions s ON p.id = s.problem_id
              WHERE p.is_active = 1 
              GROUP BY p.id, p.title, p.difficulty, p.time_limit, p.memory_limit, p.description, pc.name
              ORDER BY p.id";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $problems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'problems' => $problems
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch problems']);
}
?>