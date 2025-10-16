<?php
require_once __DIR__ . '/functions/functions.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'countries':
        echo json_encode(get_countries());
        break;
    case 'regions':
        echo json_encode(get_regions());
        break;
    case 'denominations':
        echo json_encode(get_denominations());
        break;
    case 'suppliers':
        echo json_encode(get_suppliers());
        break;
    case 'wineries':
        echo json_encode(get_wineries());
        break;
    case 'type':
        echo json_encode(get_types());
        break;
    case 'subtype':
        $id_type = isset($_GET['id_type']) ? (int) $_GET['id_type'] : null;
        echo json_encode(get_subtype($id_type));
        break;
    case 'products':
        $filters = $_GET;
        unset($filters['action']);
        echo json_encode(get_products($filters));
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

?>