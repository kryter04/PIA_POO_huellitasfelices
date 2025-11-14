<?php
/**
 * API para ver animales disponibles para adopción (versión para adoptantes)
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario - CORREGIDO PARA USAR SESIÓN PROPIAMENTE
    session_start();
    
    // Verificar si el usuario está logueado
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'No autorizado - Sesión no iniciada'
        ]);
        exit();
    }
    
    // Obtener el rol del usuario
    $stmt = $pdo->prepare("SELECT r.nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
        exit();
    }
    
    $rolUsuario = $usuario['nombre'];
    
    // Verificar permisos según el rol
    $rolesPermitidos = ['admin', 'veterinario', 'empleado', 'adoptante'];
    if (!in_array($rolUsuario, $rolesPermitidos)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'No tienes permisos para acceder a esta sección'
        ]);
        exit();
    }
    
    // Obtener parámetros de la solicitud
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    // Consulta para obtener animales disponibles
    $sql = "SELECT a.*, u.nombre as responsable_nombre, u.apellido as responsable_apellido 
            FROM animales a 
            LEFT JOIN usuarios u ON a.responsable_id = u.id
            WHERE a.estado = 'disponible'";
    
    // Parámetros para la consulta
    $params = [];
    
    // Filtro por ID
    if ($id) {
        $sql .= " AND a.id = ?";
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
    error_log("Error en ver_animales_disponibles.php (adoptantes): " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_animales_disponibles.php (adoptantes): " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
}
?>