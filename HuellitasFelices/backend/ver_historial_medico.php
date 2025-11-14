<?php
/**
 * API para ver historial médico de animales
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
    
    // Obtener parámetros de la solicitud
    $animal_id = (int)($_GET['animal_id'] ?? 0);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    // Consulta base
    $sql = "SELECT rm.*, a.nombre as animal_nombre, a.tipo as animal_tipo,
                   v.nombre as veterinario_nombre, v.apellido as veterinario_apellido
            FROM revisiones_medicas rm
            JOIN animales a ON rm.animal_id = a.id
            JOIN usuarios v ON rm.veterinario_id = v.id";
    
    // Parámetros para la consulta
    $params = [];
    
    // Filtro por animal
    if ($animal_id) {
        $sql .= " WHERE rm.animal_id = ?";
        $params[] = $animal_id;
    } else {
        $sql .= " WHERE 1=1";
    }
    
    // Filtro por ID
    if ($id) {
        $sql .= " AND rm.id = ?";
        $params[] = $id;
    }
    
    $sql .= " ORDER BY rm.fecha_revision DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $revisiones = $stmt->fetchAll();
    
    // Formatear las fechas
    foreach ($revisiones as &$revision) {
        if ($revision['fecha_revision']) {
            $revision['fecha_revision'] = date('d/m/Y', strtotime($revision['fecha_revision']));
        }
        if ($revision['proxima_cita']) {
            $revision['proxima_cita'] = date('d/m/Y', strtotime($revision['proxima_cita']));
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $revisiones,
        'count' => count($revisiones)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_historial_medico.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_historial_medico.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
}
?>