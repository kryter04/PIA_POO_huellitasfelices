<?php
/**
 * API para actualizar el perfil del usuario
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
    $nombre = trim($input['nombre'] ?? '');
    $apellido = trim($input['apellido'] ?? '');
    $telefono = trim($input['telefono'] ?? '');
    $direccion = trim($input['direccion'] ?? '');
    
    // Validar campos requeridos
    if (empty($user_id) || empty($nombre) || empty($apellido)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Verificar que el usuario exista y sea el mismo que está logueado
    if ($user_id != $_SESSION['user_id']) {
        throw new Exception('No tienes permiso para editar este perfil');
    }
    
    // Actualizar el perfil del usuario
    $sql = "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, fecha_actualizacion = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$nombre, $apellido, $telefono, $direccion, $user_id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar el perfil');
    }
    
} catch (PDOException $e) {
    error_log("Error en update_user_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en update_user_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>