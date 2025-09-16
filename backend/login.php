<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST,GET,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include "db.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Leer datos del POST
$data = json_decode(file_get_contents("php://input"));

// Validación de campos
if (!isset($data->username) || !isset($data->password)) {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos: username o password"
    ]);
    http_response_code(400);
    exit();
}

$username = $data->username;
$password = md5($data->password); // solo para pruebas escolares

// Consulta segura
$sql = "SELECT * FROM usuario2 WHERE username = ? AND password = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en la preparación de la consulta"
    ]);
    http_response_code(500);
    exit();
}

$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode([
        "success" => true,
        "message" => "Login correcto",
        "rol" => $user["rol"],
        "id" => $user["id"],
        "info" => $user
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Usuario o contraseña incorrectos"
    ]);
}

$stmt->close();
$conn->close();
?>
