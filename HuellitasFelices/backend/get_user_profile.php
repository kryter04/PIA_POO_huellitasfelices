<?php
/**
 * API para obtener el perfil del usuario (Versión Híbrida)
 * Sirve tanto para el adoptante (ver su propio perfil)
 * como para el empleado (ver el perfil de un adoptante)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php'; // Carga la función verificarRol y $pdo

try {
    // 1. Verificar el rol del usuario logueado (requiere al menos ser 'adoptante')
    $rolUsuarioLogueado = verificarRol($pdo, 'adoptante');
    
    // 2. Determinar qué perfil se está solicitando
    $target_user_id = 0;
    
    // Escenario A: Un empleado/admin busca un perfil específico por URL
    // (Usado por veradoptantes.js)
    if (isset($_GET['id']) && ($rolUsuarioLogueado === 'empleado' || $rolUsuarioLogueado === 'veterinario' || $rolUsuarioLogueado === 'admin')) {
        $target_user_id = (int)$_GET['id'];
    } 
    // Escenario B: Un adoptante busca su propio perfil
    // (Usado por perfil.js)
    else {
        // Obtener el ID del adoptante (ya sea de la sesión o del body)
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id_body = (int)($input['user_id'] ?? 0);
        
        $target_user_id = $user_id_body ?: $_SESSION['user_id'];
        
        // Medida de seguridad: Un adoptante SÓLO puede ver su propio perfil
        if ($rolUsuarioLogueado === 'adoptante' && $target_user_id !== $_SESSION['user_id']) {
            throw new Exception('No tienes permiso para ver este perfil');
        }
    }

    // 3. Validar que tengamos un ID
    if (empty($target_user_id)) {
        throw new Exception('ID de usuario no proporcionado o no válido');
    }
    
    // 4. Consultar los datos del usuario
    $stmt = $pdo->prepare("
        SELECT id, nombre, apellido, email, telefono, direccion, tipo_vivienda, 
               espacio_hogar, tiempo_cuidado, experiencia, disponibilidad, 
               estado, fecha_registro, fecha_actualizacion as ultima_actualizacion
        FROM usuarios 
        WHERE id = ?
    ");
    $stmt->execute([$target_user_id]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC); 
    
    if (!$usuario) {
        throw new Exception('Usuario no encontrado');
    }

    // 5. Formatear fechas
    $usuario['fecha_registro'] = $usuario['fecha_registro'] ? date('d/m/Y', strtotime($usuario['fecha_registro'])) : null;
    $usuario['ultima_actualizacion'] = $usuario['ultima_actualizacion'] ? date('d/m/Y', strtotime($usuario['ultima_actualizacion'])) : null;
    $usuario['disponibilidad'] = (bool)$usuario['disponibilidad'];

    // 6. Devolver los datos del usuario DENTRO de una clave 'data'
    echo json_encode([
        'success' => true,
        'data' => $usuario
    ]);
    
} catch (PDOException $e) {
    error_log("Error en get_user_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: PDO'
    ]);
} catch (Exception $e) {
    error_log("Error general en get_user_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>