<?php
/**
 * Archivo para gestionar adopciones (aprobar/rechazar)
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
    
    if (!$data || !isset($data['adopcion_id']) || !isset($data['accion'])) {
        responderError('Datos incompletos', 400);
    }
    
    $adopcion_id = $data['adopcion_id'];
    $accion = $data['accion']; // 'aprobar' o 'rechazar'
    $comentarios = isset($data['comentarios']) ? trim($data['comentarios']) : null;
    $user_id = isset($data['user_id']) ? $data['user_id'] : null;
    
    // Validaciones
    if (empty($adopcion_id) || empty($accion)) {
        responderError('ID de adopción y acción son obligatorios', 400);
    }
    
    if (!in_array($accion, ['aprobar', 'rechazar'])) {
        responderError('Acción no válida. Use "aprobar" o "rechazar"', 400);
    }
    
    // Verificar si la adopción existe y está pendiente
    $stmt = $pdo->prepare("SELECT id, estado FROM adopciones WHERE id = ?");
    $stmt->execute([$adopcion_id]);
    $adopcion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$adopcion) {
        responderError('La adopción no existe', 404);
    }
    
    if ($adopcion['estado'] !== 'pendiente') {
        responderError('La adopción ya ha sido procesada', 400);
    }
    
    // Determinar nuevo estado
    $nuevo_estado = $accion === 'aprobar' ? 'aprobada' : 'rechazada';
    $fecha_aprobacion = $accion === 'aprobar' ? date('Y-m-d') : null;
    
    // Actualizar la adopción
    $stmt = $pdo->prepare("UPDATE adopciones SET estado = ?, fecha_aprobacion = ?, comentarios = ? WHERE id = ?");
    $stmt->execute([$nuevo_estado, $fecha_aprobacion, $comentarios, $adopcion_id]);
    
    // Si se aprobó, actualizar el estado del animal
    if ($accion === 'aprobar') {
        $stmt = $pdo->prepare("UPDATE animales SET estado = 'adoptado', fecha_adopcion = ? WHERE id = (SELECT animal_id FROM adopciones WHERE id = ?)");
        $stmt->execute([$fecha_aprobacion, $adopcion_id]);
    }
    
    $respuesta = [
        'success' => true,
        'message' => 'Adopción ' . $accion . ' exitosamente',
        'accion' => $accion,
        'adopcion_id' => $adopcion_id
    ];
    
    echo json_encode($respuesta);
    
} catch (PDOException $e) {
    error_log("Error gestionando adopción: " . $e->getMessage());
    responderError('Error de conexión con la base de datos', 500);
} catch (Exception $e) {
    error_log("Error general gestionando adopción: " . $e->getMessage());
    responderError('Error interno del servidor', 500);
}
?>