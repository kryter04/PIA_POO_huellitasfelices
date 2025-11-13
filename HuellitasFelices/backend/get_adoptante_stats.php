<?php
/**
 * API para obtener estadísticas del adoptante
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
    
    // Contar animales disponibles
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM animales WHERE estado = 'disponible'");
    $stmt->execute();
    $totalAnimales = $stmt->fetch()['total'];
    
    // Contar solicitudes de adopción del usuario
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM adopciones WHERE adoptante_id = ?");
    $stmt->execute([$user_id]);
    $misSolicitudes = $stmt->fetch()['total'];
    
    // Contar adopciones aprobadas del usuario
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM adopciones WHERE adoptante_id = ? AND estado = 'aprobada'");
    $stmt->execute([$user_id]);
    $adopcionesAprobadas = $stmt->fetch()['total'];
    
    // Devolver los datos
    echo json_encode([
        'success' => true,
        'total_animales' => $totalAnimales,
        'mis_solicitudes' => $misSolicitudes,
        'adopciones_aprobadas' => $adopcionesAprobadas
    ]);
    
} catch (PDOException $e) {
    error_log("Error en get_adoptante_stats.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en get_adoptante_stats.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>