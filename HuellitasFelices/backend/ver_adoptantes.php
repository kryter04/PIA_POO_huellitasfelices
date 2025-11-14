<?php
/**
 * API para ver adoptantes
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
    
    // Consulta base
    $sql = "SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.tipo_vivienda, u.espacio_hogar, u.tiempo_cuidado, u.experiencia, u.disponibilidad, u.estado, u.fecha_registro 
            FROM usuarios u 
            JOIN roles r ON u.rol_id = r.id 
            WHERE r.nombre = 'adoptante'";
    
    // Parámetros para la consulta
    $params = [];
    
    // Filtro por ID
    if ($id) {
        $sql .= " AND u.id = ?";
        $params[] = $id;
    }
    
    $sql .= " ORDER BY u.fecha_registro DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $adoptantes = $stmt->fetchAll();
    
    // Formatear las fechas
    foreach ($adoptantes as &$adoptante) {
        if ($adoptante['fecha_registro']) {
            $adoptante['fecha_registro'] = date('d/m/Y', strtotime($adoptante['fecha_registro']));
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $adoptantes,
        'count' => count($adoptantes)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_adoptantes.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_adoptantes.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
}
?>