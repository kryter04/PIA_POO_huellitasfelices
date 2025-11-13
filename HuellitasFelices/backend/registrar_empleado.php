<?php
/**
 * API para registrar un nuevo empleado
 * Huellitas Felizes - Sistema de Adopción de Mascotas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    // Verificar el rol del usuario (solo admin puede registrar empleados)
    $rolUsuario = verificarRol($pdo, 'admin');
    
    // Verificar si es una solicitud POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    $nombre = trim($input['nombre'] ?? '');
    $apellido = trim($input['apellido'] ?? '');
    $email = trim($input['email'] ?? '');
    $telefono = trim($input['telefono'] ?? '');
    $rol_nombre = trim($input['rol'] ?? 'empleado');
    $estado = trim($input['estado'] ?? 'activo');
    $password = $input['password'] ?? '';
    
    // Validar campos requeridos
    if (empty($nombre) || empty($apellido) || empty($email) || empty($password)) {
        throw new Exception('Campos requeridos incompletos');
    }
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email no válido');
    }
    
    // Validar rol
    $stmt = $pdo->prepare("SELECT id FROM roles WHERE nombre = ? AND nombre IN ('empleado', 'veterinario')");
    $stmt->execute([$rol_nombre]);
    $rol = $stmt->fetch();
    
    if (!$rol) {
        throw new Exception('Rol no válido');
    }
    
    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('Email ya registrado');
    }
    
    // Encriptar contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo empleado
    $sql = "INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol_id, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$nombre, $apellido, $email, $telefono, $password_hash, $rol['id'], $estado]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Empleado registrado exitosamente',
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        throw new Exception('Error al registrar el empleado');
    }
    
} catch (PDOException $e) {
    error_log("Error en registrar_empleado.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error general en registrar_empleado.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>