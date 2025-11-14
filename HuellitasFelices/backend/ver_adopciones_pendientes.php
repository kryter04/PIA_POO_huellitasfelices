<?php
/**
 * Archivo para obtener la lista de adopciones pendientes
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    manejarError('Método no permitido', 405);
}

try {
    $conexion = new Conexion();
    $pdo = $conexion->getConexion();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($data['user_id']) ? $data['user_id'] : null;
    
    // Verificar si el usuario está autenticado
    if (!$user_id) {
        responderError('Usuario no autenticado', 401);
    }
    
    // Consulta para obtener adopciones pendientes con información detallada
    $stmt = $pdo->prepare("
        SELECT 
            ad.id,
            ad.fecha_solicitud,
            ad.fecha_aprobacion,
            ad.fecha_cierre,
            ad.motivo,
            ad.estado,
            ad.comentarios,
            ad.created_at,
            ad.updated_at,
            a.id as animal_id,
            a.nombre as animal_nombre,
            a.tipo as animal_tipo,
            a.raza as animal_raza,
            a.sexo as animal_sexo,
            a.edad as animal_edad,
            a.tamano as animal_tamano,
            a.descripcion as animal_descripcion,
            a.estado as animal_estado,
            u.id as adoptante_id,
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
        JOIN usuarios u ON ad.adoptante_id = u.id
        WHERE ad.estado = 'pendiente'
        ORDER BY ad.fecha_solicitud DESC
    ");
    
    $stmt->execute();
    $adopciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $respuesta = [
        'success' => true,
        'data' => $adopciones,
        'count' => count($adopciones)
    ];
    
    echo json_encode($respuesta);
    
} catch (PDOException $e) {
    error_log("Error obteniendo adopciones pendientes: " . $e->getMessage());
    responderError('Error de conexión con la base de datos', 500);
} catch (Exception $e) {
    error_log("Error general obteniendo adopciones pendientes: " . $e->getMessage());
    responderError('Error interno del servidor', 500);
}
?>