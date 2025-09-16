<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"));
if (!isset($data->id)) {
    echo json_encode(["success" => false, "message" => "ID de reseña requerido"]);
    exit();
}
$id = intval($data->id);

$sql = "DELETE FROM reviews WHERE id = ?";
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("i", $id);
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "No se encontró la reseña"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Error en la consulta"]);
}
$conn->close();
