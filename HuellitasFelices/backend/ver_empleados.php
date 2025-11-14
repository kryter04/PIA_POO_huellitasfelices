<?php
/**
 * API para ver empleados
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario (solo admin puede ver empleados)
    $rolUsuario = verificarRol($pdo, 'admin');
    
    // Obtener parámetros de la solicitud
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    // Consulta para obtener empleados
    $sql = "SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, r.nombre as rol_nombre, u.fecha_registro, u.fecha_actualizacion 
            FROM usuarios u 
            JOIN roles r ON u.rol_id = r.id 
            WHERE r.nombre IN ('empleado', 'veterinario')";
    
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
    $empleados = $stmt->fetchAll();
    
    // Formatear las fechas
    foreach ($empleados as &$empleado) {
        if ($empleado['fecha_registro']) {
            $empleado['fecha_registro'] = date('d/m/Y', strtotime($empleado['fecha_registro']));
        }
        if ($empleado['fecha_actualizacion']) {
            $empleado['fecha_actualizacion'] = date('d/m/Y', strtotime($empleado['fecha_actualizacion']));
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $empleados,
        'count' => count($empleados)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_empleados.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_empleados.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>