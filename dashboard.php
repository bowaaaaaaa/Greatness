<?php
    session_start();
    include 'connection.php';
?>  

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="dashboard" id="dashboard">
        <div class="dashboard-header">
            <h2 id="dashboardTitle">Dashboard</h2>
            <p style="font-weight: 500;" id="dashboardSubTitle">Hello, 
                <?php 
                    if(isset($_SESSION['email'])) {
                        $email = $_SESSION['email'];

                        $query=mysqli_query($conn, "SELECT full_name FROM users WHERE email = '$email'");
                        if($row=mysqli_fetch_array($query)) {
                            echo htmlspecialchars($row["full_name"]);
                        } else {
                            echo "User";
                        }
                    } else {
                        echo "User";
                    }
                ?>
            </p>

            <button class="btn btn-secondary" id="logoutBtn">Logout</button>
        </div>
        <div class="dashboard-content">
            <div class="tabs" id="dashboardTabs">
                <!-- Tabs will be dynamically generated based on user type -->
            </div>
            <div id="dashboardContent">
                <!-- Content will be dynamically generated based on selected tab -->
            </div>
        </div>
    </div>
    <script>
        const accountType = "<?php echo isset($_SESSION['account_type']) ? $_SESSION['account_type'] : ''; ?>";
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.location.href = 'logout.php';
        });
        
    </script>
    <script src="script.js"></script>
</body>
</html>