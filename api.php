// api.php (Example for fetching users)

<?php
header('Content-Type: application/json');
// Optional: Allow cross-origin requests from your local server
header('Access-Control-Allow-Origin: http://127.0.0.1:5500'); 

$servername = "localhost";
$username = "root"; // Use your actual database username
$password = "";     // Use your actual database password
$dbname = "your_database_name"; 

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Simple query
$sql = "SELECT id, name, email FROM users";
$result = $conn->query($sql);

$data = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

// Output the result as JSON
echo json_encode($data);

$conn->close();
?>
