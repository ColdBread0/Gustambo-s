<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "db.php";

// Devolver TODAS las reseñas sin filtrar
// Cada panel decidirá qué mostrar (admin muestra todas, usuarios solo visibles)
$sql = "SELECT * FROM reviews ORDER BY created_at DESC";
$result = $conn->query($sql);

$resenas = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $resenas[] = $row;
    }
}

echo json_encode($resenas);
?>