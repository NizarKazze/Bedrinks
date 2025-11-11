<?php
header('Content-Type: application/json');
require_once 'db/connection.php';

// 🧩 ---------- PROPOSALS ----------

// ✅ Create proposal
function create_proposal($client_id, $products = []) {
    $pdo = Conectiondb();
    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO proposals (status) VALUES ('pending')");
        $stmt->execute();
        $proposal_id = $pdo->lastInsertId();

        $stmt = $pdo->prepare("INSERT INTO history (client_id, proposal_id) VALUES (?, ?)");
        $stmt->execute([$client_id, $proposal_id]);

        $total = 0;
        if (!empty($products)) {
            $stmtProd = $pdo->prepare("INSERT INTO proposal_products (proposal_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
            foreach ($products as $p) {
                $stmtProd->execute([$proposal_id, $p['product_id'], $p['quantity'], $p['price']]);
                $total += $p['quantity'] * $p['price'];
            }
        }

        $stmt = $pdo->prepare("UPDATE proposals SET total = ? WHERE id = ?");
        $stmt->execute([$total, $proposal_id]);

        $pdo->commit();
        return ["success" => true, "proposal_id" => $proposal_id];

    } catch (PDOException $e) {
        $pdo->rollBack();
        return ["success" => false, "error" => $e->getMessage()];
    }
}

// ✅ Get client proposals history
function get_history_by_client($client_id) {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->prepare("
            SELECT p.id AS proposal_id, p.status, p.total, p.created_at
            FROM history h
            INNER JOIN proposals p ON h.proposal_id = p.id
            WHERE h.client_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$client_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

// ✅ Get full proposal details
function get_proposal_details($proposal_id) {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->prepare("
            SELECT p.id, p.status, p.total, p.created_at,
                   pr.id AS product_id, pr.name AS product_name, pp.quantity, pp.price
            FROM proposals p
            LEFT JOIN proposal_products pp ON p.id = pp.proposal_id
            LEFT JOIN products pr ON pr.id = pp.product_id
            WHERE p.id = ?
        ");
        $stmt->execute([$proposal_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

// ✅ Update proposal status
function update_proposal_status($proposal_id, $status) {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->prepare("UPDATE proposals SET status = ? WHERE id = ?");
        $stmt->execute([$status, $proposal_id]);
        return ["success" => true];
    } catch (PDOException $e) {
        return ["success" => false, "error" => $e->getMessage()];
    }
}

// 🧩 ---------- CLIENTS CRUD ----------

// ✅ Add new client
function add_client($data) {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->prepare("INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['address']
        ]);
        return ["success" => true, "client_id" => $pdo->lastInsertId()];
    } catch (PDOException $e) {
        return ["success" => false, "error" => $e->getMessage()];
    }
}

// ✅ Update client
function update_client($id, $data) {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->prepare("UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['address'],
            $id
        ]);
        return ["success" => true];
    } catch (PDOException $e) {
        return ["success" => false, "error" => $e->getMessage()];
    }
}

// ✅ Delete client
function delete_client($id) {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
        $stmt->execute([$id]);
        return ["success" => true];
    } catch (PDOException $e) {
        return ["success" => false, "error" => $e->getMessage()];
    }
}

// ✅ Get all clients
function get_all_clients() {
    $pdo = Conectiondb();
    try {
        $stmt = $pdo->query("SELECT * FROM clients ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [];
    }
}

// 🧩 ---------- ROUTER / API HANDLER ----------

$action = $_GET['action'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

switch ($action) {

    // --- PROPOSALS ---
    case 'create-proposal':
        echo json_encode(create_proposal($input['client_id'], $input['products'] ?? []));
        break;

    case 'get-history-by-client':
        echo json_encode(get_history_by_client($_GET['client_id']));
        break;

    case 'get-proposal-details':
        echo json_encode(get_proposal_details($_GET['proposal_id']));
        break;

    case 'update-proposal-status':
        echo json_encode(update_proposal_status($input['proposal_id'], $input['status']));
        break;

    // --- CLIENTS ---
    case 'add-client':
        echo json_encode(add_client($input));
        break;

    case 'update-client':
        echo json_encode(update_client($input['id'], $input));
        break;

    case 'delete-client':
        echo json_encode(delete_client($input['id']));
        break;

    case 'get-all-clients':
        echo json_encode(get_all_clients());
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
        break;
}
?>
