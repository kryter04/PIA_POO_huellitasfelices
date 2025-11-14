<?php
/**
 * API para obtener la actividad reciente del usuario
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
    
    // Obtener las últimas actividades del usuario (solicitudes de adopción)
    $stmt = $pdo->prepare("
        SELECT a.fecha_solicitud, a.estado, an.nombre as animal_nombre, an.tipo as animal_tipo
        FROM adopciones a
        JOIN animales an ON a.animal_id = an.id
        WHERE a.adoptante_id = ?
        ORDER BY a.fecha_solicitud DESC
        LIMIT 5
    ");
    $stmt->execute([$user_id]);
    $actividades = $stmt->fetchAll();
    
    // Formatear las actividades
    $formattedActivities = [];
    foreach ($actividades as $actividad) {
        $formattedActivities[] = [
            'title' => $actividad['animal_nombre'],
            'description' => 'Solicitud de adopción - ' . ucfirst($actividad['estado']),
            'time' => date('d/m/Y', strtotime($actividad['fecha_solicitud'])),
            'icon' => $actividad['estado'] === 'aprobada' ? 'check-circle' : 
                     ($actividad['estado'] === 'pendiente' ? 'clock' : 'times-circle')
        ];
    }
    
    // Devolver los datos
    echo json_encode([
        'success' => true,
        'data' => $formattedActivities
    ]);
    
} catch (PDOException $e) {
    error_log("Error en get_user_activity.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en get_user_activity.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>