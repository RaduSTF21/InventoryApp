<?php
require_once __DIR__.'/../../bootstrap.php';
require_once __DIR__.'/../../config/db.php';
use Stefan\InventoryApp\service\ProductService;

switch ($_SERVER['REQUEST_METHOD']){
    case 'GET':
            header('Content-Type: application/json');
            try
            {
                $service = new ProductService($conn);
                $search = $_GET['search'] ?? null;
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $products = $service->getAllProducts($search, $page, $limit);
                echo json_encode($products);
            }
            catch(PDOException $e){
                http_response_code(500);
                echo json_encode(['error' => 'Database error: '.$e->getMessage()]);
            }
            break;
    case 'POST':
            header('Content-Type: application/json');
            try{
                $service = new ProductService($conn);
                $imagePath = null;
                if(isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
                    $uploadDir = __DIR__. '/../uploads/';
                    $fileName = uniqid().'_' . basename($_FILES['image']['name']);
                    $uploadFile = $uploadDir . $fileName;
                    if(move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)){
                        $imagePath =  $fileName;
                    }
                }
                $data = [
                    'name' => $_POST['name'] ?? '',
                    'description' => $_POST['description'] ?? '',
                    'price' => $_POST['price'] ?? 0,
                    'in_stock' => isset($_POST['in_stock']) ? (int)$_POST['in_stock'] : 0,
                    'availability_date' => $_POST['availability_date'] ?? null,
                    'image_path' => $imagePath ?? null
                ];
                $product = $service->addProduct($data);
                echo json_encode(['success' => $product, 'message' => $product ? 'Product added successfully' : 'Failed to add product']);
            }
            catch(PDOException $e){
                http_response_code(500);
                echo json_encode(['error' => 'Database error: '.$e->getMessage()]);
            }
            break;
}
