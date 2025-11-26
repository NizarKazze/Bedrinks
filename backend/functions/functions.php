<?php
require_once __DIR__ . '/../db/connection.php';

/* =========== Country ============= */

function get_countries() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM country ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

function get_country_by_id() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $id = $input['id'] ?? null;

    try {
        $stmt = $pdo->prepare("SELECT * FROM country WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return null;
    }
}

function delete_country($id, $force = false) {
    $pdo = Conectiondb();
    try {
        $check = $pdo->prepare("SELECT COUNT(*) FROM region WHERE country_id = :id");
        $check->execute([':id' => $id]);
        $count = $check->fetchColumn();

        if ($count > 0 && !$force) {
            return ['warning' => "There are $count regions linked to this country. Use force = true to delete them as well."];
        }

        if ($count > 0 && $force) {
            $pdo->prepare("DELETE FROM region WHERE country_id = :id")->execute([':id' => $id]);
        }

        $pdo->prepare("DELETE FROM country WHERE id = :id")->execute([':id' => $id]);
        return true;
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function insert_country() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $name = trim($input['name'] ?? '');
    $description = $input['description'] ?? null;

    if (empty($name)) {
        return ['error' => 'Country name is required'];
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO country (name, description) VALUES (:name, :description)");
        $stmt->execute([':name' => $name, ':description' => $description]);
        return ['success' => true, 'id' => $pdo->lastInsertId()];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}


function update_country() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $id = $input['id'];
    $name = trim($input['name'] ?? '');
    $description = $input['description'] ?? null;

    try {
        $stmt = $pdo->prepare("UPDATE country SET name = :name, description = :description WHERE id = :id");
        $stmt->execute([':name' => $name, ':description' => $description, ':id' => $id]);
        return true;
    } catch (PDOException $e) { return ['error' => $e->getMessage()]; }
}



/* ============= Regions ============ */

function get_regions() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name FROM region ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

function insert_region() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $country_id = $input['country_id'] ?? null;
    $name = trim($input['name'] ?? '');
    $description = $input['description'] ?? null;

    if (empty($name)) {
        return ['error' => 'Region name is required'];
    }

    if (empty($country_id)) {
        return ['error' => 'Country ID is required'];
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO region (name, description, country_id) VALUES (:name, :description, :country_id)");
        $stmt->execute([
            ':name' => $name,
            ':description' => $description,
            ':country_id' => $country_id
        ]);
        return ['success' => true, 'id' => $pdo->lastInsertId()];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
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

function get_vintages() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT id, name, year FROM vintage ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

/**
 * get uvas
 */

 function get_grape($product_id){
    $pdo = Conectiondb();

    try {
        $stmt = $pdo->prepare("
            SELECT g.id, g.name
            FROM product_grape pg
            INNER JOIN grape g ON pg.grape_id = g.id
            WHERE pg.product_id = :product_id
        ");

        $stmt->execute(['product_id' => $product_id]);
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


 function get_products($filters = [], $order = []) {
    $pdo = Conectiondb();

    $query = "SELECT p.* FROM product p";
    $conditions = [];
    $params = [];

    // ========= FILTROS =========
    if (isset($filters['supplier_id'])) {
        $query .= " LEFT JOIN product_supplier ps ON ps.product_id = p.id";

        $supplierFilter = $filters['supplier_id'];

        if (is_array($supplierFilter)) {
            $supplierParamList = [];
            foreach ($supplierFilter as $index => $singleSupplier) {
                $paramName = ":supplier_" . $index;
                $supplierParamList[] = $paramName;
                $params[$paramName] = $singleSupplier;
            }
            $conditions[] = "ps.supplier_id IN (" . implode(',', $supplierParamList) . ")";
        } else {
            $conditions[] = "ps.supplier_id = :supplier_id";
            $params[':supplier_id'] = $supplierFilter;
        }
    }

    $map = [
        'category_id' => 'p.category_id',
        'denomination_id' => 'p.denomination_id',
        'winery_id' => 'p.winery_id',
        'vintage_id' => 'p.vintage_id',
    ];

    foreach ($map as $filterKey => $columnName) {
        if (isset($filters[$filterKey])) {
            $value = $filters[$filterKey];

            if (is_array($value)) {
                $paramList = [];
                foreach ($value as $i => $val) {
                    $paramName = ":${filterKey}_${i}";
                    $paramList[] = $paramName;
                    $params[$paramName] = $val;
                }
                $conditions[] = "$columnName IN (" . implode(',', $paramList) . ")";
            } else {
                $paramName = ":$filterKey";
                $conditions[] = "$columnName = $paramName";
                $params[$paramName] = $value;
            }
        }
    }

    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    // ========= ORDER =========
    $allowed = ['id', 'name', 'price', 'rating', 'iva', 'code', 'category_id'];
    $orderBy = 'p.id';
    $orderDir = 'ASC';

    if (isset($order['order_by']) && in_array($order['order_by'], $allowed)) {
        $orderBy = 'p.' . $order['order_by'];
    }

    if (isset($order['order_dir']) && strtoupper($order['order_dir']) === 'DESC') {
        $orderDir = 'DESC';
    }

    $query .= " ORDER BY $orderBy $orderDir";

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // =====================================================
        // AÑADIR UVAS Y PROMOCIONES DIRECTAMENTE A CADA PRODUCTO
        // =====================================================
        foreach ($products as &$product) {

            // ------ UVAS ------
            $stmtGrapes = $pdo->prepare("
                SELECT g.id, g.name
                FROM product_grape pg
                INNER JOIN grape g ON pg.grape_id = g.id
                WHERE pg.product_id = :pid
            ");
            $stmtGrapes->execute([':pid' => $product['id']]);
            $product['grape'] = $stmtGrapes->fetchAll(PDO::FETCH_ASSOC);

            // ------ PROMOCIONES ------
            $stmtPromo = $pdo->prepare("
                SELECT *
                FROM promotion
                WHERE product_id = :pid
                AND active = 1
                AND (start_date IS NULL OR start_date <= CURDATE())
                AND (end_date IS NULL OR end_date >= CURDATE())
            ");

            $stmtPromo->execute([':pid' => $product['id']]);
            $product['promotions'] = $stmtPromo->fetchAll(PDO::FETCH_ASSOC);
        }

        return [
            'filters' => $filters,
            'order' => $order,
            'products' => $products
        ];

    } catch (PDOException $e) {
        return [
            'error' => $e->getMessage()
        ];
    }
}

function search_by_name($table, $search) {
    $pdo = Conectiondb();

    $allowedTables = ['category', 'vintage', 'winery', 'supplier', 'product'];

    if (!in_array($table, $allowedTables)) {
        return json_encode(['error' => 'Tabla no permitida']);
    }

    $search = trim($search);
    $search = strtolower(remove_accents($search));

    try {
        $fields = ['name'];
        if ($table === 'product') {
            $fields = ['name', 'code', 'description', 'reference'];
        }

        $conditions = [];
        foreach ($fields as $field) {
            // utf8mb4 y usamos collation compatible
            $conditions[] = "REPLACE(LOWER(CONVERT($field USING utf8mb4)), ' ', '') COLLATE utf8mb4_unicode_ci LIKE REPLACE(:search, ' ', '')";
        }
        $where = implode(' OR ', $conditions);

        $columns = $table === 'product'
            ? '*'
            : '*';

        $sql = "SELECT $columns FROM $table WHERE $where ORDER BY name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':search' => '%' . $search . '%']);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return json_encode($results ?: [], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        return json_encode(['error' => $e->getMessage()]);
    }
}


function remove_accents($str) {
    $unwanted = [
        'Á'=>'A','À'=>'A','Â'=>'A','Ä'=>'A','á'=>'a','à'=>'a','ä'=>'a','â'=>'a',
        'É'=>'E','È'=>'E','Ê'=>'E','Ë'=>'E','é'=>'e','è'=>'e','ë'=>'e','ê'=>'e',
        'Í'=>'I','Ì'=>'I','Ï'=>'I','Î'=>'I','í'=>'i','ì'=>'i','ï'=>'i','î'=>'i',
        'Ó'=>'O','Ò'=>'O','Ö'=>'O','Ô'=>'O','ó'=>'o','ò'=>'o','ö'=>'o','ô'=>'o',
        'Ú'=>'U','Ù'=>'U','Ü'=>'U','Û'=>'U','ú'=>'u','ù'=>'u','ü'=>'u','û'=>'u',
        'Ñ'=>'N','ñ'=>'n','Ç'=>'C','ç'=>'c'
    ];
    return strtr($str, $unwanted);
}

function search_by_price_range() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $min_val = isset($input['min_val']) ? floatval($input['min_val']) : 0;
    $max_val = isset($input['max_val']) ? floatval($input['max_val']) : 999999;


    try {
        $stmt = $pdo->prepare("SELECT * FROM product WHERE price BETWEEN :min_val AND :max_val");

        $stmt->bindParam(':min_val', $min_val, PDO::PARAM_STR);
        $stmt->bindParam(':max_val', $max_val, PDO::PARAM_STR);

        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

function search_product_by_name() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $name = trim($input['name'] ?? '');

    try {
        $stmt = $pdo->prepare("SELECT * FROM product WHERE name = :name");

        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
        
    } catch (PDOException $e) {
        return [];
    }
}

function update_product() {
    $pdo = Conectiondb(); // Asegúrate de tener tu función de conexión

    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    if (empty($input['id'])) {
        return json_encode(['error' => 'El ID del producto es requerido']);
    }

    $id = (int)$input['id'];
    $fields = [
        'code', 'name', 'description', 'reference', 'format', 
        'price', 'iva', 'rating', 'blend', 
        'winery_id', 'denomination_id', 'category_id', 'vintage_id'
    ];

    // Construir dinámicamente la query
    $setParts = [];
    $params = ['id' => $id];
    foreach ($fields as $field) {
        if (isset($input[$field])) {
            $setParts[] = "$field = :$field";
            $params[$field] = $input[$field];
        }
    }

    if (empty($setParts)) {
        return json_encode(['error' => 'No se enviaron campos para actualizar']);
    }

    $sql = "UPDATE product SET " . implode(', ', $setParts) . " WHERE id = :id";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            return json_encode(['success' => 'Producto actualizado correctamente']);
        } else {
            return json_encode(['warning' => 'No se realizaron cambios']);
        }
    } catch (PDOException $e) {
        return json_encode(['error' => 'Error al actualizar: ' . $e->getMessage()]);
    }
}

function get_clients() {
    $pdo = Conectiondb();

    try {
        $stmt = $pdo->query("
            SELECT id, name, email, phone, address, created_at
            FROM clients
            ORDER BY name
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        return [];
    }
}

function get_product_promotions($product_id) {
    $pdo = Conectiondb();

    try {
        $stmt = $pdo->prepare("
            SELECT *
            FROM promotion
            WHERE product_id = ?
            AND active = 1
            AND (start_date IS NULL OR start_date <= CURDATE())
            AND (end_date IS NULL OR end_date >= CURDATE())
        ");
        $stmt->execute([$product_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        return [];
    }
}


?>
