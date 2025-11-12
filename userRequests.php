<?php
session_start();
include 'connection.php';

if (!isset($_SESSION['email']) || !isset($_SESSION['account_type'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit();
}

$email = $_SESSION['email'];
$accountType = trim((string)$_SESSION['account_type']);

$userStmt = $conn->prepare("SELECT id, location FROM users WHERE email = ?");
$userStmt->bind_param("s", $email);
$userStmt->execute();
$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();
$userStmt->close();

if (!$user) {
    echo json_encode(['error' => 'User not found']);
    exit();
}

$userId = $user['id'];
$userLocation = $user['location'];

if ($accountType === 'collector') {
    $stmt = $conn->prepare("SELECT id, user_id, status, weight, created_at FROM collection_requests WHERE location = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $userLocation);
} else {
    $stmt = $conn->prepare("SELECT id, user_id, status, weight, created_at FROM collection_requests WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
}

$stmt->execute();
$result = $stmt->get_result();

$requests = [];
$counts = [
    'total' => 0,
    'pending' => 0,
    'completed' => 0
];

while ($row = $result->fetch_assoc()) {
    $requests[] = $row;
    $counts['total']++;
    if ($row['status'] === 'pending') $counts['pending']++;
    if ($row['status'] === 'completed') $counts['completed']++;
}

$stmt->close();
$conn->close();

echo json_encode([
    'counts' => $counts,
    'requests' => $requests
]);
?>
