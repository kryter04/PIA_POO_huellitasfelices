<?php
/**
 * API para solicitar adopción de un animal
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'adoptante');
    
    // Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($input['user_id'] ?? 0);
    $animal_id = (int)($input['animal_id'] ?? 0);
    $fecha_solicitud = $input['fecha_solicitud'] ?? date('Y-m-d');
    $tipo_vivienda = trim($input['tipo_vivienda'] ?? '');
    $espacio_hogar = floatval($input['espacio_hogar'] ?? 0);
    $tiempo_cuidado = trim($input['tiempo_cuidado'] ?? '');
    $experiencia = trim($input['experiencia'] ?? '');
    $motivo = trim($input['motivo'] ?? '');
    $disponibilidad = $input['disponibilidad'] ?? false;
    
    // Validar campos requeridos
    if (empty($user_id) || empty($animal_id) || empty($fecha_solicitud) || empty($tipo_vivienda) || empty($tiempo_cuidado) || empty($experiencia) || empty($motivo)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Validar que el usuario exista
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Validar que el animal exista y esté disponible
    $stmt = $pdo->prepare("SELECT id, estado FROM animales WHERE id = ?");
    $stmt->execute([$animal_id]);
    $animal = $stmt->fetch();
    
    if (!$animal) {
        throw new Exception('Animal no encontrado');
    }
    
    if ($animal['estado'] !== 'disponible') {
        throw new Exception('El animal no está disponible para adopción');
    }
    
    // Verificar si ya existe una solicitud pendiente para este animal
    $stmt = $pdo->prepare("SELECT id FROM adopciones WHERE animal_id = ? AND adoptante_id = ? AND estado = 'pendiente'");
    $stmt->execute([$animal_id, $user_id]);
    if ($stmt->fetch()) {
        throw new Exception('Ya tienes una solicitud pendiente para este animal');
    }
    
    // Preparar la consulta SQL
    $sql = "INSERT INTO adopciones (animal_id, adoptante_id, fecha_solicitud, motivo, tipo_vivienda, espacio_hogar, tiempo_cuidado, experiencia, disponibilidad, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$animal_id, $user_id, $fecha_solicitud, $motivo, $tipo_vivienda, $espacio_hogar, $tiempo_cuidado, $experiencia, $disponibilidad]);
    
    if ($result) {
        // Actualizar el estado del animal a "en_adopcion"
        $stmt = $pdo->prepare("UPDATE animales SET estado = 'en_adopcion' WHERE id = ?");
        $stmt->execute([$animal_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Solicitud de adopción enviada exitosamente'
        ]);
    } else {
        throw new Exception('Error al enviar la solicitud de adopción');
    }
    
} catch (PDOException $e) {
    error_log("Error en solicitar_adopcion.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en solicitar_adopcion.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>