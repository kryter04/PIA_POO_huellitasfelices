<?php
/**
 * API para eliminar un empleado
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario (solo admin puede eliminar empleados)
    $rolUsuario = verificarRol($pdo, 'admin');
    
    // Verificar si es una solicitud DELETE
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener el ID del empleado de la URL
    $id = (int)($_GET['id'] ?? 0);
    
    // Validar que se haya proporcionado un ID
    if (empty($id)) {
        throw new Exception('ID de empleado no proporcionado');
    }
    
    // Verificar que el empleado exista
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        throw new Exception('Empleado no encontrado');
    }
    
    // No se puede eliminar al usuario actual
    if ($id == $_SESSION['user_id']) {
        throw new Exception('No puedes eliminarte a ti mismo');
    }
    
    // Eliminar empleado (marcar como inactivo)
    $sql = "UPDATE usuarios SET estado = 'inactivo', fecha_actualizacion = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Empleado eliminado exitosamente'
        ]);
    } else {
        throw new Exception('Error al eliminar el empleado');
    }
    
} catch (PDOException $e) {
    error_log("Error en eliminar_empleado.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en eliminar_empleado.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>