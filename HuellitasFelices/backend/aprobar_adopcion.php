<?php
/**
 * API para aprobar una adopción
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'empleado');
    
    // Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    $adopcion_id = (int)($input['adopcion_id'] ?? 0);
    $accion = trim($input['accion'] ?? ''); // 'aprobar' o 'rechazar'
    $comentarios = trim($input['comentarios'] ?? '');
    
    // Validar campos requeridos
    if (empty($adopcion_id) || empty($accion)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Validar acción
    if (!in_array($accion, ['aprobar', 'rechazar'])) {
        throw new Exception('Acción no válida');
    }
    
    // Verificar que la adopción exista y esté pendiente
    $stmt = $pdo->prepare("SELECT id, animal_id, estado FROM adopciones WHERE id = ?");
    $stmt->execute([$adopcion_id]);
    $adopcion = $stmt->fetch();
    
    if (!$adopcion) {
        throw new Exception('Adopción no encontrada');
    }
    
    if ($adopcion['estado'] !== 'pendiente') {
        throw new Exception('La adopción ya ha sido procesada');
    }
    
    // Preparar el nuevo estado
    $nuevo_estado = ($accion === 'aprobar') ? 'aprobada' : 'rechazada';
    $fecha_cierre = date('Y-m-d');
    
    // Actualizar la adopción
    $sql = "UPDATE adopciones SET estado = ?, comentarios = ?, fecha_aprobacion = ?, fecha_cierre = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $nuevo_estado, $comentarios, ($accion === 'aprobar') ? date('Y-m-d') : null, $fecha_cierre, $adopcion_id
    ]);
    
    if ($result) {
        // Si se aprobó, actualizar el estado del animal
        if ($accion === 'aprobar') {
            $stmt = $pdo->prepare("UPDATE animales SET estado = 'adoptado', fecha_adopcion = ? WHERE id = ?");
            $stmt->execute([$fecha_cierre, $adopcion['animal_id']]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Adopción ' . $accion . ' exitosamente'
        ]);
    } else {
        throw new Exception('Error al procesar la adopción');
    }
    
} catch (PDOException $e) {
    error_log("Error en aprobar_adopcion.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en aprobar_adopcion.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>