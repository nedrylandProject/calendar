<?php
// Include your database connection details
include('db.php');


function sendSMS($phon,$smsmessage)
{

        $budgetsms="578f5648d7db40320fb963dda5ecb05b";
        //$user = $_SESSION["jpos"];
        $phon = "00421908888866";
        
        
		$api_url = 'https://api.budgetsms.net/sendsms/';
		
		if($smsmessage!='' && $phon!='') {


		// API key and other parameters
		$username = 'zemkcomsms';
		$userid = '18842';
		$handle = $budgetsms; // handle set in credentials file
		//$phone_number = '00421908888866';
		$phone_number = $phon;
		//$from = '00421951023045';
		$from = 'CALI';

		// Create an array with the data you want to send
		$data = array(
			'username' => $username,
			'userid' => $userid,
			'handle' => $handle,
			'to' => $phone_number,
			'msg' => $smsmessage,
			'from' => $from
		);

		// Initialize cURL session
		$ch = curl_init();

		// Set cURL options
		curl_setopt($ch, CURLOPT_URL, $api_url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		// Execute the cURL session and store the result in $response
		$response = curl_exec($ch);

		// Check for cURL errors
		if (curl_errno($ch)) {
			echo 'cURL error: ' . curl_error($ch);
		}

		// Close the cURL session
		curl_close($ch);

		// Output the API response
		return 'API Response: ' . $response . '\n';
		

		} else 
		    { 
		           return "API Response: No USER, Number or Oncall./n";
		        
		    }
}


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check the request method
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle saving or deleting the day color
    $year = $_POST['year'];
    $month = $_POST['month'];
    $day = $_POST['day'];
    $userClass = $_POST['userClass'];

    // Check if the user wants to remove a color
    if (strpos($userClass, '-') === 0) {
        $userClass = substr($userClass, 1); // Remove the leading '-'
        $sql = "DELETE FROM event_users WHERE event_id IN (
                SELECT id FROM calendar_events WHERE year = '$year' AND month = '$month' AND day = '$day'
            ) AND user_class = '$userClass'";
    } else {
        // Check if the event already exists
        $sql = "SELECT id FROM calendar_events WHERE year = '$year' AND month = '$month' AND day = '$day'";
        $result = $conn->query($sql);
        
        if ($result->num_rows > 0) {
            // Event exists, get its id
            $row = $result->fetch_assoc();
            $eventId = $row['id'];
        } else {
            // Event doesn't exist, create it
            $sql = "INSERT INTO calendar_events (year, month, day) VALUES ('$year', '$month', '$day')";
            if ($conn->query($sql) === TRUE) {
                $eventId = $conn->insert_id;
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
                exit;
            }
			
			
        }

        // Insert or update the user_class in event_users table
        $sql = "INSERT INTO event_users (event_id, user_class) VALUES ('$eventId', '$userClass')
                ON DUPLICATE KEY UPDATE user_class='$userClass'";
    }

    if ($conn->query($sql) === TRUE) {
        echo "Record updated successfully";
		
		sendSMS("number","User " . $userClass . " just made update on ".$day.".".$month.".");
		
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    // Handle fetching the calendar data
    $sql = "SELECT e.year, e.month, e.day, u.user_class 
            FROM calendar_events e
            JOIN event_users u ON e.id = u.event_id";
    $result = $conn->query($sql);
    $events = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
    }

    echo json_encode($events);
}

$conn->close();





?>