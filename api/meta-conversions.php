<?php
// Meta Conversions API - PHP Implementation
// Para usar con servidores PHP

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Obtener datos del request
$input = json_decode(file_get_contents('php://input'), true);

// Validar datos requeridos
if (!isset($input['pixel_id']) || !isset($input['event_name']) || !isset($input['access_token'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

$pixel_id = $input['pixel_id'];
$event_name = $input['event_name'];
$event_data = $input['event_data'];
$access_token = $input['access_token'];

// Obtener IP del cliente
$client_ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'unknown';
$event_data['user_data']['client_ip_address'] = $client_ip;

// Preparar payload para Meta
$meta_payload = [
    'data' => [[
        'event_name' => $event_name,
        'event_time' => $event_data['event_time'],
        'event_source_url' => $event_data['event_source_url'],
        'action_source' => $event_data['action_source'],
        'user_data' => $event_data['user_data'],
        'custom_data' => $event_data['custom_data'] ?? []
    ]]
];

// Enviar a Meta Conversions API
$url = "https://graph.facebook.com/v18.0/{$pixel_id}/events";
$post_data = json_encode($meta_payload);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    echo json_encode(['success' => true, 'response' => json_decode($response, true)]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send event to Meta Conversions API', 'response' => $response]);
}
?>
