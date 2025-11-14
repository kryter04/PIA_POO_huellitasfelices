<?php
/**
 * API para ver adopciones
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
    
    // --- CORRECCIÓN ---
    // Consulta base expandida para incluir TODOS los detalles necesarios
    $sql = "SELECT 
                ad.*, 
                a.nombre as animal_nombre, 
                a.tipo as animal_tipo, 
                a.raza as animal_raza,
                a.edad as animal_edad,
                a.sexo as animal_sexo,
                u.nombre as adoptante_nombre, 
                u.apellido as adoptante_apellido, 
                u.email as adoptante_email,
                u.telefono as adoptante_telefono, 
                u.direccion as adoptante_direccion,
                u.tipo_vivienda as adoptante_tipo_vivienda,
                u.espacio_hogar as adoptante_espacio_hogar,
                u.tiempo_cuidado as adoptante_tiempo_cuidado,
                u.experiencia as adoptante_experiencia
            FROM adopciones ad
            JOIN animales a ON ad.animal_id = a.id
            JOIN usuarios u ON ad.adoptante_id = u.id";
    
    // Parámetros para la consulta
    $params = [];
    
    // Filtro por ID
    if ($id) {
        $sql .= " WHERE ad.id = ?";
        $params[] = $id;
    } else {
        $sql .= " WHERE 1=1";
    }
    
    $sql .= " ORDER BY ad.fecha_solicitud DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $adopciones = $stmt->fetchAll();
    
    // Formatear las fechas
    foreach ($adopciones as &$adopcion) {
        if ($adopcion['fecha_solicitud']) {
            $adopcion['fecha_solicitud'] = date('d/m/Y', strtotime($adopcion['fecha_solicitud']));
        }
        if ($adopcion['fecha_aprobacion']) {
            $adopcion['fecha_aprobacion'] = date('d/m/Y', strtotime($adopcion['fecha_aprobacion']));
        }
        if ($adopcion['fecha_cierre']) {
            $adopcion['fecha_cierre'] = date('d/m/Y', strtotime($adopcion['fecha_cierre']));
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $adopciones,
        'count' => count($adopciones)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en ver_adopciones.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en ver_adopciones.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
}
?>