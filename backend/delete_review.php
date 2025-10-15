<?php
// Headers para CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db.php";

// Debug completo
error_log("=== DELETE REVIEW DEBUG ===");
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));
error_log("Raw input: " . file_get_contents('php://input'));

// Verificar múltiples formas de recibir el ID
$id = null;

// Método 1: POST normal
if (isset($_POST['id']) && !empty($_POST['id'])) {
    $id = $_POST['id'];
    error_log("ID encontrado en POST: " . $id);
}

// Método 2: Si viene como JSON
if (!$id) {
    $json = json_decode(file_get_contents('php://input'), true);
    if (isset($json['id'])) {
        $id = $json['id'];
        error_log("ID encontrado en JSON: " . $id);
    }
}

// Método 3: GET (para pruebas)
if (!$id && isset($_GET['id'])) {
    $id = $_GET['id'];
    error_log("ID encontrado en GET: " . $id);
}

// Si no se encontró ID
if (!$id) {
    $response = [
        'status' => 'error',
        'message' => 'ID de reseña no proporcionado',
        'debug_info' => [
            'post_data' => $_POST,
            'get_data' => $_GET,
            'raw_input' => file_get_contents('php://input'),
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'no set'
        ]
    ];
    echo json_encode($response);
    exit;
}

$id = intval($id);

// Verificar conexión a base de datos
if (!$conn) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de conexión a base de datos'
    ]);
    exit;
}

try {
    // Tu código original pero con mejor manejo de errores
    $sql = "DELETE FROM reviews WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error preparando consulta: ' . $conn->error
        ]);
        exit;
    }
    
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Reseña eliminada correctamente'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'No se encontró la reseña con ID: ' . $id
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al ejecutar consulta: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Excepción: ' . $e->getMessage()
    ]);
}

$conn->close();
?>