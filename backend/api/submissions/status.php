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
    echo json_encode(['error' => 'Submission ID required']);
    exit();
}

$submission_id = (int)$_GET['id'];

try {
    $query = "SELECT s.*, p.title as problem_title, l.name as language_name
              FROM submissions s
              JOIN problems p ON s.problem_id = p.id
              JOIN languages l ON s.language_id = l.id
              WHERE s.id = :id AND s.user_id = :user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $submission_id);
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();
    
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$submission) {
        http_response_code(404);
        echo json_encode(['error' => 'Submission not found']);
        exit();
    }
    
    // Simulate judging for demo purposes
    if ($submission['status'] === 'Pending') {
        // Update status to simulate judging
        $random_status = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'][array_rand(['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'])];
        $random_score = $random_status === 'Accepted' ? 100 : 0;
        $random_time = rand(50, 1000);
        
        $update_query = "UPDATE submissions SET status = :status, score = :score, execution_time = :time, judged_at = NOW() WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':status', $random_status);
        $update_stmt->bindParam(':score', $random_score);
        $update_stmt->bindParam(':time', $random_time);
        $update_stmt->bindParam(':id', $submission_id);
        $update_stmt->execute();
        
        $submission['status'] = $random_status;
        $submission['score'] = $random_score;
        $submission['execution_time'] = $random_time;
    }
    
    echo json_encode($submission);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch submission status']);
}
?>