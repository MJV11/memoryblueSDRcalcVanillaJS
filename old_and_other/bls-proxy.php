<?php
// bls-proxy.php - A proxy for the BLS API to avoid CORS issues

// Allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, BLS-API-KEY");

// Handle OPTIONS request (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the API key from the request headers if available
$headers = getallheaders();
$apiKey = isset($headers['BLS-API-KEY']) ? $headers['BLS-API-KEY'] : '';

// Get POST data
$postData = file_get_contents('php://input');
$decodedData = json_decode($postData, true);

// Add API key to the request if it exists
if (!empty($apiKey) && isset($decodedData)) {
    $decodedData['registrationKey'] = $apiKey;
    $postData = json_encode($decodedData);
}

// Set up the request to BLS API
$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $postData
    ]
];

// Make the request
$context = stream_context_create($options);
$result = @file_get_contents('https://api.bls.gov/publicAPI/v2/timeseries/data/', false, $context);

// Check for errors
if ($result === FALSE) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch data from BLS API']);
} else {
    // Return the API response
    header('Content-Type: application/json');
    echo $result;
}
?>