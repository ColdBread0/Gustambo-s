<?php
// ============================================
// CORS HEADERS (deben ir antes de cualquier salida)
// ============================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Responder preflight (solicitudes OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================
// CONEXIÓN A LA BASE DE DATOS
// ============================================
require_once "db.php";

// ============================================
// PROCESAR LA SOLICITUD PARA MOSTRAR
// ============================================
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    echo json_encode([
        "success" => false, 
        "message" => "ID de reseña requerido"
    ]);
    exit();
}

$id = intval($data->id);

// Actualizar para MOSTRAR (visible = 1)
$sql = "UPDATE reviews SET visible = 1 WHERE id = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Reseña mostrada correctamente",
            "visible" => 1
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "No se encontró la reseña o ya está visible"
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Error al preparar la consulta: " . $conn->error
    ]);
}

$conn->close();
?>