<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['propuesta'])) {
    $_SESSION['propuesta'] = [];
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'add':
        $id = intval($_GET['id']);
        $sql = "SELECT p.id, p.nombre, t.nombre AS tipo, p.tarifa
                FROM producto p
                LEFT JOIN tipo t ON p.tipo_id = t.id
                WHERE p.id = $id";
        $res = $conn->query($sql);
        if ($res && $res->num_rows) {
            $prod = $res->fetch_assoc();
            $_SESSION['propuesta'][$prod['id']] = $prod;
        }
        echo json_encode(array_values($_SESSION['propuesta']));
        break;

    case 'add_tipo':
        $tipo = intval($_GET['tipo']);
        $sql = "SELECT p.id, p.nombre, t.nombre AS tipo, p.tarifa
                FROM producto p
                LEFT JOIN tipo t ON p.tipo_id = t.id
                WHERE p.tipo_id = $tipo";
        $res = $conn->query($sql);
        while ($row = $res->fetch_assoc()) {
            $_SESSION['propuesta'][$row['id']] = $row;
        }
        echo json_encode(array_values($_SESSION['propuesta']));
        break;

    case 'remove':
        $id = intval($_GET['id']);
        unset($_SESSION['propuesta'][$id]);
        echo json_encode(array_values($_SESSION['propuesta']));
        break;

    case 'clear':
        $_SESSION['propuesta'] = [];
        echo json_encode([]);
        break;

    case 'list':
    default:
        echo json_encode(array_values($_SESSION['propuesta']));
        break;
}
?>
