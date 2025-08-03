<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed!");
}

// Create sample problems
$problems = [
    [
        'title' => 'Two Sum',
        'slug' => 'two-sum',
        'description' => 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.',
        'input_format' => 'First line contains n (number of elements) and target.
Second line contains n space-separated integers.',
        'output_format' => 'Two space-separated integers representing the indices.',
        'constraints' => '2 ≤ n ≤ 10^4
-10^9 ≤ nums[i] ≤ 10^9
-10^9 ≤ target ≤ 10^9',
        'difficulty' => 'Easy',
        'time_limit' => 1000,
        'memory_limit' => 256,
        'category_id' => 1
    ],
    [
        'title' => 'Palindrome Check',
        'slug' => 'palindrome-check',
        'description' => 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.

Note: For the purpose of this problem, we define empty string as valid palindrome.',
        'input_format' => 'A single line containing a string.',
        'output_format' => 'Print "YES" if the string is a palindrome, "NO" otherwise.',
        'constraints' => '1 ≤ length ≤ 10^5',
        'difficulty' => 'Easy',
        'time_limit' => 1000,
        'memory_limit' => 256,
        'category_id' => 2
    ],
    [
        'title' => 'Binary Search',
        'slug' => 'binary-search',
        'description' => 'Given a sorted array of integers and a target value, implement binary search to find the index of the target value.

If the target is not found, return -1.',
        'input_format' => 'First line contains n (size of array) and target.
Second line contains n sorted integers.',
        'output_format' => 'Index of target element (0-based) or -1 if not found.',
        'constraints' => '1 ≤ n ≤ 10^5
-10^9 ≤ array[i] ≤ 10^9
-10^9 ≤ target ≤ 10^9',
        'difficulty' => 'Medium',
        'time_limit' => 2000,
        'memory_limit' => 512,
        'category_id' => 7
    ],
    [
        'title' => 'Fibonacci Sequence',
        'slug' => 'fibonacci-sequence',
        'description' => 'Calculate the nth Fibonacci number using dynamic programming.

The Fibonacci sequence is defined as:
F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2) for n > 1',
        'input_format' => 'A single integer n.',
        'output_format' => 'The nth Fibonacci number.',
        'constraints' => '0 ≤ n ≤ 50',
        'difficulty' => 'Medium',
        'time_limit' => 1000,
        'memory_limit' => 256,
        'category_id' => 3
    ],
    [
        'title' => 'Graph DFS',
        'slug' => 'graph-dfs',
        'description' => 'Given an undirected graph, perform Depth-First Search (DFS) starting from vertex 0.

Print the vertices in the order they are visited.',
        'input_format' => 'First line contains n (number of vertices) and m (number of edges).
Next m lines contain two integers u and v representing an edge.',
        'output_format' => 'Space-separated vertices in DFS order.',
        'constraints' => '1 ≤ n ≤ 1000
0 ≤ m ≤ n*(n-1)/2',
        'difficulty' => 'Hard',
        'time_limit' => 3000,
        'memory_limit' => 512,
        'category_id' => 4
    ]
];

// Get admin user ID
$admin_query = "SELECT id FROM users WHERE role = 'admin' LIMIT 1";
$admin_stmt = $db->prepare($admin_query);
$admin_stmt->execute();
$admin = $admin_stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    die("No admin user found! Please create an admin user first.");
}

$admin_id = $admin['id'];

foreach ($problems as $problem) {
    // Insert problem
    $query = "INSERT INTO problems (title, slug, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, category_id, created_by) 
              VALUES (:title, :slug, :description, :input_format, :output_format, :constraints, :difficulty, :time_limit, :memory_limit, :category_id, :created_by)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':title', $problem['title']);
    $stmt->bindParam(':slug', $problem['slug']);
    $stmt->bindParam(':description', $problem['description']);
    $stmt->bindParam(':input_format', $problem['input_format']);
    $stmt->bindParam(':output_format', $problem['output_format']);
    $stmt->bindParam(':constraints', $problem['constraints']);
    $stmt->bindParam(':difficulty', $problem['difficulty']);
    $stmt->bindParam(':time_limit', $problem['time_limit']);
    $stmt->bindParam(':memory_limit', $problem['memory_limit']);
    $stmt->bindParam(':category_id', $problem['category_id']);
    $stmt->bindParam(':created_by', $admin_id);
    
    if ($stmt->execute()) {
        $problem_id = $db->lastInsertId();
        echo "Created problem: {$problem['title']} (ID: {$problem_id})\n";
        
        // Add sample test cases based on problem type
        $test_cases = [];
        
        switch ($problem['slug']) {
            case 'two-sum':
                $test_cases = [
                    ['input' => "4 9\n2 7 11 15", 'output' => "0 1", 'is_sample' => 1],
                    ['input' => "3 6\n3 2 4", 'output' => "1 2", 'is_sample' => 1],
                    ['input' => "2 6\n3 3", 'output' => "0 1", 'is_sample' => 0]
                ];
                break;
                
            case 'palindrome-check':
                $test_cases = [
                    ['input' => "racecar", 'output' => "YES", 'is_sample' => 1],
                    ['input' => "hello", 'output' => "NO", 'is_sample' => 1],
                    ['input' => "A man a plan a canal Panama", 'output' => "YES", 'is_sample' => 0]
                ];
                break;
                
            case 'binary-search':
                $test_cases = [
                    ['input' => "5 3\n1 2 3 4 5", 'output' => "2", 'is_sample' => 1],
                    ['input' => "5 6\n1 2 3 4 5", 'output' => "-1", 'is_sample' => 1],
                    ['input' => "1 1\n1", 'output' => "0", 'is_sample' => 0]
                ];
                break;
                
            case 'fibonacci-sequence':
                $test_cases = [
                    ['input' => "0", 'output' => "0", 'is_sample' => 1],
                    ['input' => "1", 'output' => "1", 'is_sample' => 1],
                    ['input' => "10", 'output' => "55", 'is_sample' => 0]
                ];
                break;
                
            case 'graph-dfs':
                $test_cases = [
                    ['input' => "4 4\n0 1\n0 2\n1 3\n2 3", 'output' => "0 1 3 2", 'is_sample' => 1],
                    ['input' => "3 2\n0 1\n1 2", 'output' => "0 1 2", 'is_sample' => 1],
                    ['input' => "5 0", 'output' => "0", 'is_sample' => 0]
                ];
                break;
        }
        
        // Insert test cases
        foreach ($test_cases as $test_case) {
            $test_query = "INSERT INTO test_cases (problem_id, input, expected_output, is_sample) 
                          VALUES (:problem_id, :input, :expected_output, :is_sample)";
            
            $test_stmt = $db->prepare($test_query);
            $test_stmt->bindParam(':problem_id', $problem_id);
            $test_stmt->bindParam(':input', $test_case['input']);
            $test_stmt->bindParam(':expected_output', $test_case['output']);
            $test_stmt->bindParam(':is_sample', $test_case['is_sample']);
            $test_stmt->execute();
        }
        
        echo "  Added " . count($test_cases) . " test cases\n";
    }
}

echo "\nSample problems created successfully!\n";
echo "You can now access the problems in your platform.\n";
?>