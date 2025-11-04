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

/*
 * Filtrar productos según uno o varios parámetros
 * Ejemplo: get_products(['type_id' => 2, 'denomination_id' => 5]);
 *
 */

function update_product() {
    $pdo = Conectiondb();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $id = $input['id'] ?? null;
    if (!$id) return ['error' => 'ID del producto requerido.'];

    $code = trim($input['code'] ?? '');
    $name = trim($input['name'] ?? '');
    $description = $input['description'] ?? null;
    $reference = $input['reference'] ?? null;
    $format = $input['format'] ?? null;
    $price = $input['price'] ?? null;
    $iva = $input['iva'] ?? 21;
    $rating = $input['rating'] ?? null;
    $blend = $input['blend'] ?? null;
    $winery_id = $input['winery_id'] ?? null;
    $denomination_id = $input['denomination_id'] ?? null;
    $category_id = $input['category_id'] ?? null;
    $vintage_id = $input['vintage_id'] ?? null;

    try {
        $sql = "UPDATE product SET
                    code = :code,
                    name = :name,
                    description = :description,
                    reference = :reference,
                    format = :format,
                    price = :price,
                    iva = :iva,
                    rating = :rating,
                    blend = :blend,
                    winery_id = :winery_id,
                    denomination_id = :denomination_id,
                    category_id = :category_id,
                    vintage_id = :vintage_id
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':code' => $code,
            ':name' => $name,
            ':description' => $description,
            ':reference' => $reference,
            ':format' => $format,
            ':price' => $price,
            ':iva' => $iva,
            ':rating' => $rating,
            ':blend' => $blend,
            ':winery_id' => $winery_id,
            ':denomination_id' => $denomination_id,
            ':category_id' => $category_id,
            ':vintage_id' => $vintage_id,
            ':id' => $id
        ]);

        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}


function get_products($filters = [], $order = []) {
    $pdo = Conectiondb();

    $query = "SELECT p.* FROM product p";
    $conditions = [];
    $params = [];

    // --- Join si filtramos por proveedor ---
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

    // --- Filtros directos ---
    $map = [
        'category_id' => 'p.category_id',
        'denomination_id' => 'p.denomination_id',
        'winery_id' => 'p.winery_id',
        'vintage_id' => 'p.vintage_id',
    ];

    foreach ($map as $filterKey => $columnName) {
        if (isset($filters[$filterKey])) {
            $filterValue = $filters[$filterKey];

            if (is_array($filterValue)) {
                $paramNameList = [];
                foreach ($filterValue as $index => $singleValue) {
                    $paramName = ":" . $filterKey . "_" . $index;
                    $paramNameList[] = $paramName;
                    $params[$paramName] = $singleValue;
                }
                $conditions[] = "$columnName IN (" . implode(',', $paramNameList) . ")";
            } else {
                $paramName = ":" . $filterKey;
                $conditions[] = "$columnName = $paramName";
                $params[$paramName] = $filterValue;
            }
        }
    }

    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    // --- ORDENAMIENTO ---
    $allowed_order_fields = ['id', 'name', 'price', 'rating', 'iva', 'code', 'category_id'];
    $order_by = 'p.id';
    $order_dir = 'ASC';

    if (isset($order['order_by']) && in_array($order['order_by'], $allowed_order_fields)) {
        $order_by = 'p.' . $order['order_by'];
    }

    if (isset($order['order_dir']) && strtoupper($order['order_dir']) === 'DESC') {
        $order_dir = 'DESC';
    }

    $query .= " ORDER BY $order_by $order_dir";


    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'filters' => $filters,
            'order' => $order,
            'query_debug' => [
                'sql' => $query,
                'params' => $params
            ],
            'products' => $products
        ];
    } catch (PDOException $e) {
        return [
            'filters' => $filters,
            'order' => $order,
            'query_debug' => [
                'sql' => $query,
                'params' => $params
            ],
            'error' => $e->getMessage()
        ];
    }
}

function search_by_name($table, $search) {
    $pdo = Conectiondb();

    $allowedTables = ['category', 'vintage', 'winery', 'supplier'];

    if (!in_array($table, $allowedTables)) {
        return json_encode(['error' => 'Tabla no permitida']);
    }

    $search = trim($search);
    $search = strtolower(remove_accents($search));

    try {
        $sql = "
            SELECT id, name
            FROM $table
            WHERE REPLACE(
                    LOWER(CONVERT(name USING utf8)),
                    ' ',
                    ''
                ) COLLATE utf8_general_ci
                LIKE REPLACE(:search, ' ', '')
            ORDER BY name ASC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':search' => '%' . $search . '%']);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return json_encode($results, JSON_UNESCAPED_UNICODE);
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


?>
