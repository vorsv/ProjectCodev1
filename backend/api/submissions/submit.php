<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
$required_fields = ['problem_id', 'language_id', 'source_code'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: {$field}"]);
        exit();
    }
}

// Validate source code length
if (strlen($input['source_code']) > 65535) {
    http_response_code(400);
    echo json_encode(['error' => 'Source code too long']);
    exit();
}

try {
    // Check if problem exists and is active
    $problem_query = "SELECT id FROM problems WHERE id = :problem_id AND is_active = 1";
    $problem_stmt = $db->prepare($problem_query);
    $problem_stmt->bindParam(":problem_id", $input['problem_id']);
    $problem_stmt->execute();

    if ($problem_stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Problem not found']);
        exit();
    }

    // Check if language exists and is active
    $language_query = "SELECT id FROM languages WHERE id = :language_id AND is_active = 1";
    $language_stmt = $db->prepare($language_query);
    $language_stmt->bindParam(":language_id", $input['language_id']);
    $language_stmt->execute();

    if ($language_stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Language not found']);
        exit();
    }

    // Insert submission
    $query = "INSERT INTO submissions (user_id, problem_id, language_id, source_code) 
              VALUES (:user_id, :problem_id, :language_id, :source_code)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $_SESSION['user_id']);
    $stmt->bindParam(":problem_id", $input['problem_id']);
    $stmt->bindParam(":language_id", $input['language_id']);
    $stmt->bindParam(":source_code", $input['source_code']);
    
    if ($stmt->execute()) {
        $submission_id = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'submission_id' => $submission_id,
            'message' => 'Submission received and queued for judging'
        ]);
        
        // In a real implementation, you would add this to a judge queue
        // For now, we'll simulate judging by updating the status after a delay
        
    } else {
        throw new Exception('Failed to save submission');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>