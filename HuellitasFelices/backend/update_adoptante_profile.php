<?php
/**
 * API para que un empleado/admin actualice el perfil de un adoptante
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php'; // Carga la función verificarRol y $pdo

try {
    // 1. Verificar el rol del usuario logueado
    // Se requiere ser al menos 'empleado' para editar perfiles
    $rolUsuarioLogueado = verificarRol($pdo, 'empleado');
    
    // 2. Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // 3. Obtener datos (vienen de FormData, usamos $_POST)
    $target_user_id = (int)($_POST['user_id'] ?? 0); // ID del adoptante a editar

    // Datos del Perfil
    $telefono = trim($_POST['telefono'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');
    $tipo_vivienda = trim($_POST['tipo_vivienda'] ?? '');
    $espacio_hogar = floatval($_POST['espacio_hogar'] ?? 0);
    $tiempo_cuidado = trim($_POST['tiempo_cuidado'] ?? '');
    $experiencia = trim($_POST['experiencia'] ?? '');
    $estado = trim($_POST['estado'] ?? '');

    // 4. Validar ID
    if (empty($target_user_id)) {
        throw new Exception('ID de adoptante no proporcionado');
    }

    // 5. Construir la consulta SQL dinámicamente según el rol
    $sql_parts = [
        'telefono = ?',
        'direccion = ?',
        'tipo_vivienda = ?',
        'espacio_hogar = ?',
        'tiempo_cuidado = ?',
        'experiencia = ?'
    ];
    $params = [
        $telefono,
        $direccion,
        $tipo_vivienda,
        $espacio_hogar,
        $tiempo_cuidado,
        $experiencia
    ];

    // 6. PERMISOS: Solo un ADMIN puede cambiar el 'estado'
    if ($rolUsuarioLogueado === 'admin' && !empty($estado)) {
        $sql_parts[] = 'estado = ?';
        $params[] = $estado;
    }

    // Añadir el ID del usuario al final de los parámetros para el WHERE
    $params[] = $target_user_id;

    $sql = "UPDATE usuarios SET " . implode(', ', $sql_parts) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Perfil del adoptante actualizado exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar el perfil');
    }
    
} catch (PDOException $e) {
    error_log("Error en update_adoptante_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: Error de base de datos'
        // 'debug' => $e->getMessage() // Descomenta para depuración
    ]);
} catch (Exception $e) {
    error_log("Error general en update_adoptante_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>