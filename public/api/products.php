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
                $id = $_GET['id'] ?? null;
                $search = $_GET['search'] ?? null;
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;                
                if($id !== null){
                    $product = $service->getById($id);
                        if($product){
                            echo json_encode($product);
                        } else {
                            http_response_code(404);
                            echo json_encode(['error' => 'Product not found']);
                        }
                    } else {
                                $products = $service->getAllProducts($search, $page, $limit);
                                echo json_encode($products);
                        }
                
                }
                catch(PDOException $e){
                    http_response_code(500);
                    echo json_encode(['error' => 'Database error: '.$e->getMessage()]);
                }
                 catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Server error: '.$e->getMessage()]);
                }
            
            break;
    case 'POST':
            header('Content-Type: application/json');
            try{
                $service = new ProductService($conn);
                $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
                $existingProduct = $id ? $service->getById($id) : null;
                if($id && !$existingProduct){
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Product not found']);
                    exit;
                }
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                $imagePath = null;
                if(isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
                    $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                    $uploadDir = __DIR__. '/../uploads/';
                    if(!in_array($extension, $allowedExtensions)){
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Invalid image format. Allowed formats: jpg, jpeg, png, gif']);
                        exit;
                    }
                    $fileName = uniqid().'_' . basename($_FILES['image']['name']);
                    $uploadFile = $uploadDir . $fileName;
                    if(move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)){
                        $imagePath =  $fileName;
                    }
                }
                $price = filter_var($_POST['price'], FILTER_VALIDATE_FLOAT);
                if($price === false || $price < 0){
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid price value']);
                    exit;
                    }
                $name = trim($_POST['name'] ?? '');
                if(empty($name)){
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Product name is required']);
                    exit;
                }
                $date = $_POST['availability_date'] ?? null;
                if($date){
                    $d = DateTime::createFromFormat('Y-m-d', $date);
                    if(!$d || $d->format('Y-m-d') !== $date){
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Invalid date format. Expected format: YYYY-MM-DD']);
                        exit;
                    }
                }
                $data = [
                            'name' => $name,
                            'description' => $_POST['description'] ?? $existingProduct['description'] ?? '',
                            'price' => $price,
                            'in_stock' => isset($_POST['in_stock']) ? 1 : 0 ,
                            'availability_date' => $_POST['availability_date'] ?? $existingProduct['availability_date'] ?? '',
                            'image_path' => $imagePath ?? $existingProduct['image_path'] ?? ''
                
                ];
                
                
                if($id){
                    $product = $service->updateProduct($id, $data);
                    echo json_encode(['success' => $product, 'message' => $product ? 'Product updated successfully' : 'Failed to update product']);

                }
                else{
                    $product = $service->addProduct($data);
                    echo json_encode(['success' => $product, 'message' => $product ? 'Product added successfully' : 'Failed to add product']);

                }
            }
            catch(PDOException $e){
                http_response_code(500);
                echo json_encode(['error' => 'Database error: '.$e->getMessage()]);
            }
            break;
        case 'DELETE':
            header('Content-Type: application/json');
            try{
                $service = new ProductService($conn);
                $id = isset($_GET['id']) ? (int)$_GET['id']:0;
                if($id === 0){
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
                    exit;
                }
                $deleted = $service->deleteProduct($id);
                echo json_encode(['success' => $deleted, 'message' => $deleted ? 'Product deleted successfully' : 'Failed to delete product']);
            }
            catch(PDOException $e){
                http_response_code(500);
                echo json_encode(['error' => 'Database error: '.$e->getMessage()]);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;

}
