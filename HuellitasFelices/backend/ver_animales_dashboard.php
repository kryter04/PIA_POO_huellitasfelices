<?php
/**
 * API para ver animales (versión para dashboard - todos los animales)
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
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    // Consulta para obtener todos los animales
    $sql = "SELECT a.*, u.nombre as responsable_nombre, u.apellido as responsable_apellido 
            FROM animales a 
            LEFT JOIN usuarios u ON a.responsable_id = u.id";
    
    // Parámetros para la consulta
    $params = [];
    
    // Filtro por ID
    if ($id) {
        $sql .= " WHERE a.id = ?";
        $params[] = $id;
    }
    
    $sql .= " ORDER BY a.fecha_ingreso DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $animales = $stmt->fetchAll();
    
    // Formatear las fechas
    foreach ($animales as &$animal) {
        if ($animal['fecha_ingreso']) {
            $animal['fecha_ingreso'] = date('d/m/Y', strtotime($animal['fecha_ingreso']));
        }
        if ($animal['fecha_adopcion']) {
            $animal['fecha_adopcion'] = date('d/m/Y', strtotime($animal['fecha_adopcion']));
        }
        if ($animal['fecha_ultima_revision']) {
            $animal['fecha_ultima_revision'] = date('d/m/Y', strtotime($animal['fecha_ultima_revision']));
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $animales,
        'count' => count($animales)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_animales_dashboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_animales_dashboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
}
?>