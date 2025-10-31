<?php
require_once __DIR__ . '/functions/functions.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'countries':
        echo json_encode(get_countries());
        break;
    case 'country_by_id':
        $id = $_GET;
        echo json_encode(get_country_by_id($id));
        break;
    case 'insert-country':
        echo json_encode(insert_country());
        break;
    case 'update_country':
        echo json_encode(update_country());
        break;
    case 'delete_country':
        echo json_encode(update_country());
        break;

    case 'regions':
        echo json_encode(get_regions());
        break;
    case 'insert_region':
        echo json_encode(insert_region());
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
    case 'category':
        echo json_encode(get_category());
        break;
    case 'vintage':
        echo json_encode(get_vintages());
        break;
    case 'products':
        $filters = $_POST + $_GET;
        unset($filters['action']);
        echo json_encode(get_products($filters));
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

?>