<?php
/**
 * API para obtener el perfil del usuario
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'adoptante');
    
    // Obtener el ID del usuario de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($input['user_id'] ?? 0);
    
    // Validar que se haya proporcionado un ID de usuario
    if (empty($user_id)) {
        throw new Exception('ID de usuario no proporcionado');
    }
    
    // Consultar los datos del usuario
    $stmt = $pdo->prepare("
        SELECT id, nombre, apellido, email, telefono, direccion, tipo_vivienda, 
               espacio_hogar, tiempo_cuidado, experiencia, disponibilidad, 
               fecha_registro, fecha_actualizacion as ultima_actualizacion
        FROM usuarios 
        WHERE id = ?
    ");
    $stmt->execute([$user_id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Devolver los datos del usuario
    echo json_encode([
        'success' => true,
        'id' => $usuario['id'],
        'nombre' => $usuario['nombre'],
        'apellido' => $usuario['apellido'],
        'email' => $usuario['email'],
        'telefono' => $usuario['telefono'],
        'direccion' => $usuario['direccion'],
        'tipo_vivienda' => $usuario['tipo_vivienda'],
        'espacio_hogar' => $usuario['espacio_hogar'],
        'tiempo_cuidado' => $usuario['tiempo_cuidado'],
        'experiencia' => $usuario['experiencia'],
        'disponibilidad' => (bool)$usuario['disponibilidad'],
        'fecha_registro' => $usuario['fecha_registro'] ? date('d/m/Y', strtotime($usuario['fecha_registro'])) : null,
        'ultima_actualizacion' => $usuario['ultima_actualizacion'] ? date('d/m/Y', strtotime($usuario['ultima_actualizacion'])) : null
    ]);
    
} catch (PDOException $e) {
    error_log("Error en get_user_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en get_user_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>