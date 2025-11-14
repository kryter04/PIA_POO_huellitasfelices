<?php
/**
 * API para cambiar la contraseña del usuario
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'adoptante');
    
    // Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($input['user_id'] ?? 0);
    $current_password = $input['current_password'] ?? '';
    $new_password = $input['new_password'] ?? '';
    
    // Validar campos requeridos
    if (empty($user_id) || empty($current_password) || empty($new_password)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Validar longitud de la nueva contraseña
    if (strlen($new_password) < 6) {
        throw new Exception('La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    // Verificar que el usuario exista
    $stmt = $pdo->prepare("SELECT password_hash FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Verificar la contraseña actual
    if (!password_verify($current_password, $user['password_hash'])) {
        throw new Exception('La contraseña actual es incorrecta');
    }
    
    // Encriptar la nueva contraseña
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Actualizar la contraseña
    $sql = "UPDATE usuarios SET password_hash = ?, fecha_actualizacion = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$new_password_hash, $user_id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar la contraseña');
    }
    
} catch (PDOException $e) {
    error_log("Error en change_password.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en change_password.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>