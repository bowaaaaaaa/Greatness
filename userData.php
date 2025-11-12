<?php
session_start();
include 'connection.php';

if (!isset($_SESSION['email']) || !isset($_SESSION['account_type'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit();
}

$accountType = trim($_SESSION['account_type']);
$email = $_SESSION['email'];

// Get user info
$userStmt = $conn->prepare("SELECT id, location FROM users WHERE email = ?");
$userStmt->bind_param("s", $email);
$userStmt->execute();
$userResult = $userStmt->get_result();
$currentUser = $userResult->fetch_assoc();
$userStmt->close();

if (!$currentUser) {
    echo json_encode(['error' => 'User not found']);
    exit();
}

// Get collection requests
$requestsStmt = $conn->prepare("SELECT * FROM collection_requests");
$requestsStmt->execute();
$requestsResult = $requestsStmt->get_result();
$collectionRequests = $requestsResult->fetch_all(MYSQLI_ASSOC);
$requestsStmt->close();

// Get waste records
$wasteStmt = $conn->prepare("SELECT * FROM waste_records");
$wasteStmt->execute();
$wasteResult = $wasteStmt->get_result();
$wasteRecords = $wasteResult->fetch_all(MYSQLI_ASSOC);
$wasteStmt->close();

// Get users (for admin statistics)
$usersStmt = $conn->prepare("SELECT * FROM users");
$usersStmt->execute();
$usersResult = $usersStmt->get_result();
$users = $usersResult->fetch_all(MYSQLI_ASSOC);
$usersStmt->close();

$conn->close();

echo json_encode([
    'currentUser' => $currentUser,
    'accountType' => $accountType,
    'collectionRequests' => $collectionRequests,
    'wasteRecords' => $wasteRecords,
    'users' => $users
]);
