<?php
/**
 * API para solicitar adopción de un animal
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// conexion.php se encarga de iniciar la sesión de forma segura
require_once 'conexion.php';

// Iniciar una transacción para asegurar que ambas consultas (UPDATE y INSERT) funcionen
try {
    $pdo->beginTransaction();

    // 1. Verificar el rol del usuario
    $rolUsuario = verificarRol($pdo, 'adoptante');
    
    // 2. Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // 3. Obtener todos los datos de $_POST (enviados por FormData)
    $user_id = (int)($_POST['user_id'] ?? 0);
    $animal_id = (int)($_POST['nombreMascota'] ?? 0); 
    $fecha_solicitud = $_POST['fecha_solicitud'] ?? date('Y-m-d');
    
    // Datos del Perfil (para la tabla 'usuarios')
    $tipo_vivienda = trim($_POST['tipoVivienda'] ?? '');
    $espacio_hogar = floatval($_POST['espacioHogar'] ?? 0);
    $tiempo_cuidado = trim($_POST['tiempoCuidado'] ?? '');
    $experiencia = trim($_POST['experiencia'] ?? '');
    $disponibilidad = !empty($_POST['disponibilidad']);

    // Datos de la Solicitud (para la tabla 'adopciones')
    $motivo = trim($_POST['motivo'] ?? '');
    
    // 4. Validar campos requeridos
    if (empty($user_id) || empty($animal_id) || empty($fecha_solicitud) || empty($tipo_vivienda) || empty($tiempo_cuidado) || empty($experiencia) || empty($motivo)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // 5. Validar que el usuario exista
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Usuario no encontrado');
    }
    
    // 6. Validar que el animal exista y esté disponible
    $stmt = $pdo->prepare("SELECT id, estado FROM animales WHERE id = ?");
    $stmt->execute([$animal_id]);
    $animal = $stmt->fetch();
    
    if (!$animal) {
        throw new Exception('Animal no encontrado');
    }
    
    if ($animal['estado'] !== 'disponible') {
        throw new Exception('El animal no está disponible para adopción');
    }
    
    // 7. Verificar si ya existe una solicitud pendiente
    $stmt = $pdo->prepare("SELECT id FROM adopciones WHERE animal_id = ? AND adoptante_id = ? AND estado = 'pendiente'");
    $stmt->execute([$animal_id, $user_id]);
    if ($stmt->fetch()) {
        throw new Exception('Ya tienes una solicitud pendiente para este animal');
    }
    
    // --- PASO 8 (NUEVO): Actualizar el perfil del usuario ---
    // Usamos los nombres de columna snake_case de tu tabla `usuarios`
    $sql_update_user = "UPDATE usuarios 
                        SET tipo_vivienda = ?, espacio_hogar = ?, tiempo_cuidado = ?, experiencia = ?, disponibilidad = ?
                        WHERE id = ?";
    $stmt_user = $pdo->prepare($sql_update_user);
    $stmt_user->execute([
        $tipo_vivienda, 
        $espacio_hogar, 
        $tiempo_cuidado, 
        $experiencia, 
        $disponibilidad,
        $user_id
    ]);


    // --- PASO 9 (CORREGIDO): Insertar SOLO las columnas que existen en la tabla `adopciones` ---
    $sql_insert = "INSERT INTO adopciones (animal_id, adoptante_id, fecha_solicitud, motivo, estado) 
                   VALUES (?, ?, ?, ?, 'pendiente')";
    
    $stmt_insert = $pdo->prepare($sql_insert);
    $result = $stmt_insert->execute([
        $animal_id, 
        $user_id, 
        $fecha_solicitud, 
        $motivo
    ]);
    
    if ($result) {
        // Actualizar el estado del animal a "en_adopcion"
        $stmt_animal = $pdo->prepare("UPDATE animales SET estado = 'en_adopcion' WHERE id = ?");
        $stmt_animal->execute([$animal_id]);
        
        // Confirmar la transacción
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Solicitud de adopción enviada exitosamente'
        ]);
    } else {
        throw new Exception('Error al enviar la solicitud de adopción');
    }
    
} catch (PDOException $e) {
    // Revertir la transacción si algo falló
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Error PDO en solicitar_adopcion.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: Error de base de datos'
        // 'debug' => $e->getMessage() // Descomenta esto si SIGUE fallando
    ]);
} catch (Exception $e) {
    // Revertir la transacción si algo falló
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Error general en solicitar_adopcion.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage() // Enviar el mensaje de error específico
    ]);
}
?>