<?php
/**
 * API para ver actividad reciente del dashboard
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
    
    // Consulta para obtener actividad reciente (simulada con datos de ejemplo)
    // En producción, esto se conectaría con las tablas reales de adopciones, revisiones, etc.
    
    $actividades = [
        [
            'title' => 'Solicitud de adopción',
            'description' => 'Nueva solicitud para Max (perro)',
            'time' => date('d/m/Y'),
            'icon' => 'heart'
        ],
        [
            'title' => 'Revisión médica',
            'description' => 'Control de salud para Luna (gato)',
            'time' => date('d/m/Y', strtotime('-1 day')),
            'icon' => 'stethoscope'
        ],
        [
            'title' => 'Nuevo animal',
            'description' => 'Ingreso de Rocky (perro) al sistema',
            'time' => date('d/m/Y', strtotime('-2 days')),
            'icon' => 'paw'
        ],
        [
            'title' => 'Adopción aprobada',
            'description' => 'Solicitud #1234 aprobada',
            'time' => date('d/m/Y', strtotime('-3 days')),
            'icon' => 'check-circle'
        ],
        [
            'title' => 'Nuevo empleado',
            'description' => 'Carlos Martínez se unió al equipo',
            'time' => date('d/m/Y', strtotime('-5 days')),
            'icon' => 'users'
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $actividades,
        'count' => count($actividades)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_actividad.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_actividad.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>