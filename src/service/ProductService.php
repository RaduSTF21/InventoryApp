<?php
namespace Stefan\InventoryApp\service;
use PDO;
use PDOException;

class ProductService{
    private PDO $db;
    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAllProducts(?string $search = null, int $page = 1,int $limit = 10):array{
        $offset = ($page - 1) * $limit;
        $total = 0;
        $products = [];
        
        if($search === null){
            $sql = "SELECT COUNT(*) FROM products";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $total = $stmt->fetchColumn();
            $sql = "SELECT * FROM products order by created_at desc LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        else{

            $sql = "SELECT COUNT(*) FROM products WHERE name LIKE :name";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':name', "%$search%");
            $stmt->execute();
            $total = $stmt->fetchColumn();

            $sql = "SELECT * FROM products WHERE name LIKE :name order by created_at desc LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':name', "%$search%");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        return ['data' => $products, 'total' => $total, 'limit' => $limit, 'page' => $page];
    }

    public function addProduct(array $data):bool{   
        try{
            $sql = 'INSERT INTO products (name,description, price, in_stock, availability_date, image_path) VALUES (:name, :description, :price, :in_stock, :availability_date, :image_path);';
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':name', $data['name']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->bindValue(':price', $data['price'], PDO::PARAM_STR);
        $stmt->bindValue(':in_stock', $data['in_stock'], PDO::PARAM_INT);
        $stmt->bindValue(':availability_date', $data['availability_date']);
        $stmt->bindValue(':image_path', $data['image_path']);

        return $stmt->execute();
        }
        catch(PDOException $e){
            error_log('Database error: '.$e->getMessage());
            return false;
        }
    }
    public function deleteProduct(int $id):bool{
        try{
            $sql ='DELETE FROM products WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        }
        catch(PDOException $e){
            error_log('Database error: '.$e->getMessage());
            return false;
        }
    }

    public function getById(int $id):array{
        try{
            $sql = 'SELECT * FROM products WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        }
        catch(PDOException $e){
            error_log('Database error: '.$e->getMessage());
            return [];
        }
    }

    public function updateProduct(int $id, array $data):bool{
        try{
            $sql = 'UPDATE products SET name = :name, description = :description, price = :price, in_stock = :in_stock, availability_date = :availability_date, image_path = :image_path WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':description', $data['description']);
            $stmt->bindValue(':price', $data['price'], PDO::PARAM_STR);
            $stmt->bindValue(':in_stock', $data['in_stock'], PDO::PARAM_INT);
            $stmt->bindValue(':availability_date', $data['availability_date']);
            $stmt->bindValue(':image_path', $data['image_path']);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        }
        catch(PDOException $e){
            error_log('Database error: '.$e->getMessage());
            return false;
        }
    }

}