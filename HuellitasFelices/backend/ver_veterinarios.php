<?php
/**
 * Archivo para obtener la lista de veterinarios
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    manejarError('Método no permitido', 405);
}

try {
    $conexion = new Conexion();
    $pdo = $conexion->getConexion();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($data['user_id']) ? $data['user_id'] : null;
    
    // Verificar si el usuario está autenticado
    if (!$user_id) {
        responderError('Usuario no autenticado', 401);
    }
    
    // Consulta para obtener veterinarios (usuarios con rol de veterinario)
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nombre,
            u.apellido,
            u.email,
            u.telefono,
            u.direccion,
            u.estado,
            u.fecha_registro,
            u.fecha_ultimo_login,
            r.nombre as rol_nombre
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE r.nombre = 'veterinario'
        ORDER BY u.fecha_registro DESC
    ");
    
    $stmt->execute();
    $veterinarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $respuesta = [
        'success' => true,
        'data' => $veterinarios,
        'count' => count($veterinarios)
    ];
    
    echo json_encode($respuesta);
    
} catch (PDOException $e) {
    error_log("Error obteniendo veterinarios: " . $e->getMessage());
    responderError('Error de conexión con la base de datos', 500);
} catch (Exception $e) {
    error_log("Error general obteniendo veterinarios: " . $e->getMessage());
    responderError('Error interno del servidor', 500);
}
?>