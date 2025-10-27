<?php
require_once __DIR__ . '/../db/connection.php';

/**
 * Obtener todos los países
 */
function get_countries() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM country ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

/* Obtener todas las regiones */
function get_regions() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM region ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

function get_category() {
    $pdo = Conectiondb();

    try {
        $stmt = $pdo->query("SELECT id, name, description, parent_id FROM category");
        $types = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convertir a un árbol
        $tree = build_type_tree($types);

        return $tree;

    } catch (PDOException $e) {
        return [];
    }
}

// Función recursiva para construir el árbol jerárquico
function build_type_tree($types, $parent_id = null) {
    $branch = [];

    foreach ($types as $type) {
        if ($type['parent_id'] == $parent_id) {
            $children = build_type_tree($types, $type['id']);
            if ($children) {
                $type['children'] = $children;
            } else {
                $type['children'] = [];
            }
            $branch[] = $type;
        }
    }

    // Orden alfabético opcional
    usort($branch, fn($a, $b) => strcmp($a['name'], $b['name']));

    return $branch;
}

/**
 * Obtener todas las denominaciones
 */
function get_denominations() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM denomination ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

/**
 * Obtener todos los proveedores
 */
function get_suppliers() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM supplier ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

/**
 * Obtener todas las bodegas (wineries)
 */
function get_wineries() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM winery ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

/*
 * Filtrar productos según uno o varios parámetros
 * Ejemplo: get_products(['type_id' => 2, 'denomination_id' => 5]);
 *
 */

function get_products($filters = []) {
    $pdo = Conectiondb();

    $query = "SELECT p.* FROM product p";
    $conditions = [];
    $params = [];

    // Join si filtramos por proveedor
    if (isset($filters['supplier_id'])) {
        $query .= " INNER JOIN product_supplier ps ON ps.product_id = p.id";
        $conditions[] = "ps.supplier_id = :supplier_id";
        $params[':supplier_id'] = $filters['supplier_id'];
    }

    // Filtros directos sobre producto
    $map = [
        'type_id' => 'p.type_id',
        'denomination_id' => 'p.denomination_id',
        'winery_id' => 'p.winery_id',
        'vintage_id' => 'p.vintage_id'
    ];

    foreach ($map as $key => $column) {
        if (isset($filters[$key])) {
            $conditions[] = "$column = :$key";
            $params[":$key"] = $filters[$key];
        }
    }

    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
?>
