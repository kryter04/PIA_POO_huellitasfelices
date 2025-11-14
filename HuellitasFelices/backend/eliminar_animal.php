<?php
/**
 * API para eliminar un animal
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario (solo admin puede eliminar)
    $rolUsuario = verificarRol($pdo, 'admin');
    
    // Verificar si es una solicitud DELETE
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    $animal_id = (int)($input['animal_id'] ?? 0);
    
    // Validar que se haya proporcionado un ID de animal
    if (empty($animal_id)) {
        throw new Exception('ID de animal no proporcionado');
    }
    
    // Verificar que el animal exista
    $stmt = $pdo->prepare("SELECT id FROM animales WHERE id = ?");
    $stmt->execute([$animal_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Animal no encontrado');
    }
    
    // Eliminar el animal
    $stmt = $pdo->prepare("DELETE FROM animales WHERE id = ?");
    $result = $stmt->execute([$animal_id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Animal eliminado exitosamente'
        ]);
    } else {
        throw new Exception('Error al eliminar el animal');
    }
    
} catch (PDOException $e) {
    error_log("Error en eliminar_animal.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en eliminar_animal.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>