<?php
include 'connection.php';

if (isset($_POST['requestCollectionForm'])) {
    session_start();
    $user_id = $_SESSION['user_id'];
    $waste_type = $_POST['wasteType'];
    $weight = $_POST['weight'];
    $collection_address = $_POST['collectionAddress'];
    $collection_date = $_POST['collectionDate'];
    $preferred_time = $_POST['preferredTime'];
    $instruction = $_POST['instruction'];
    $payment_method = $_POST['paymentMethod'];
    $estimated_cost = ($weight * 20) + (($weight * 20) * 0.1);

    $stmt = $conn->prepare("INSERT INTO requests (user_id, waste_type, weight, collection_address, collection_date, preferred_time, instruction, payment_method, estimated_cost ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isdsssssd", $user_id, $waste_type, $weight, $collection_address, $collection_date, $preferred_time, $instruction, $payment_method, $estimated_cost);

    if ($stmt->execute()) {
        echo "Waste collection request submitted successfully.";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}

?>