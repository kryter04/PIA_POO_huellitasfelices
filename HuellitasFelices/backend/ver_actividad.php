<?php
/**
 * API para ver actividad reciente del dashboard (VERSIÓN REAL)
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
    
    // Consulta para obtener actividad reciente (combinando tablas)
    // 1. Nuevas solicitudes de adopción
    $sql = "
        (SELECT 
            'Solicitud' AS tipo_actividad, 
            a.id, 
            a.fecha_solicitud AS fecha, 
            CONCAT('Solicitud para ', an.nombre) AS title, 
            CONCAT('De: ', u.nombre, ' ', u.apellido) AS description, 
            'heart' AS icon
         FROM adopciones a
         JOIN animales an ON a.animal_id = an.id
         JOIN usuarios u ON a.adoptante_id = u.id)
        
        UNION ALL
        
        -- 2. Nuevos animales registrados
        (SELECT 
            'Animal' AS tipo_actividad, 
            id, 
            fecha_ingreso AS fecha, 
            CONCAT(nombre, ' (', tipo, ')') AS title, 
            'Nuevo animal registrado' AS description, 
            'paw' AS icon
         FROM animales)
        
        UNION ALL
        
        -- 3. Nuevas revisiones médicas
        (SELECT 
            'Revision' AS tipo_actividad, 
            rm.id, 
            rm.fecha_revision AS fecha, 
            CONCAT(rm.tipo_revision, ' para ', an.nombre) AS title, 
            CONCAT('Veterinario: ', u.nombre, ' ', u.apellido) AS description, 
            'stethoscope' AS icon
         FROM revisiones_medicas rm
         JOIN animales an ON rm.animal_id = an.id
         JOIN usuarios u ON rm.veterinario_id = u.id)
        
        -- Ordenar todo por fecha y tomar los 5 más recientes
        ORDER BY fecha DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $actividades = $stmt->fetchAll();

    // Formatear las fechas al formato DD/MM/YYYY
    foreach ($actividades as &$actividad) {
        if ($actividad['fecha']) {
            $actividad['time'] = date('d/m/Y', strtotime($actividad['fecha']));
        }
    }
    
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