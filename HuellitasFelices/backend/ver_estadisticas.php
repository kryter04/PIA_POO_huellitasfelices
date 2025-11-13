<?php
/**
 * API para ver estadísticas del sistema (versión para dashboard)
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'empleado');
    
    // Consultas para obtener estadísticas reales de la base de datos
    $stats = [];
    
    // Contar animales totales
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM animales");
    $stats['total_animales'] = $stmt->fetch()['total'];
    
    // Contar adopciones pendientes
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM adopciones WHERE estado = 'pendiente'");
    $stats['mis_solicitudes'] = $stmt->fetch()['total']; // CORREGIDO: "deadopcion" a "mis_solicitudes"
    
    // Contar adopciones aprobadas
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM adopciones WHERE estado = 'aprobada'");
    $stats['adopciones_aprobadas'] = $stmt->fetch()['total'];
    
    // Contar adoptantes
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 1"); // rol_id = 1 es adoptante
    $stats['total_adoptantes'] = $stmt->fetch()['total'];
    
    echo json_encode([
        'success' => true,
        'total_animales' => $stats['total_animales'],
        'mis_solicitudes' => $stats['mis_solicitudes'], // CORREGIDO
        'adopciones_aprobadas' => $stats['adopciones_aprobadas'],
        'total_adoptantes' => $stats['total_adoptantes']
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_estadisticas.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_estadisticas.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>