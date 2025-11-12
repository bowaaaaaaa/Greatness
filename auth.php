<?php
include 'connection.php';

if (isset($_POST['registerForm'])) {
    $fullName = $_POST['fullName'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $accountType = $_POST['accountType'];
    $location = $_POST['location'];

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo "Email already registered.";
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, account_type, location) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $fullName, $email, $password, $accountType, $location);

    if ($stmt->execute()) {
        echo "Registration successful.";
        exit;
    } else {
        echo "Registration failed.";
    }

    exit;
}


if (isset($_POST['loginForm'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password, account_type FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $hashedPassword, $accountType);
        $stmt->fetch();

        if($hashedPassword === null || $hashedPassword === '') {
            echo "Invalid password.";
            $stmt->close();
            exit;
        }
        if (password_verify($password, $hashedPassword)) {
            session_start();
            session_regenerate_id(true);
            $_SESSION['user_id'] = $id;
            $_SESSION['email'] = $email;
            $_SESSION['account_type'] = trim((string)$accountType);
            header("Location: dashboard.php");
            exit;
        } else {
            echo "Invalid password.";
        }
    } else {
        echo "No user found with that email.";
    }

    $stmt->close();
    $conn->close();
    exit;
}

echo "Invalid request.";
?>
